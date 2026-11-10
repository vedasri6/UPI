import os
import re
import ipaddress
from urllib.parse import urlparse
import logging
from flask import Blueprint, request, jsonify
from services.gemini_service import GeminiService, GeminiConfigError, GeminiAPIError, GeminiServiceError
from services.url_reputation_service import UrlReputationService
from services.upi_service import UpiService
from models.ai_chat_model import AIChatModel

logger = logging.getLogger(__name__)

ai_bp = Blueprint('ai', __name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'pdf'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# 1. POST /api/ai/chat
@ai_bp.route('/api/ai/chat', methods=['POST'])
def chat():
    """
    Cyber Security AI Assistant Chat Endpoint.
    Accepts user question, conversation history for context continuity, and language ('en' | 'te').
    Returns personalized cybersecurity guidance from Gemini AI.
    """
    try:
        data = request.get_json(silent=True) or {}
        question = data.get('question', '').strip()
        language = data.get('language', 'en').lower()
        if language not in ('en', 'te'):
            language = 'en'
        user_id = data.get('userId', 'anonymous')
        history = data.get('history', [])

        if not question:
            err_msg = "దయచేసి చెల్లుబాటు అయ్యే యూపీఐ భద్రతా ప్రశ్నను నమోదు చేయండి." if language == 'te' else "Please enter a valid cybersecurity or digital payment safety question."
            return jsonify({
                'success': False, 
                'answer': err_msg,
                'message': 'Question is required'
            }), 400

        # Check if question references a web URL to ground Gemini with live threat intelligence
        url_match = re.search(r'(https?://[^\s]+)', question)
        prompt_for_ai = question
        link_analysis_meta = None
        if url_match:
            detected_url = url_match.group(1).rstrip('.,;!?"\')]}')
            try:
                rep = UrlReputationService.check_url(detected_url, language=language)
                link_analysis_meta = rep
                rep_provider = rep.get('source', 'Threat Intelligence')
                rep_status = rep.get('status', 'Unable to Verify')
                rep_reason = rep.get('reason', '')
                rep_action = rep.get('action', '')
                
                # Ground Gemini so it explains real live scan findings instead of claiming checks are unavailable
                grounding_note = (
                    f"[LIVE SECURITY DATABASE CHECK ({rep_provider}) for {detected_url}]:\n"
                    f"Result: {rep_status}\n"
                    f"Details: {rep_reason}\n"
                    f"Action: {rep_action}\n"
                    f"(Use this verified live database scan result to directly answer the user's question. Do not state that live checks are unavailable. Never state any URL is 100% safe).\n\n"
                )
                prompt_for_ai = grounding_note + question
            except Exception as e:
                logger.debug(f"Live URL reputation grounding error: {e}")

        # Generate personalized response using Gemini Service with conversation history context
        try:
            answer = GeminiService.generate_content(prompt_for_ai, language=language, history=history)
        except GeminiConfigError as cfg_err:
            logger.warning(f"Gemini configuration error: {cfg_err}")
            return jsonify({
                'success': False,
                'error': cfg_err.error_code,
                'message': str(cfg_err),
                'answer': str(cfg_err),
                'question': question,
                'language': language
            }), 503
        except GeminiAPIError as api_err:
            logger.error(f"Gemini API error ({api_err.error_code}): {api_err}")
            status_map = {
                "API_KEY_INVALID": 401,
                "QUOTA_EXCEEDED": 429,
                "MODEL_OVERLOADED": 503,
                "NETWORK_ERROR": 504
            }
            http_status = status_map.get(api_err.error_code, 502)
            return jsonify({
                'success': False,
                'error': api_err.error_code,
                'message': str(api_err),
                'answer': str(api_err),
                'question': question,
                'language': language
            }), http_status
        except Exception as gen_err:
            logger.error(f"AI Service error: {gen_err}")
            return jsonify({
                'success': False,
                'error': 'AI_SERVICE_ERROR',
                'message': str(gen_err),
                'answer': str(gen_err),
                'question': question,
                'language': language
            }), 500

        # Save to MongoDB AIChats (gracefully handles database absence)
        saved_doc = {}
        try:
            saved_doc = AIChatModel.save_chat(user_id=user_id, question=question, answer=answer, language=language, category="chat")
        except Exception:
            pass

        return jsonify({
            'success': True,
            'answer': answer,
            'question': question,
            'language': language,
            'linkAnalysis': link_analysis_meta,
            'chatId': saved_doc.get('_id', 'chat_demo_id') if saved_doc else 'chat_demo_id',
            'timestamp': saved_doc.get('timestamp') if saved_doc else None
        }), 200
    except Exception as exc:
        logger.error(f"Unexpected chat route exception: {exc}")
        fallback_lang = 'te' if (request.get_json(silent=True) or {}).get('language') == 'te' else 'en'
        err_msg = (
            f"సర్వర్ లోపం: {str(exc)}"
            if fallback_lang == 'te'
            else f"Internal server error: {str(exc)}"
        )
        return jsonify({
            "success": False,
            "error": "SERVER_ERROR",
            "message": err_msg,
            "answer": err_msg
        }), 500


# 2. POST /api/ai/analyze-link (SSRF-Protected Link Analysis)
@ai_bp.route('/api/ai/analyze-link', methods=['POST'])
def analyze_link():
    """
    Analyzes web links for phishing, malware, typosquatting, lookalike domains, and unverified shorteners.
    Includes strict Server-Side Request Forgery (SSRF) protection with DNS resolution and safe redirect inspection.
    Returns standard fraud fields and formatted analysis in English or Telugu without raw markdown asterisks.
    """
    try:
        data = request.get_json(silent=True) or {}
        raw_url = data.get('url', '').strip()
        language = data.get('language', 'en').lower()
        if language not in ('en', 'te'):
            language = 'en'

        if not raw_url:
            msg = "దయచేసి పరిశీలించాల్సిన వెబ్‌సైట్ లింక్‌ను నమోదు చేయండి." if language == 'te' else "Please enter a website link URL to analyze."
            return jsonify({
                'success': False, 
                'message': msg,
                'status': 'Invalid Request',
                'riskLevel': 'Invalid Request',
                'reason': 'No link URL provided.',
                'safetyAdvice': 'Please enter a valid URL.'
            }), 400

        # Check for any URI scheme (e.g. javascript:, ftp:, file:, http:, https:)
        scheme_match = re.match(r'^([a-zA-Z][a-zA-Z0-9+\-.]*):', raw_url)
        if scheme_match:
            detected_scheme = scheme_match.group(1).lower()
            if detected_scheme not in ('http', 'https'):
                reason = "కేవలం HTTP మరియు HTTPS వెబ్ లింక్‌లు మాత్రమే విశ్లేషించబడతాయి." if language == 'te' else "Only standard HTTP and HTTPS web links are permitted."
                advice = "దయచేసి చెల్లుబాటు అయ్యే వెబ్‌సైట్ లింక్‌ను ఎంటర్ చేయండి." if language == 'te' else "Please enter a valid URL beginning with http:// or https://"
                return jsonify({
                    'success': False,
                    'message': 'Invalid URL scheme.',
                    'status': 'Invalid Scheme',
                    'riskLevel': 'Invalid Request',
                    'reason': reason,
                    'safetyAdvice': advice
                }), 400
            test_url = raw_url
        else:
            # Auto-prepend https:// if scheme is missing for parsing
            test_url = f"https://{raw_url}"

        parsed = urlparse(test_url)

        # Validate URL scheme (strictly http / https)
        if parsed.scheme not in ('http', 'https'):
            reason = "కేవలం HTTP మరియు HTTPS వెబ్ లింక్‌లు మాత్రమే విశ్లేషించబడతాయి." if language == 'te' else "Only standard HTTP and HTTPS web links are permitted."
            advice = "దయచేసి చెల్లుబాటు అయ్యే వెబ్‌సైట్ లింక్‌ను ఎంటర్ చేయండి." if language == 'te' else "Please enter a valid URL beginning with http:// or https://"
            return jsonify({
                'success': False,
                'message': 'Invalid URL scheme.',
                'status': 'Invalid Scheme',
                'riskLevel': 'Invalid Request',
                'reason': reason,
                'safetyAdvice': advice
            }), 400

        hostname = (parsed.hostname or '').lower()
        if not hostname:
            return jsonify({
                'success': False,
                'message': 'Invalid URL hostname.',
                'status': 'Invalid Hostname',
                'riskLevel': 'Invalid Request',
                'reason': 'Could not extract valid domain from the provided link.',
                'safetyAdvice': 'Please verify the link address format.'
            }), 400

        # 1. DNS-based SSRF Protection (inspects literal host + resolved IP addresses)
        is_ssrf, ssrf_reason = UrlReputationService.check_hostname_ssrf(hostname)
        if is_ssrf:
            status = "Malicious/Suspicious"
            if language == 'te':
                reason = "ఈ లింక్ అంతర్గత లేదా ప్రైవేట్ నెట్‌వర్క్ ఐపీ చిరునామాను సూచిస్తోంది (SSRF భద్రతా ప్రమాదం)."
                action = "ఈ లింక్‌ను తెరవవద్దు. పంపినవారిని సైబర్ హెల్ప్‌లైన్ 1930 కి రిపోర్ట్ చేయండి."
            else:
                reason = f"The link points to a private, loopback, or reserved internal address (SSRF risk: {ssrf_reason})."
                action = "Do not open this link under any circumstances. Block the sender and report to Helpline 1930."

            formatted = f"Status: {status}\nReason: {reason}\nAction: {action}"

            return jsonify({
                'success': True,
                'url': raw_url,
                'status': status,
                'riskLevel': status,
                'isSafe': False,
                'score': 99,
                'reason': reason,
                'action': action,
                'safetyAdvice': action,
                'formattedAnalysis': formatted,
                'reputationSource': 'DNS SSRF Filter',
                'reputationConfigured': False
            }), 200

        # 2. Punycode (IDN) and Lookalike / Homoglyph / Deceptive Subdomain Detection
        is_lookalike, lookalike_en, lookalike_te = UrlReputationService.check_punycode_and_lookalikes(hostname)
        if is_lookalike:
            status = "Malicious/Suspicious"
            reason = lookalike_te if language == 'te' else lookalike_en
            action = "నకిలీ వెబ్‌సైట్‌ను తెరవవద్దు. మీ యూపీఐ పిన్ లేదా బ్యాంకింగ్ వివరాలు ఎప్పుడూ నమోదు చేయవద్దు." if language == 'te' else "Do not visit this lookalike site. Never enter banking credentials or passwords."
            formatted = f"Status: {status}\nReason: {reason}\nAction: {action}"

            return jsonify({
                'success': True,
                'url': raw_url,
                'status': status,
                'riskLevel': status,
                'isSafe': False,
                'score': 92,
                'reason': reason,
                'action': action,
                'safetyAdvice': action,
                'formattedAnalysis': formatted,
                'reputationSource': 'Heuristic Lookalike Inspector',
                'reputationConfigured': False
            }), 200

        # 3. Safe Redirect Inspection (hop-by-hop without browser)
        redirect_info = UrlReputationService.inspect_redirects_safely(test_url)
        if not redirect_info.get('safe', True):
            status = "Malicious/Suspicious"
            err_type = redirect_info.get('error')
            if language == 'te':
                reason = f"అనుమానాస్పద రీడైరెక్ట్ ప్రమాదం గుర్తించబడింది ({err_type}): {redirect_info.get('reason')}"
                action = "ఈ లింక్‌ను తెరవవద్దు. రీడైరెక్ట్ లూప్ లేదా అనధికారిక గమ్యస్థానానికి మళ్లించే ప్రయత్నం జరిగింది."
            else:
                reason = f"Suspicious redirect behavior detected ({err_type}): {redirect_info.get('reason')}"
                action = "Do not open this link. It attempts an unsafe redirect or redirect loop."

            formatted = f"Status: {status}\nReason: {reason}\nAction: {action}"
            return jsonify({
                'success': True,
                'url': raw_url,
                'status': status,
                'riskLevel': status,
                'isSafe': False,
                'score': 95,
                'reason': reason,
                'action': action,
                'safetyAdvice': action,
                'formattedAnalysis': formatted,
                'reputationSource': 'Safe Redirect Inspector',
                'reputationConfigured': False
            }), 200

        # Target to evaluate (final destination if redirected)
        final_target = redirect_info.get('final_url', test_url)
        parsed_final = urlparse(final_target)
        final_hostname = (parsed_final.hostname or hostname).lower()
        lower_url = final_target.lower()

        # Trusted Official Domains
        trusted_domains = UrlReputationService.TRUSTED_OFFICIAL_DOMAINS

        # URL Shorteners
        shorteners = ['bit.ly', 'tinyurl.com', 'cutt.ly', 'is.gd', 't.co', 'goo.gl', 'shorturl.at', 'rb.gy']

        # Phishing Keywords & Suspicious TLDs
        suspicious_keywords = [
            'pay-bill', 'free-cash', 'lotto', 'kbc', 'reward', 'verify-kyc', 
            'sbi-update', 'upi-refund', 'claim-bonus', 'apk', 'login-bank', 
            'unpaid-bill', 'disconnect-power'
        ]
        suspicious_tlds = ['.apk', '.xyz', '.top', '.tk', '.club', '.work', '.download', '.site', '.online', '.info', '.biz']

        # Local Classification Heuristics
        is_trusted = any(final_hostname == dom or final_hostname.endswith('.' + dom) for dom in trusted_domains)
        is_shortener = any(final_hostname == s or final_hostname.endswith('.' + s) for s in shorteners)
        has_phish_words = any(k in lower_url for k in suspicious_keywords)
        has_suspicious_tld = any(final_hostname.endswith(tld) for tld in suspicious_tlds)
        is_apk = lower_url.endswith('.apk') or final_hostname.endswith('.apk')

        # Query live threat intelligence database (VirusTotal v3 / Google Safe Browsing v4)
        rep_result = UrlReputationService.check_url(final_target, language=language)
        reputation_source = rep_result.get('source', 'None')
        reputation_configured = rep_result.get('configured', False)

        # 4. Critical Local Heuristic: Direct APK download
        if is_apk:
            status = "Malicious/Suspicious"
            score = 98
            is_safe = False
            if language == 'te':
                reason = "ఈ లింక్ నేరుగా APK ఫైల్ డౌన్‌లోడ్‌ను అందిస్తోంది, ఇది బ్యాంకింగ్ మాల్వేర్ లేదా రిమోట్ యాక్సెస్ ప్రమాదం కావచ్చు."
                action = "ఈ APK ఫైల్‌ను ఇన్‌స్టాల్ చేయవద్దు. అధికారిక గూగుల్ ప్లే స్టోర్ లేదా బ్యాంక్ యాప్‌లను మాత్రమే ఉపయోగించండి."
            else:
                reason = "The link serves a direct APK download, which frequently packages mobile banking trojans or spyware."
                action = "Do not download or install this package. Only download apps from official app stores."

        # 5. Live threat intelligence database reported positive threat
        elif rep_result.get('status') == "Malicious/Suspicious":
            status = "Malicious/Suspicious"
            score = rep_result.get('score', 95)
            is_safe = False
            reason = rep_result.get('reason')
            action = rep_result.get('action')

        # 6. Trusted official government / banking portal
        elif is_trusted:
            status = "No known threats detected"
            score = 5
            is_safe = False  # Truthful: never guarantee 100% safe
            if reputation_configured and rep_result.get('status') == "No known threats detected":
                if language == 'te':
                    reason = f"ఈ డొమైన్ అధికారిక భారత ప్రభుత్వ, ఆర్‌బీఐ లేదా బ్యాంకింగ్ పోర్టల్‌కు సంబంధించినది. ప్రత్యక్ష సెక్యూరిటీ డేటాబేస్ ({reputation_source}) లో ఎలాంటి ముప్పులు కనుగొనబడలేదు. గమనిక: ఏ లింక్ కూడా 100% సురక్షితమని హామీ ఇవ్వలేము."
                    action = "అధికారిక సేవలను ఉపయోగించవచ్చు. ఎల్లప్పుడూ బ్రౌజర్‌లో HTTPS గుర్తును నిర్ధారించుకోండి మరియు యూపీఐ పిన్ ఎప్పుడూ చెప్పవద్దు."
                else:
                    reason = f"Matches a recognized official government, regulatory, or banking domain. Live threat database query ({reputation_source}) confirmed no active threats. Note: Never guarantee a URL is 100% safe."
                    action = "Safe to visit official portal. Always verify HTTPS and never share your UPI PIN or OTP."
            else:
                if language == 'te':
                    reason = "ఈ డొమైన్ అధికారిక భారత ప్రభుత్వ, ఆర్‌బీఐ లేదా ప్రామాణిక బ్యాంకింగ్ పోర్టల్‌కు సంబంధించినది (ప్రత్యక్ష బ్లాక్‌లిస్ట్ తనిఖీ నిర్వహించబడలేదు). గమనిక: ఏ లింక్ కూడా 100% సురక్షితమని హామీ ఇవ్వలేము."
                    action = "అధికారిక సేవలను ఉపయోగించవచ్చు. ఎల్లప్పుడూ బ్రౌజర్‌లో HTTPS గుర్తును నిర్ధారించుకోండి మరియు యూపీఐ పిన్ ఎప్పుడూ చెప్పవద్దు."
                else:
                    reason = "Matches a recognized official government, regulatory, or banking domain (no live external blacklist was queried). Note: Never guarantee a URL is 100% safe."
                    action = "Safe to visit official portal. Always verify HTTPS and never share your UPI PIN or OTP."

        # 7. Phishing keywords / suspicious TLD / unverified shortener
        elif is_shortener or has_phish_words or has_suspicious_tld:
            status = "Malicious/Suspicious"
            score = 90
            is_safe = False
            if language == 'te':
                reason = "ఈ లింక్‌లో అన్‌వెరిఫైడ్ షార్ట్‌లింక్ లేదా ఫిషింగ్ కీవర్డ్‌లు ఉన్నాయి, ఇవి సాధారణంగా యూపీఐ మోసాలలో ఉపయోగించబడతాయి."
                action = "ఈ లింక్‌పై క్లిక్ చేయవద్దు మరియు వ్యక్తిగత లేదా బ్యాంకింగ్ వివరాలను ఎప్పుడూ నమోదు చేయవద్దు."
            else:
                reason = "Contains an unverified URL shortener or phishing keywords commonly used to disguise fraudulent payment portals."
                action = "Do not open this link or provide banking details. Verify your transaction directly through the official app."

        # 8. Live threat intelligence result (No known threats detected OR Unable to Verify)
        else:
            status = rep_result.get('status', 'Unable to Verify')
            score = rep_result.get('score', 50)
            is_safe = False
            reason = rep_result.get('reason')
            action = rep_result.get('action')

        formatted = f"Status: {status}\nReason: {reason}\nAction: {action}"

        return jsonify({
            'success': True,
            'url': raw_url,
            'finalUrl': final_target if final_target != raw_url else None,
            'redirectHops': redirect_info.get('hops_count', 0),
            'status': status,
            'riskLevel': status,
            'isSafe': is_safe,
            'score': score,
            'reason': reason,
            'action': action,
            'safetyAdvice': action,
            'whySuspicious': reason,
            'whatToDo': action,
            'formattedAnalysis': formatted,
            'reputationSource': reputation_source,
            'reputationConfigured': reputation_configured,
            'reputationDetails': rep_result.get('details')
        }), 200
    except Exception as exc:
        logger.error(f"Link analysis exception: {exc}")
        fallback_lang = 'te' if (request.get_json(silent=True) or {}).get('language') == 'te' else 'en'
        err_msg = "లింక్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి అపరిచిత లింక్‌లను క్లిక్ చేయవద్దు." if fallback_lang == 'te' else "Could not verify link securely. Do not click unknown links."
        return jsonify({
            'success': False,
            'status': 'Unable to Verify',
            'riskLevel': 'Unable to Verify',
            'isSafe': False,
            'reason': err_msg,
            'safetyAdvice': 'Do not click unknown links. Call 1930 for help.'
        }), 200


# 2b. POST /api/verify-upi and /api/ai/verify-upi (Dedicated Truthful UPI Verifier)
@ai_bp.route('/api/verify-upi', methods=['POST'])
@ai_bp.route('/api/ai/verify-upi', methods=['POST'])
def verify_upi_handle():
    """
    Dedicated UPI VPA handle and phone number verification endpoint.
    Strictly separates UPI handle verification from suspicious URL analysis:
    - Rejects URLs like https://example.com with an informative message and link tester recommendation.
    - Validates standard VPA (username@bank) and 10-digit mobile phone numbers.
    - Never falsely labels a handle as 'SAFE' or 'VERIFIED ACCOUNT' without genuine bank authorization.
    """
    try:
        data = request.get_json(silent=True) or {}
        raw_vpa = data.get('vpa') or data.get('handle') or data.get('query') or ''
        language = data.get('language', 'en').lower()
        if language not in ('en', 'te'):
            language = 'en'
        result = UpiService.verify_handle(raw_vpa, language=language)
        return jsonify(result), 200
    except Exception as exc:
        logger.error(f"UPI verification route error: {exc}")
        return jsonify({
            'success': False,
            'status': 'Verification Error',
            'riskLevel': 'Unable to Verify',
            'isSafe': False,
            'reason': str(exc),
            'action': 'Verify recipient name directly inside your official UPI banking app.'
        }), 500


# 3. POST /api/ai/analyze-sms
@ai_bp.route('/api/ai/analyze-sms', methods=['POST'])
def analyze_sms():
    """
    Analyzes SMS and WhatsApp messages for urgency, impersonation, fake power bills, lottery, and OTP traps.
    Returns standard 4-part fraud fields and formatted analysis in English or Telugu.
    """
    try:
        data = request.get_json(silent=True) or {}
        message = data.get('message', '').strip()
        language = data.get('language', 'en').lower()
        if language not in ('en', 'te'):
            language = 'en'

        if not message:
            err_text = "దయచేసి విశ్లేషించాల్సిన SMS లేదా సందేశాన్ని ఎంటర్ చేయండి." if language == 'te' else "SMS message text is required."
            return jsonify({
                'success': False, 
                'message': err_text,
                'scamType': 'Unknown',
                'riskLevel': 'Invalid Request',
                'reason': 'No SMS text provided.',
                'preventionTips': err_text
            }), 400

        lower = message.lower()

        if any(k in lower for k in ['unpaid', 'disconnect', 'power', 'electricity', 'light bill', 'sim block']):
            scam_type = "Fake Utility / Electricity Bill Disconnection Scam"
            if language == 'te':
                risk_level = "ఎక్కువ (High Risk) — కరెంట్ బిల్లు నకిలీ బెదిరింపు"
                why = "ఈ రాత్రికి విద్యుత్ సరఫరా నిలిపివేయబడుతుందని భయపెట్టి బాధితుల నుండి వ్యక్తిగత మొబైల్ నంబర్లకు లేదా నకిలీ లింక్‌ల ద్వారా తక్షణ చెల్లింపులు చేయించడానికి ప్రయత్నిస్తుంది."
                todo = "విద్యుత్ పంపిణీ సంస్థలు ఎప్పుడూ వ్యక్తిగత నంబర్ల నుండి SMSలు పంపవు. మీ అధికారిక బ్యాంకింగ్ యాప్ ద్వారా మాత్రమే బిల్లు చెల్లించండి."
                notodo = "SMS లో ఇచ్చిన వ్యక్తిగత మొబైల్ నంబర్లకు ఫోన్ చేయవద్దు లేదా వారు చెప్పే యాప్‌లను ఇన్‌స్టాల్ చేయవద్దు."
            else:
                risk_level = "High Risk — Fake Electricity Disconnection Threat"
                why = "Threatens immediate power or service disconnection to induce panic. Legitimate electricity boards never instruct customers to call personal mobile numbers."
                todo = "Pay utility bills exclusively inside official banking apps or the authorized state electricity portal. Check your bill status directly."
                notodo = "Never call personal mobile numbers provided in warning SMS messages, and never transfer money to individual UPI IDs."

        elif any(k in lower for k in ['lotto', 'kbc', 'lottery', '25 lakh', 'won', 'prize', 'lucky draw']):
            scam_type = "Lottery & Prize Money Fraud"
            if language == 'te':
                risk_level = "ఎక్కువ (High Risk) — లాటరీ / బహుమతి మోసం"
                why = "మీరు పాల్గొనని లాటరీ లేదా KBC బహుమతి గెలుచుకున్నారని చెప్పి, దానిని క్లెయిమ్ చేసుకోవడానికి ప్రాసెసింగ్ ఫీజు లేదా జీఎస్టీ పేరుతో ముందస్తు డబ్బు డిమాండ్ చేస్తారు."
                todo = "అనుమానాస్పద లాటరీ మెసేజ్‌లను డిలీట్ చేయండి. పంపినవారిని బ్లాక్ చేయండి."
                notodo = "బహుమతులు లేదా లాటరీ నగదును అందుకోవడానికి ఎప్పుడూ ముందస్తు డిపాజిట్లు లేదా రిజిస్ట్రేషన్ ఫీజులు చెల్లించవద్దు."
            else:
                risk_level = "High Risk — Fake Lottery & Prize Trap"
                why = "Claims you won prize money or a lottery you never entered, while demanding advance 'processing fees' or taxes to release funds."
                todo = "Delete the message and block the sender. Legitimate lotteries never require advance UPI fees."
                notodo = "Never pay advance processing charges or taxes to claim winnings."

        elif any(k in lower for k in ['part time', 'job', 'work from home', 'youtube video', 'daily salary', 'task earn']):
            scam_type = "Fake Part-Time Job / Task Fraud"
            if language == 'te':
                risk_level = "ఎక్కువ (High Risk) — పార్ట్-టైమ్ జాబ్ మోసం"
                why = "యూట్యూబ్ వీడియోలను లైక్ చేయడం లేదా రివ్యూలు రాయడం ద్వారా రోజుకు వేల రూపాయలు సంపాదించవచ్చని నమ్మించి, తర్వాత 'ప్రీపెయిడ్ టాస్క్‌ల' పేరుతో మీ నుండి డబ్బు వసూలు చేస్తారు."
                todo = "అనుమానాస్పద వాట్సాప్ లేదా టెలిగ్రామ్ టాస్క్ గ్రూపుల నుండి వెంటనే వైదొలగండి."
                notodo = "ఉద్యోగం లేదా జీతం పొందడం కోసం ఎప్పుడూ ఎదురు డబ్బులు చెల్లించవద్దు."
            else:
                risk_level = "High Risk — Fake Part-Time Task Scam"
                why = "Promises unrealistically high daily pay for simple tasks (liking videos, rating hotels), then demands 'prepaid deposits' before releasing earned wages."
                todo = "Exit the chat group immediately and report the number. Legitimate employers never charge employees upfront fees."
                notodo = "Never deposit money or send UPI transfers to qualify for job tasks."

        elif any(k in lower for k in ['otp', 'pin', 'verify', 'kyc', 'account block', 'pan link']):
            scam_type = "OTP / KYC Bank Impersonation Trap"
            if language == 'te':
                risk_level = "ఎక్కువ (High Risk) — ఓటీపీ / బ్యాంక్ కేవైసీ మోసం"
                why = "బ్యాంక్ ఖాతా లేదా క్రెడిట్ కార్డు బ్లాక్ అవుతుందని బెదిరిస్తూ రహస్య ఓటీపీ లేదా పిన్ అడగడం ద్వారా మీ ఖాతాలోని నిధులను దొంగిలించడానికి ప్రయత్నిస్తారు."
                todo = "కేవైసీ సమాచారం కోసం నేరుగా మీ బ్యాంక్ శాఖను మాత్రమే సంప్రదించండి. 1930 కి సమాచారం ఇవ్వండి."
                notodo = "ఫోన్ కాల్ లేదా SMS ద్వారా మీ ఓటీపీ, యూపీఐ పిన్, లేదా నెట్ బ్యాంకింగ్ పాస్‌వర్డ్‌లను ఎవరితోనూ పంచుకోవద్దు."
            else:
                risk_level = "High Risk — Bank KYC / OTP Impersonation Trap"
                why = "Impersonates bank staff demanding secret OTPs, PINs, or PAN verification under threat of immediate account suspension."
                todo = "Complete KYC verifications solely by visiting your local branch or official bank app. Report unauthorized attempts to 1930."
                notodo = "NEVER disclose One-Time Passwords (OTP), UPI PINs, or debit card CVVs to anyone under any pretext."

        elif any(k in lower for k in ['loan', 'instant credit', 'pre-approved', 'apk']):
            scam_type = "Instant Fake Loan & Malicious APK Trap"
            if language == 'te':
                risk_level = "ఎక్కువ (High Risk) — నకిలీ లోన్ & ప్రమాదకర APK"
                why = "డాక్యుమెంట్లు లేకుండా తక్షణ లోన్ ఇస్తామని చెప్పి ప్రమాదకరమైన APK ఫైల్‌లను ఇన్‌స్టాల్ చేయమని అడుగుతారు, ఇవి మీ కాంటాక్ట్‌లు మరియు మెసేజ్‌లను దొంగిలిస్తాయి."
                todo = "కేవలం ఆర్‌బీఐ అనుమతి పొందిన బ్యాంకులు లేదా అధికారిక గూగుల్ ప్లే స్టోర్ లోన్ యాప్‌లను మాత్రమే ఉపయోగించండి."
                notodo = "SMS లేదా వాట్సాప్ ద్వారా పంపే ఎలాంటి APK ఫైల్‌లను మీ ఫోన్‌లో ఇన్‌స్టాల్ చేయవద్దు."
            else:
                risk_level = "High Risk — Instant Fake Loan & APK Trap"
                why = "Promotes pre-approved loans requiring zero documentation while distributing malicious APK files designed to steal contacts and SMS OTPs."
                todo = "Apply for credit only through RBI-regulated institutions and download apps strictly from Google Play Store."
                notodo = "Never install APK files sent through messaging apps or unknown links."

        else:
            scam_type = "General Informational Message"
            if language == 'te':
                risk_level = "తక్కువ / సాధారణం (Low Risk / Informational)"
                why = "ఈ సందేశంలో సాధారణంగా కనిపించే మోసపూరిత పదాలు లేదా తక్షణ బెదిరింపులు లేవు."
                todo = "ఎప్పుడైనా అధికారిక కస్టమర్ కేర్ ద్వారా మాత్రమే పంపినవారి గుర్తింపును సరిచూసుకోండి."
                notodo = "ఎలాంటి సందేశం వచ్చినా మీ వ్యక్తిగత యూపీఐ పిన్ లేదా ఓటీపీని ఎవరికీ చెప్పవద్దు."
            else:
                risk_level = "Low Risk / Informational Message"
                why = "The message text does not exhibit typical digital fraud indicators or aggressive extortion urgency."
                todo = "Always verify sender identity through official channels if financial actions are suggested."
                notodo = "Never share authentication credentials (OTP, UPI PIN) regardless of message origin."

        formatted = (
            f"**Risk Level:** {risk_level}\n\n"
            f"**Why it may be suspicious:** {why}\n\n"
            f"**What you should do:** {todo}\n\n"
            f"**What you should never do:** {notodo}"
        ) if language != 'te' else (
            f"**రిస్క్ స్థాయి:** {risk_level}\n\n"
            f"**ఎందుకు అనుమానాస్పదంగా ఉంది:** {why}\n\n"
            f"**మీరు ఏమి చేయాలి:** {todo}\n\n"
            f"**మీరు ఏమి చేయకూడదు:** {notodo}"
        )

        return jsonify({
            'success': True,
            'scamType': scam_type,
            'riskLevel': risk_level,
            'reason': why,
            'preventionTips': todo,
            'whySuspicious': why,
            'whatToDo': todo,
            'whatNotToDo': notodo,
            'formattedAnalysis': formatted
        }), 200
    except Exception:
        fallback_lang = 'te' if (request.get_json(silent=True) or {}).get('language') == 'te' else 'en'
        err_msg = "SMS విశ్లేషణలో లోపం ఏర్పడింది. ఓటీపీ ఎవరితోనూ పంచుకోవద్దు." if fallback_lang == 'te' else "Error analyzing SMS text. Never share OTPs or click unverified links."
        return jsonify({
            'success': False,
            'scamType': 'Phishing Trap Warning',
            'riskLevel': 'High Risk',
            'reason': err_msg,
            'preventionTips': 'Never share OTPs, click unverified links, or send prepaid fees.'
        }), 200


# 4. POST /api/ai/analyze-image
@ai_bp.route('/api/ai/analyze-image', methods=['POST'])
def analyze_image():
    """
    Inspects payment screenshots, receipt images, or transaction vouchers for fake generator fraud.
    Uses multimodal Gemini Vision if configured, or smart cybersecurity template heuristics.
    Returns standard 4-part fraud fields and formatted analysis.
    """
    try:
        filename = "uploaded_image.png"
        image_bytes = None
        mime_type = "image/png"

        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No image file uploaded.',
                'riskLevel': 'Invalid Request',
                'reason': 'Please select a valid screenshot or receipt image.',
                'safetyAdvice': 'Upload a JPG, PNG, or WEBP image up to 10MB.'
            }), 400

        file = request.files['image']
        if not file or not file.filename:
            return jsonify({
                'success': False,
                'message': 'Empty file provided.',
                'riskLevel': 'Invalid Request'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Unsupported file format. Please upload JPG, PNG, WEBP, or PDF.',
                'riskLevel': 'Invalid File Type'
            }), 400

        filename = file.filename
        ext = filename.rsplit('.', 1)[1].lower()
        mime_type = f"image/{ext}" if ext != 'pdf' else 'application/pdf'

        image_bytes = file.read()
        if len(image_bytes) > MAX_CONTENT_LENGTH:
            return jsonify({
                'success': False,
                'message': 'File size exceeds maximum limit of 10MB.',
                'riskLevel': 'File Too Large'
            }), 400

        language = request.form.get('language', 'en').lower()
        if language not in ('en', 'te'):
            language = 'en'

        # Analyze using Gemini Vision
        try:
            analysis_text = GeminiService.analyze_image_content(image_bytes, mime_type=mime_type, language=language)
        except GeminiConfigError as cfg_err:
            return jsonify({
                'success': False,
                'filename': filename,
                'riskLevel': 'Configuration Required',
                'message': str(cfg_err),
                'analysis': str(cfg_err),
                'formattedAnalysis': str(cfg_err)
            }), 503
        except GeminiAPIError as api_err:
            status_map = {
                "API_KEY_INVALID": 401,
                "QUOTA_EXCEEDED": 429,
                "MODEL_OVERLOADED": 503,
                "NETWORK_ERROR": 504
            }
            http_status = status_map.get(api_err.error_code, 502)
            return jsonify({
                'success': False,
                'filename': filename,
                'error': api_err.error_code,
                'riskLevel': 'API Error',
                'message': str(api_err),
                'analysis': str(api_err),
                'formattedAnalysis': str(api_err)
            }), http_status

        if language == 'te':
            risk_level = "అనుమానాస్పద స్క్రీన్‌షాట్ (Suspicious Screenshot)"
            why = "నకిలీ పేమెంట్ యాప్‌లు మరియు ఎడిటింగ్ టూల్స్ ద్వారా నిజమైన బ్యాంక్ లావాదేవీ జరగకుండానే ఫేక్ రసీదులను తయారు చేయవచ్చు. UTR ఫాంట్ లేదా సమయం సరిపోలకపోవచ్చు."
            todo = "వస్తువులు ఇచ్చే ముందు మీ స్వంత బ్యాంకింగ్ యాప్ తెరిచి అసలు ఖాతాలో డబ్బులు జమ అయ్యాయో లేదో రసీదు సరిచూసుకోండి."
            notodo = "కేవలం అవతలి వ్యక్తి చూపించే లేదా వాట్సాప్‌లో పంపే రసీదు స్క్రీన్‌షాట్‌లను నమ్మి వస్తువులు ఇవ్వవద్దు."
        else:
            risk_level = "Suspicious Screenshot / Unable to Verify"
            why = "Scammers use fake payment generator apps to forge payment confirmation screens without executing any transaction. Noticeable flaws often include mismatched UTR fonts, uneven timestamps, or missing bank reference IDs."
            todo = "Always verify your actual bank statement balance or direct bank SMS alert before confirming order fulfillment."
            notodo = "Never trust screenshots alone as proof of payment. Do not send 'refunds' based on recipient-provided screenshots."

        return jsonify({
            'success': True,
            'filename': filename,
            'riskLevel': risk_level,
            'analysis': analysis_text,
            'whySuspicious': why,
            'whatToDo': todo,
            'whatNotToDo': notodo,
            'formattedAnalysis': analysis_text
        }), 200
    except Exception as exc:
        fallback_lang = request.form.get('language', 'en') if request.form else 'en'
        err_msg = (
            f"ఇమేజ్ ప్రాసెసింగ్ లోపం: {str(exc)}"
            if fallback_lang == 'te'
            else f"Image processing error: {str(exc)}"
        )
        return jsonify({
            'success': False,
            'filename': 'image_upload',
            'riskLevel': 'Error',
            'message': err_msg,
            'analysis': err_msg,
            'formattedAnalysis': err_msg
        }), 500


# 5. POST /api/ai/analyze-qr
@ai_bp.route('/api/ai/analyze-qr', methods=['POST'])
def analyze_qr():
    """
    Analyzes QR codes either from uploaded image (decoded with OpenCV) or from raw payload text.
    Detects outgoing payment action, collect/cashback scam traps, and unverified web links.
    Returns standard 4-part fraud fields and formatted analysis.
    """
    try:
        payload = ""
        language = "en"

        # Check if an image file was uploaded
        if 'image' in request.files:
            file = request.files['image']
            language = request.form.get('language', 'en').lower()
            if language not in ('en', 'te'):
                language = 'en'

            if file and file.filename:
                # Read bytes and decode with OpenCV QRCodeDetector
                import cv2
                import numpy as np
                file_bytes = np.frombuffer(file.read(), np.uint8)
                img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

                if img is not None:
                    detector = cv2.QRCodeDetector()
                    decoded_text, points, _ = detector.detectAndDecode(img)
                    if decoded_text and decoded_text.strip():
                        payload = decoded_text.strip()
                    else:
                        # Unable to decode QR from image
                        if language == 'te':
                            risk_level = "ధృవీకరించబడలేదు (Unable to Verify)"
                            why = "అప్‌లోడ్ చేసిన ఇమేజ్‌లో స్పష్టమైన క్యూఆర్ కోడ్ గుర్తించబడలేదు. ఫోటో మసకగా ఉండవచ్చు లేదా కత్తిరించబడి ఉండవచ్చు."
                            todo = "క్యూఆర్ కోడ్ ఫోటో స్పష్టంగా ఉండేలా మళ్ళీ అప్‌లోడ్ చేయండి లేదా క్యూఆర్ వివరాలను ఎంటర్ చేయండి."
                            notodo = "అస్పష్టమైన క్యూఆర్ కోడ్‌లను మీ బ్యాంకింగ్ యాప్‌తో స్కాన్ చేయవద్దు."
                        else:
                            risk_level = "Unable to Verify"
                            why = "No readable QR code pattern could be detected in the uploaded image. The image may be blurry, distorted, or cropped."
                            todo = "Ensure the QR code is clearly focused and well-lit, or paste the payload string / UPI handle directly."
                            notodo = "Never scan unreadable or distorted QR codes received from unverified parties."

                        formatted = (
                            f"**Risk Level:** {risk_level}\n\n"
                            f"**Why it may be suspicious:** {why}\n\n"
                            f"**What you should do:** {todo}\n\n"
                            f"**What you should never do:** {notodo}"
                        ) if language != 'te' else (
                            f"**రిస్క్ స్థాయి:** {risk_level}\n\n"
                            f"**ఎందుకు అనుమానాస్పదంగా ఉంది:** {why}\n\n"
                            f"**మీరు ఏమి చేయాలి:** {todo}\n\n"
                            f"**మీరు ఏమి చేయకూడదు:** {notodo}"
                        )

                        return jsonify({
                            'success': True,
                            'payload': '',
                            'riskLevel': risk_level,
                            'isPaymentQR': False,
                            'warning': why,
                            'whySuspicious': why,
                            'whatToDo': todo,
                            'whatNotToDo': notodo,
                            'formattedAnalysis': formatted
                        }), 200
        else:
            data = request.get_json(silent=True) or {}
            payload = data.get('payload', '').strip()
            language = data.get('language', 'en').lower()
            if language not in ('en', 'te'):
                language = 'en'

        if not payload:
            return jsonify({
                'success': False,
                'payload': '',
                'message': 'No QR code payload or image provided.',
                'riskLevel': 'Invalid Request'
            }), 400

        lower_payload = payload.lower()
        is_payment = False

        if "upi://pay" in lower_payload or "collect" in lower_payload or "mode=02" in lower_payload:
            is_payment = True
            if any(k in lower_payload for k in ['cashback', 'reward', 'prize', 'lotto', 'refund', 'bonus']):
                if language == 'te':
                    risk_level = "ఎక్కువ (High Risk) — నకిలీ క్యాష్‌బ్యాక్ కలెక్ట్ స్కామ్"
                    why = "ఈ క్యూఆర్ కోడ్ మోసపూరిత క్యాష్‌బ్యాక్ పేరుతో సృష్టించబడింది! దీనిని స్కాన్ చేసి పిన్ కొడితే మీ ఖాతా నుండి డబ్బులు కట్ అవుతాయి."
                    todo = "వెంటనే రద్దు చేయండి. బంగారు నియమం గుర్తుంచుకోండి: 'డబ్బులు పొందడానికి క్యూఆర్ కోడ్ స్కాన్ చేయాల్సిన అవసరం లేదు'."
                    notodo = "డబ్బులు లేదా క్యాష్‌బ్యాక్ కోసం ఎప్పుడూ క్యూఆర్ స్కాన్ చేయవద్దు మరియు పిన్ కొట్టవద్దు."
                else:
                    risk_level = "High Risk — Fake Cashback Collect Scam"
                    why = "CRITICAL WARNING: This QR code is configured with fake reward/cashback keywords to trick victims. Scanning this QR code and entering your PIN will instantly DEDUCT funds from your bank account."
                    todo = "Delete the QR code immediately. Remember the Golden Rule: 'Receiving money NEVER requires scanning a QR code or entering a UPI PIN'."
                    notodo = "NEVER scan a QR code under promises of receiving cashback, lottery, or refund deposits."
            else:
                if language == 'te':
                    risk_level = "చెల్లింపు చర్య ప్రారంభించబడుతుంది (Outgoing Payment Debit)"
                    why = "ఈ క్యూఆర్ కోడ్ మీ ఖాతా నుండి మరొకరికి డబ్బులు పంపడానికి (DEBIT) మాత్రమే ఉద్దేశించబడింది. పిన్ కొడితే మీ ఖాతా నుండి డబ్బు బదిలీ అవుతుంది."
                    todo = "మీరు ఎవరికైనా ఉద్దేశపూర్వకంగా డబ్బు పంపుతుంటే మాత్రమే గ్రహీత పేరును ఖచ్చితంగా సరిచూసుకుని కొనసాగించండి."
                    notodo = "మీకు డబ్బులు వస్తాయని ఎవరైనా చెబితే ఈ క్యూఆర్ స్కాన్ చేయవద్దు."
                else:
                    risk_level = "Outgoing Payment Debit Required"
                    why = "This QR code initiates an OUTGOING PAYMENT (DEBIT). Entering your UPI PIN will transfer money OUT of your bank account to the payee."
                    todo = "Verify the merchant / payee display name carefully before authorizing the payment."
                    notodo = "NEVER enter your UPI PIN if someone claims this QR code is for receiving money into your account."

        elif "http" in lower_payload or "www." in lower_payload:
            is_payment = False
            if language == 'te':
                risk_level = "సమాచార వెబ్ క్యూఆర్ (Informational Web Link)"
                why = "ఈ క్యూఆర్ కోడ్ బయటి వెబ్‌సైట్ లింక్‌ను తెరుస్తుంది. క్యూఆర్ కోడ్ స్వయంగా ఆ వెబ్‌సైట్ విశ్వసనీయతను హామీ ఇవ్వదు."
                todo = "బ్రౌజర్ అడ్రస్ బార్‌లో అధికారిక డొమైన్ పేరును జాగ్రత్తగా తనిఖీ చేయండి."
                notodo = "క్యూఆర్ ద్వారా తెరిచే వెబ్‌సైట్‌లలో మీ బ్యాంకింగ్ పాస్‌వర్డ్‌లు లేదా యూపీఐ పిన్ నమోదు చేయవద్దు."
            else:
                risk_level = "Informational Web Link QR"
                why = "This QR code redirects to an external web URL. A QR code alone cannot establish the trustworthiness of the destination website."
                todo = "Inspect the web domain spelling carefully in your browser address bar before interacting."
                notodo = "Never enter personal banking credentials, OTPs, or passwords on web pages opened via QR codes."

        else:
            is_payment = False
            if language == 'te':
                risk_level = "సాధారణ క్యూఆర్ కోడ్ (Standard Reference)"
                why = "ఇది సాధారణ టెక్స్ట్ లేదా వ్యాపార రిఫరెన్స్ క్యూఆర్ కోడ్."
                todo = "చెల్లింపు చేసే ముందు గ్రహీత వివరాలను నిర్ధారించుకోండి."
                notodo = "అపరిచిత వ్యక్తులు పంపే కోడ్‌లను నమ్మి పిన్ నమోదు చేయవద్దు."
            else:
                risk_level = "Standard QR Code"
                why = "This QR code contains standard text or reference metadata. It does not contain an automated UPI payment URI."
                todo = "Always verify the payee credentials independently before initiating any manual transfer."
                notodo = "Never send money to unverified UPI handles without independent identity confirmation."

        formatted = (
            f"**Risk Level:** {risk_level}\n\n"
            f"**Why it may be suspicious:** {why}\n\n"
            f"**What you should do:** {todo}\n\n"
            f"**What you should never do:** {notodo}"
        ) if language != 'te' else (
            f"**రిస్క్ స్థాయి:** {risk_level}\n\n"
            f"**ఎందుకు అనుమానాస్పదంగా ఉంది:** {why}\n\n"
            f"**మీరు ఏమి చేయాలి:** {todo}\n\n"
            f"**మీరు ఏమి చేయకూడదు:** {notodo}"
        )

        return jsonify({
            'success': True,
            'payload': payload,
            'isPaymentQR': is_payment,
            'riskLevel': risk_level,
            'warning': why,
            'safetyAdvice': todo,
            'whySuspicious': why,
            'whatToDo': todo,
            'whatNotToDo': notodo,
            'formattedAnalysis': formatted
        }), 200
    except Exception:
        fallback_lang = 'te' if (request.form.get('language') or (request.get_json(silent=True) or {}).get('language')) == 'te' else 'en'
        err_msg = "క్యూఆర్ కోడ్ విశ్లేషణలో లోపం ఏర్పడింది. డబ్బులు రావడానికి ఎప్పుడూ క్యూఆర్ స్కాన్ చేయవద్దు." if fallback_lang == 'te' else "Error inspecting QR code. Never scan a QR code to receive money."
        return jsonify({
            'success': False,
            'payload': '',
            'isPaymentQR': False,
            'riskLevel': 'Unable to Verify',
            'warning': err_msg,
            'safetyAdvice': 'Never enter your UPI PIN to receive money.'
        }), 200


# 6. GET /api/ai/history
@ai_bp.route('/api/ai/history', methods=['GET'])
def get_history():
    try:
        user_id = request.args.get('userId', 'anonymous')
        history = AIChatModel.get_user_history(user_id)
        return jsonify({'success': True, 'count': len(history), 'history': history}), 200
    except Exception:
        return jsonify({'success': True, 'count': 0, 'history': []}), 200


# 7. DELETE /api/ai/history
@ai_bp.route('/api/ai/history', methods=['DELETE'])
def delete_history():
    try:
        user_id = request.args.get('userId', 'anonymous')
        AIChatModel.delete_user_history(user_id)
        return jsonify({'success': True, 'message': 'Chat history cleared successfully'}), 200
    except Exception:
        return jsonify({'success': True, 'message': 'Chat history cleared'}), 200


# 8. POST /api/ai/translate
@ai_bp.route('/api/ai/translate', methods=['POST'])
def translate():
    """
    Translates chat messages between English and Telugu.
    Accepts: { messages: [{"id": "...", "text": "..."}, ...], target_language: 'te' | 'en' }
    Returns: { success: True, target_language: '...', messages: [...] }
    """
    try:
        data = request.get_json(silent=True) or {}
        messages = data.get('messages', [])
        target_lang = data.get('target_language', 'en').lower().strip()
        if target_lang not in ('en', 'te'):
            target_lang = 'en'
        source_lang = data.get('source_language', 'en').lower().strip()

        if not messages:
            return jsonify({
                'success': True,
                'target_language': target_lang,
                'messages': []
            }), 200

        translated_messages = GeminiService.translate_messages(
            messages=messages,
            target_language=target_lang,
            source_language=source_lang
        )

        return jsonify({
            'success': True,
            'target_language': target_lang,
            'messages': translated_messages
        }), 200
    except Exception as e:
        logger.error(f"Translate endpoint error: {e}")
        fallback = []
        raw_msgs = (request.get_json(silent=True) or {}).get('messages', [])
        for idx, m in enumerate(raw_msgs):
            mid = m.get('id', str(idx)) if isinstance(m, dict) else str(idx)
            text = m.get('text', '') if isinstance(m, dict) else str(m)
            fallback.append({'id': mid, 'text': text, 'translated': False})
        return jsonify({
            'success': False,
            'error': 'TRANSLATION_FAILED',
            'message': str(e),
            'messages': fallback
        }), 200

