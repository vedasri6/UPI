import os
import requests
import json
import logging
import base64
import re
from config import Config

logger = logging.getLogger(__name__)

# Attempt to import official google-genai SDK if available
try:
    from google import genai
    from google.genai import types
    from google.genai import errors as genai_errors
    HAS_GENAI_SDK = True
except ImportError:
    HAS_GENAI_SDK = False


class GeminiServiceError(Exception):
    """Base exception for Gemini service errors."""
    def __init__(self, message: str, error_code: str = "GEMINI_ERROR"):
        super().__init__(message)
        self.message = message
        self.error_code = error_code


class GeminiConfigError(GeminiServiceError):
    """Raised when Gemini API key is missing or invalid in configuration."""
    def __init__(self, message: str = "Gemini API key is not configured in backend/.env"):
        super().__init__(message, error_code="API_KEY_MISSING")


class GeminiAPIError(GeminiServiceError):
    """Raised when the Gemini API request fails or returns an error."""
    def __init__(self, message: str, error_code: str = "GEMINI_API_ERROR"):
        super().__init__(message, error_code=error_code)


class GeminiService:
    MODELS = [
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.7-flash',
        'gemini-flash-lite-latest',
        'gemini-3.8-flash'
    ]

    @classmethod
    def get_client(cls, api_key: str = None):
        """Returns an initialized google.genai.Client instance."""
        if not HAS_GENAI_SDK:
            return None
        key = api_key or cls.get_api_key()
        if not key:
            return None
        return genai.Client(api_key=key)

    @staticmethod
    def get_api_key() -> str:
        """Dynamically loads and returns the trimmed GEMINI_API_KEY from backend/.env."""
        import dotenv
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        if os.path.exists(env_path):
            dotenv.load_dotenv(env_path, override=True)
        else:
            dotenv.load_dotenv(override=True)

        key = (
            os.getenv("GEMINI_API_KEY") 
            or getattr(Config, "GEMINI_API_KEY", "") 
            or os.getenv("GOOGLE_API_KEY", "") 
            or ""
        )
        return key.strip()

    @classmethod
    def categorize_api_error(cls, err: Exception, lang: str = "en") -> tuple:
        """
        Distinguishes specific API failure categories:
        - Invalid/Revoked key (400 API_KEY_INVALID, 401, 403)
        - Quota / Rate limits (429, RESOURCE_EXHAUSTED)
        - Model high demand / overload (503, UNAVAILABLE)
        - Deprecated / unavailable model (404)
        - Network connectivity / timeouts
        Returns (error_code, user_friendly_message)
        """
        code_attr = str(getattr(err, 'code', ''))
        err_str = f"{code_attr} {err}" if err else "Unknown API error"
        err_lower = err_str.lower()

        # 1. Invalid or Revoked API Key
        if any(k in err_lower for k in ("api_key_invalid", "api key not valid", "401", "403", "unauthenticated")):
            code = "API_KEY_INVALID"
            msg = (
                "మీ జెమిని API కీ చెల్లదు లేదా ప్రామాణీకరించబడలేదు. దయచేసి backend/.env లోని GEMINI_API_KEY ని సరిచూడండి."
                if lang == "te" else
                "Your Gemini API key is invalid or unauthorized. Please verify the GEMINI_API_KEY in backend/.env."
            )
            return code, msg

        # 2. Quota / Rate Limit Exceeded
        if any(k in err_lower for k in ("resource_exhausted", "quota", "429")):
            code = "QUOTA_EXCEEDED"
            msg = (
                "జెమిని API వినియోగ కోటా పరిమితి ముగిసింది (HTTP 429). దయచేసి కొద్దిసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి."
                if lang == "te" else
                "Gemini API rate limit or quota exceeded (HTTP 429). Please wait a moment before trying again."
            )
            return code, msg

        # 3. Model Temporarily Overloaded / High Demand
        if any(k in err_lower for k in ("503", "unavailable", "high demand", "overloaded")):
            code = "MODEL_OVERLOADED"
            msg = (
                "AI సర్వర్ ప్రస్తుతం అధిక ట్రాఫిక్ లో ఉంది (HTTP 503). దయచేసి కొద్ది క్షణాల తర్వాత మళ్ళీ ప్రయత్నించండి."
                if lang == "te" else
                "The AI model is temporarily experiencing high traffic demand (HTTP 503). Please retry in a few moments."
            )
            return code, msg

        # 4. Model Deprecated / Not Found
        if any(k in err_lower for k in ("404", "not found", "no longer available")):
            code = "MODEL_NOT_FOUND"
            msg = (
                "ఎంచుకున్న AI మోడల్ అందుబాటులో లేదు."
                if lang == "te" else
                "The requested Gemini model is currently unavailable or deprecated."
            )
            return code, msg

        # 5. Network / Timeout Error
        if any(k in err_lower for k in ("timeout", "connection", "failed to establish", "max retries", "name resolution")):
            code = "NETWORK_ERROR"
            msg = (
                "నెట్‌వర్క్ కనెక్షన్ లోపం కారణంగా జెమిని సర్వర్‌ను సంప్రదించలేకపోయాము. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ని సరిచూసుకోండి."
                if lang == "te" else
                "Unable to connect to Gemini API servers due to network issues. Please check your internet connection."
            )
            return code, msg

        # 6. Fallback General API Error
        code = "GEMINI_API_ERROR"
        clean_detail = err_str[:180]
        msg = (
            f"జెమిని AI సర్వీస్ లోపం: {clean_detail}"
            if lang == "te" else
            f"Gemini API error: {clean_detail}"
        )
        return code, msg

    @classmethod
    def get_system_instruction(cls, language: str = "en") -> str:
        lang = language.lower() if language else "en"
        if lang == "te":
            return (
                "మీరు 'యూపీఐ సురక్ష మిత్ర AI' (UPI Suraksha Mitra AI) — భారతీయ డిజిటల్ చెల్లింపులు (UPI), "
                "NPCI నిబంధనలు, మరియు సైబర్ మోసాల నివారణలో నైపుణ్యం కలిగిన అధికారిక సైబర్ భద్రతా AI అసిస్టెంట్.\n\n"
                "ముఖ్య నిబంధనలు (ఖచ్చితంగా పాటించండి):\n"
                "1. ఖచ్చితమైన భాషా నిబంధన (MANDATORY LANGUAGE: TELUGU):\n"
                "   - మీ సమాధానం తప్పనిసరిగా 100% సహజమైన, స్పష్టమైన తెలుగు లిపి (Telugu script) లోనే ఉండాలి.\n"
                "   - వినియోగదారు ప్రశ్నను ఆంగ్లంలో అడిగినా సరే, మీ సమాధానం ఖచ్చితంగా తెలుగులోనే ఇవ్వాలి. ఆంగ్ల సమాధానాలను ఇవ్వవద్దు.\n\n"
                "2. ప్రత్యక్ష సమాధానం & సంక్షిప్తత (Direct, Concise 35-60 words):\n"
                "   - వినియోగదారు అడిగిన ప్రశ్నకు నేరుగా, స్పష్టంగా సుమారు 35 నుండి 60 పదాలలో సమాధానం ఇవ్వండి.\n"
                "   - సాధారణ ఉపన్యాసాలు, అనవసరమైన సమాచారం, మరియు చివరలో అవాంఛిత అనుబంధ ప్రశ్నలు (unnecessary follow-up questions) అడగవద్దు. నేరుగా ప్రశ్నకు సమాధానం ఇచ్చి ముగించండి.\n"
                "   - సాంకేతిక పదాలను (UPI PIN, OTP, QR Code) సరళమైన తెలుగులో సులభంగా వివరించండి.\n\n"
                "3. ఫార్మాటింగ్ నియమాలు (No Raw Markdown Asterisks):\n"
                "   - సమాధానంలో ఎక్కడా '**' లేదా '*' వంటి మార్క్‌డౌన్ ఆస్టరిస్క్ గుర్తులను ఉపయోగించవద్దు. సాధారణ, స్పష్టమైన పేరాగ్రాఫ్‌లలో రాయండి.\n\n"
                "4. లింక్ / QR / సందేశాల మోసాల విశ్లేషణ:\n"
                "   - ప్రత్యక్ష ఆధారాలు లేకుండా ఏ లింక్, క్యూఆర్ లేదా సందేశాన్ని 100% సురక్షితమని చెప్పవద్దు. లైవ్ సెక్యూరిటీ డేటాబేస్ తనిఖీ లేకపోతే 'Unable to Verify' (ధృవీకరించబడలేదు) అని స్పష్టంగా చెప్పండి.\n"
                "   - మోసాల విశ్లేషణలో ప్రమాదం (Risk), కారణం (Reason), మరియు తీసుకోవాల్సిన సురక్షిత చర్యను (Safe Action) సంక్షిప్తంగా వివరించండి.\n\n"
                "5. అత్యవసర సహాయం:\n"
                "   - ఆర్థిక నష్టం జరిగితే వెంటనే నేషనల్ సైబర్ క్రైమ్ హెల్ప్‌లైన్ 1930 లేదా cybercrime.gov.in లో ఫిర్యాదు చేయమని సూచించండి. ఎప్పుడూ యూపీఐ పిన్ లేదా ఓటీపీ అడగవద్దు."
            )
        return (
            "You are UPI Suraksha Mitra AI, an expert cybersecurity assistant for Indian digital payments (UPI), "
            "NPCI rules, and citizen cyber fraud prevention.\n\n"
            "CRITICAL GUIDELINES (STRICTLY ENFORCED):\n"
            "1. MANDATORY LANGUAGE: Answer ENTIRELY in clear, natural, fluent ENGLISH. Do NOT switch to Telugu or other languages.\n\n"
            "2. DIRECT, RELEVANT & CONCISE ANSWER (35 to 60 words):\n"
            "   - Understand the user's specific question and Answer the question directly without generic filler.\n"
            "   - Explain technical terms in simple language (UPI PIN, OTP, VPA, QR codes) simply in direct context.\n"
            "   - Give examples when useful.\n"
            "   - Avoid repeating generic safety advice or generic lectures.\n"
            "   - Remember relevant previous messages during follow-up questions.\n"
            "   - Ask for clarification when the question is genuinely unclear, but do not append unsolicited follow-up questions when the question is already answered.\n\n"
            "3. CLEAN FORMATTING (NO RAW MARKDOWN ASTERISKS):\n"
            "   - Do NOT use raw markdown asterisks like '**' or '*' in conversational text. Present answers in clean, readable natural text.\n\n"
            "4. FRAUD & URL / QR ANALYSIS:\n"
            "   - For ordinary questions, answer directly. For fraud analysis (links, QR codes, SMS), clearly explain the risk, the reason, and the next safe action.\n"
            "   - Never claim a link, QR code, or message is 100% safe unless verified. If no live threat database was queried, state 'Unable to Verify'.\n\n"
            "5. INCIDENT ASSISTANCE & PRIVACY:\n"
            "   - If financial fraud or loss of money is reported, advise immediate reporting to the National Cyber Crime Helpline 1930 and cybercrime.gov.in.\n"
            "   - Never ask for or store user UPI PINs, OTPs, or passwords."
        )

    @classmethod
    def format_chat_contents(cls, history: list, prompt: str) -> list:
        """
        Builds structured multi-turn conversation contents for Gemini.
        Ensures valid role alternation ('user' and 'model') and leading 'user' turn.
        """
        raw_turns = []
        if history and isinstance(history, list):
            for turn in history[-10:]:  # Keep up to 10 recent turns
                sender = str(turn.get("sender", turn.get("role", "user"))).lower()
                role = "user" if sender in ("user", "human") else "model"
                text = str(turn.get("text", turn.get("content", ""))).strip()
                # Skip error messages or empty texts
                if text and not text.startswith("⚠️"):
                    raw_turns.append({"role": role, "parts": [{"text": text}]})

        # Append current user prompt
        raw_turns.append({"role": "user", "parts": [{"text": prompt.strip()}]})

        # Merge consecutive identical roles to guarantee strict alternation
        merged = []
        for turn in raw_turns:
            if merged and merged[-1]["role"] == turn["role"]:
                merged[-1]["parts"][0]["text"] += "\n\n" + turn["parts"][0]["text"]
            else:
                merged.append(turn)

        # Gemini requires contents to start with a 'user' turn
        while merged and merged[0]["role"] != "user":
            merged.pop(0)

        return merged

    @classmethod
    def generate_content(cls, prompt: str, system_instruction: str = "", language: str = "en", history: list = None) -> str:
        """
        Generates personalized cybersecurity AI response using Google Gemini API.
        Passes conversation history turns to preserve follow-up context.
        Raises GeminiConfigError if API key is missing.
        Raises GeminiAPIError if the API request fails.
        """
        api_key = cls.get_api_key()
        lang = language.lower() if language else "en"

        # Check for missing or placeholder API key
        if not api_key or len(api_key) < 15 or "your_gemini" in api_key.lower():
            if lang == "te":
                raise GeminiConfigError(
                    "జెమిని API కీ కాన్ఫిగర్ చేయబడలేదు. AI ఫ్రాడ్ అసిస్టెంట్‌ని ఉపయోగించడానికి దయచేసి బ్యాకెండ్ .env ఫైల్‌లో సరైన GEMINI_API_KEY ని జోడించండి."
                )
            raise GeminiConfigError(
                "Gemini API key is not configured. Please add a valid GEMINI_API_KEY to your backend .env file to enable the AI Fraud Assistant."
            )

        sys_inst = system_instruction.strip() if system_instruction else cls.get_system_instruction(lang)
        formatted_contents = cls.format_chat_contents(history, prompt)

        last_error = None

        # 1. Attempt using official google-genai SDK
        if HAS_GENAI_SDK:
            try:
                client = cls.get_client(api_key)
                if client:
                    for model_name in cls.MODELS:
                        try:
                            # GenerateContentConfig for google-genai
                            gen_config = types.GenerateContentConfig(
                                system_instruction=sys_inst,
                                max_output_tokens=1000,
                                temperature=0.2,
                            )
                            response = client.models.generate_content(
                                model=model_name,
                                contents=formatted_contents,
                                config=gen_config,
                            )
                            if response and hasattr(response, "text") and response.text:
                                raw_ans = response.text.strip()
                                clean_ans = raw_ans.replace("**", "").replace("* ", "• ").strip()
                                return clean_ans
                        except Exception as sdk_err:
                            last_error = sdk_err
                            logger.warning(f"Google GenAI SDK ({model_name}) error: {sdk_err}")
            except Exception as client_err:
                last_error = client_err
                logger.warning(f"Failed to initialize Google GenAI Client: {client_err}")

        # 2. Attempt direct HTTPS REST API calls
        for model_name in cls.MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "system_instruction": {
                        "parts": [{"text": sys_inst}]
                    },
                    "contents": formatted_contents,
                    "generationConfig": {
                        "maxOutputTokens": 1000,
                        "temperature": 0.2
                    }
                }
                res = requests.post(url, headers=headers, json=payload, timeout=20)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and parts[0].get("text"):
                            raw_ans = parts[0].get("text").strip()
                            clean_ans = raw_ans.replace("**", "").replace("* ", "• ").strip()
                            return clean_ans
                else:
                    err_json = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
                    err_detail = err_json.get("error", {}).get("message", res.text[:200])
                    last_error = Exception(f"HTTP {res.status_code} from {model_name}: {err_detail}")
                    logger.warning(f"Gemini REST ({model_name}) HTTP {res.status_code}: {err_detail}")
            except Exception as rest_err:
                last_error = rest_err
                logger.warning(f"Gemini REST ({model_name}) error: {rest_err}")

        # If all attempts failed, categorize the root cause transparently
        err_code, err_user_msg = cls.categorize_api_error(last_error, lang=lang)
        raise GeminiAPIError(err_user_msg, error_code=err_code)

    @classmethod
    def analyze_image_content(cls, image_bytes: bytes, mime_type: str = "image/png", language: str = "en") -> str:
        """
        Multimodal image analysis using Gemini Vision API if key configured.
        Raises GeminiConfigError if API key is not configured.
        Raises GeminiAPIError if the API request fails.
        """
        api_key = cls.get_api_key()
        lang = language.lower() if language else "en"

        if not api_key or len(api_key) < 15 or "your_gemini" in api_key.lower():
            if lang == "te":
                raise GeminiConfigError(
                    "జెమిని API కీ కాన్ఫిగర్ చేయబడలేదు. ఇమేజ్ లేదా రసీదుల విశ్లేషణకు దయచేసి బ్యాకెండ్ .env ఫైల్‌లో సరైన GEMINI_API_KEY ని జోడించండి."
                )
            raise GeminiConfigError(
                "Gemini API key is not configured. Please add a valid GEMINI_API_KEY to your backend .env file to enable payment screenshot analysis."
            )

        if not image_bytes:
            raise GeminiAPIError("No image data provided for inspection.", error_code="INVALID_ARGUMENT")

        prompt = (
            "Inspect this payment screenshot, receipt, or transaction voucher for signs of fraud, fake screenshot generator patterns, "
            "tampered fonts, missing bank UTR/reference numbers, mismatched timestamps, or counterfeit QR codes. "
            "Directly answer whether this image shows evidence of tampering, explain technical terms simply, and provide clear protective advice."
        )
        if lang == "te":
            prompt += "\nసమాధానాన్ని పూర్తిగా స్పష్టమైన తెలుగు (Telugu) భాషలోనే అందించండి."

        b64_data = base64.b64encode(image_bytes).decode('utf-8')
        last_error = None

        # 1. Attempt using official google-genai SDK for vision
        if HAS_GENAI_SDK:
            try:
                client = cls.get_client(api_key)
                if client:
                    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                    vision_contents = [image_part, prompt]
                    for model_name in cls.MODELS:
                        try:
                            response = client.models.generate_content(
                                model=model_name,
                                contents=vision_contents,
                            )
                            if response and hasattr(response, "text") and response.text:
                                return response.text.strip()
                        except Exception as sdk_err:
                            last_error = sdk_err
                            logger.warning(f"Google GenAI Vision SDK ({model_name}) error: {sdk_err}")
            except Exception as client_err:
                last_error = client_err
                logger.warning(f"Failed to initialize Google GenAI Client for vision: {client_err}")

        # 2. Attempt direct HTTPS REST API calls
        for model_name in cls.MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{
                        "parts": [
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": b64_data
                                }
                            },
                            {"text": prompt}
                        ]
                    }]
                }
                res = requests.post(url, headers=headers, json=payload, timeout=25)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and parts[0].get("text"):
                            return parts[0].get("text").strip()
                else:
                    err_json = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
                    err_detail = err_json.get("error", {}).get("message", res.text[:200])
                    last_error = Exception(f"HTTP {res.status_code} ({model_name}): {err_detail}")
            except Exception as img_err:
                last_error = img_err
                logger.warning(f"Gemini image analysis error ({model_name}): {img_err}")

        err_code, err_user_msg = cls.categorize_api_error(last_error, lang=lang)
        raise GeminiAPIError(err_user_msg, error_code=err_code)

    @classmethod
    def _generate_smart_fallback(cls, prompt: str, language: str = "en") -> str:
        """
        Honest fallback message when Gemini API is unavailable or unconfigured.
        Does not pretend to be a personalized AI response.
        """
        if language == "te":
            return (
                "⚠️ AI సర్వీస్ అందుబాటులో లేదు. జెమిని API కీ కాన్ఫిగర్ చేయబడలేదు లేదా నెట్‌వర్క్ లోపం ఏర్పడింది. "
                "దయచేసి బ్యాకెండ్ .env ఫైల్‌లో సరైన GEMINI_API_KEY ని జోడించండి.\n\n"
                "అత్యవసర సైబర్ మోసం లేదా ఆర్థిక నష్టం జరిగితే వెంటనే నేషనల్ సైబర్ క్రైమ్ హెల్ప్‌లైన్ 1930 కి కాల్ చేయండి లేదా cybercrime.gov.in లో ఫిర్యాదు చేయండి."
            )
        return (
            "⚠️ AI Assistant service is currently unavailable. The Gemini API key is missing or the external API request failed. "
            "Please configure a valid GEMINI_API_KEY in your backend/.env file.\n\n"
            "If you are facing active financial fraud or need emergency assistance, immediately call the National Cyber Crime Helpline at 1930 or report at cybercrime.gov.in."
        )

    # Canned / tool message patterns for instant offline translation
    CANNED_TRANSLATION_PATTERNS = [
        # Image tool user message
        (re.compile(r'^\s*📷\s*\[(?:Submitted Image for Fraud Inspection|విశ్లేషణ కోసం ఇమేజ్ సమర్పించబడింది|Uploaded Image):\s*(.+?)\]\s*$', re.IGNORECASE),
         "📷 [విశ్లేషణ కోసం ఇమేజ్ సమర్పించబడింది: {0}]",
         "📷 [Submitted Image for Fraud Inspection: {0}]"),
        # QR tool image
        (re.compile(r'^\s*🔳\s*\[(?:Uploaded QR Code Image|క్యూఆర్ కోడ్ ఇమేజ్):\s*(.+?)\]\s*$', re.IGNORECASE),
         "🔳 [క్యూఆర్ కోడ్ ఇమేజ్: {0}]",
         "🔳 [Uploaded QR Code Image: {0}]"),
        # QR tool payload
        (re.compile(r'^\s*🔳\s*\[(?:QR Code Payload|క్యూఆర్ కోడ్ పేలోడ్):\s*(.+?)\]\s*$', re.IGNORECASE),
         "🔳 [క్యూఆర్ కోడ్ పేలోడ్: {0}]",
         "🔳 [QR Code Payload: {0}]"),
        # Link tool
        (re.compile(r'^\s*🔗\s*\[(?:Link Inspection|Checking Suspicious Link|లింక్ తనిఖీ|లింక్ విశ్లేషణ|అనుమానాస్పద లింక్ తనిఖీ):\s*(.+?)\]\s*$', re.IGNORECASE),
         "🔗 [అనుమానాస్పద లింక్ తనిఖీ: {0}]",
         "🔗 [Checking Suspicious Link: {0}]"),
        # SMS tool
        (re.compile(r'^\s*💬\s*\[(?:SMS / Message Analysis|Analyzing Message Text|సందేశం / SMS విశ్లేషణ|సందేశం విశ్లేషణ|మెసేజ్ విశ్లేషణ):\s*(.+?)\]\s*$', re.IGNORECASE),
         "💬 [సందేశం విశ్లేషణ: {0}]",
         "💬 [Analyzing Message Text: {0}]"),
        # Canned Error: Backend server connection
        (re.compile(r'^\s*⚠️\s*(?:Unable to connect to backend server.*|సర్వర్‌కు కనెక్ట్ చేయడంలో లోపం ఏర్పడింది.*)\s*$', re.IGNORECASE),
         "⚠️ సర్వర్‌కు కనెక్ట్ చేయడంలో లోపం ఏర్పడింది. దయచేసి బ్యాకెండ్ సర్వర్ (పోర్ట్ 5000) నడుస్తుందో లేదో తనిఖీ చేయండి.",
         "⚠️ Unable to connect to backend server. Please verify the Flask backend is running on port 5000."),
        # Canned Error: Image inspection failure
        (re.compile(r'^\s*⚠️\s*(?:Failed to inspect the uploaded image.*|ఇమేజ్ విశ్లేషణలో లోపం ఏర్పడింది.*)\s*$', re.IGNORECASE),
         "⚠️ ఇమేజ్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి స్పష్టమైన ఇమేజ్ అప్‌లోడ్ చేసి మళ్ళీ ప్రయత్నించండి.",
         "⚠️ Failed to inspect the uploaded image. Please ensure the file is under 10MB and try again."),
        # Canned Error: QR code inspection failure
        (re.compile(r'^\s*⚠️\s*(?:Failed to inspect QR code.*|క్యూఆర్ కోడ్ విశ్లేషణలో లోపం ఏర్పడింది.*)\s*$', re.IGNORECASE),
         "⚠️ క్యూఆర్ కోడ్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
         "⚠️ Failed to inspect QR code. Please check the QR payload format and retry."),
        # Canned Error: Link inspection failure
        (re.compile(r'^\s*⚠️\s*(?:Failed to verify link safely.*|లింక్ విశ్లేషణలో లోపం ఏర్పడింది.*)\s*$', re.IGNORECASE),
         "⚠️ లింక్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి వెబ్‌సైట్ లింక్‌ను సరిచూసి మళ్ళీ ప్రయత్నించండి.",
         "⚠️ Failed to verify link safely. Please verify the URL structure and try again."),
        # Canned Error: SMS inspection failure
        (re.compile(r'^\s*⚠️\s*(?:Failed to inspect SMS message.*|మెసేజ్ విశ్లేషణలో లోపం ఏర్పడింది.*)\s*$', re.IGNORECASE),
         "⚠️ మెసేజ్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
         "⚠️ Failed to inspect SMS message. Please retry."),
    ]

    @classmethod
    def translate_messages(cls, messages: list, target_language: str = "te", source_language: str = "en") -> list:
        """
        Translates a batch of chat messages between English and Telugu.
        Preserves technical terms, numeric values, URLs, UPI IDs, and formatting.
        Accepts: messages = [{"id": ..., "text": ...}, ...] or list of strings.
        Returns: list of dicts [{"id": ..., "text": ..., "translated": True/False}]
        """
        if not messages:
            return []

        target_lang = (target_language or "en").lower().strip()
        if target_lang not in ("en", "te"):
            target_lang = "en"

        normalized = []
        for idx, m in enumerate(messages):
            if isinstance(m, dict):
                mid = str(m.get("id", idx))
                text = str(m.get("text", "")).strip()
            else:
                mid = str(idx)
                text = str(m).strip()
            normalized.append({"id": mid, "text": text})

        results = []
        untranslated_indices = []
        texts_to_ai = []

        for i, item in enumerate(normalized):
            text = item["text"]
            if not text:
                results.append({"id": item["id"], "text": "", "translated": True})
                continue

            matched = False
            for pat, te_fmt, en_fmt in cls.CANNED_TRANSLATION_PATTERNS:
                m = pat.match(text)
                if m:
                    if m.lastindex and m.lastindex >= 1:
                        arg = m.group(1)
                        trans = te_fmt.format(arg) if target_lang == "te" else en_fmt.format(arg)
                    else:
                        trans = te_fmt if target_lang == "te" else en_fmt
                    results.append({"id": item["id"], "text": trans, "translated": True})
                    matched = True
                    break

            if not matched:
                results.append({"id": item["id"], "text": text, "translated": False})
                untranslated_indices.append(i)
                texts_to_ai.append(text)

        if not texts_to_ai:
            return results

        api_key = cls.get_api_key()
        if not api_key:
            return results

        if target_lang == "te":
            prompt = (
                "You are an expert bilingual cybersecurity translator for Indian digital payments (UPI) and citizen safety.\n"
                "Translate each message in the following JSON array into natural, clear, citizen-friendly TELUGU.\n"
                "RULES:\n"
                "1. Strictly do NOT use raw markdown asterisks ('**' or '*'). Write in natural, clear sentences.\n"
                "2. Keep technical terms intact (e.g. 'UPI PIN', 'OTP', 'QR code', 'VPA', 'APK', 'NPCI', '1930', 'cybercrime.gov.in', URLs, phone numbers, transaction IDs, monetary amounts).\n"
                "3. Preserve the exact meaning, sentiment, and warning level without distortion.\n"
                "4. Return ONLY a valid JSON array of translated strings with the exact same count and order.\n\n"
                f"Input JSON Array:\n{json.dumps(texts_to_ai, ensure_ascii=False)}"
            )
        else:
            prompt = (
                "You are an expert bilingual cybersecurity translator for Indian digital payments (UPI) and citizen safety.\n"
                "Translate each message in the following JSON array into natural, clear, direct ENGLISH.\n"
                "RULES:\n"
                "1. Strictly do NOT use raw markdown asterisks ('**' or '*'). Write in clean, readable natural sentences.\n"
                "2. Keep technical terms intact (e.g. 'UPI PIN', 'OTP', 'QR code', 'VPA', 'APK', 'NPCI', '1930', 'cybercrime.gov.in', URLs, phone numbers, transaction IDs, monetary amounts).\n"
                "3. Preserve the exact meaning, sentiment, and warning level without distortion.\n"
                "4. Return ONLY a valid JSON array of translated strings with the exact same count and order.\n\n"
                f"Input JSON Array:\n{json.dumps(texts_to_ai, ensure_ascii=False)}"
            )

        translated_array = None

        # 1. Try google-genai SDK
        if HAS_GENAI_SDK:
            try:
                client = cls.get_client(api_key)
                if client:
                    for model_name in cls.MODELS:
                        try:
                            gen_config = types.GenerateContentConfig(
                                response_mime_type="application/json",
                                temperature=0.1,
                                max_output_tokens=2048
                            )
                            response = client.models.generate_content(
                                model=model_name,
                                contents=prompt,
                                config=gen_config
                            )
                            if response and hasattr(response, "text") and response.text:
                                raw_json = response.text.strip()
                                if raw_json.startswith("```"):
                                    raw_json = re.sub(r'^```(?:json)?\s*', '', raw_json)
                                    raw_json = re.sub(r'\s*```$', '', raw_json)
                                parsed = json.loads(raw_json.strip())
                                if isinstance(parsed, list) and len(parsed) == len(texts_to_ai):
                                    translated_array = parsed
                                    break
                        except Exception as sdk_err:
                            logger.warning(f"Translation SDK error ({model_name}): {sdk_err}")
            except Exception as client_err:
                logger.warning(f"Translation client init error: {client_err}")

        # 2. Try REST fallback if needed
        if translated_array is None:
            for model_name in cls.MODELS:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                    headers = {"Content-Type": "application/json"}
                    payload = {
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "responseMimeType": "application/json",
                            "temperature": 0.1,
                            "maxOutputTokens": 2048
                        }
                    }
                    res = requests.post(url, headers=headers, json=payload, timeout=20)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and parts[0].get("text"):
                                raw_json = parts[0].get("text").strip()
                                if raw_json.startswith("```"):
                                    raw_json = re.sub(r'^```(?:json)?\s*', '', raw_json)
                                    raw_json = re.sub(r'\s*```$', '', raw_json)
                                parsed = json.loads(raw_json.strip())
                                if isinstance(parsed, list) and len(parsed) == len(texts_to_ai):
                                    translated_array = parsed
                                    break
                except Exception as rest_err:
                    logger.warning(f"Translation REST error ({model_name}): {rest_err}")

        if translated_array and len(translated_array) == len(untranslated_indices):
            for idx_in_ai, orig_idx in enumerate(untranslated_indices):
                clean_t = str(translated_array[idx_in_ai]).replace("**", "").replace("* ", "• ").strip()
                results[orig_idx]["text"] = clean_t
                results[orig_idx]["translated"] = True

        return results

