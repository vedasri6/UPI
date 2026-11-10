import os
import re
import socket
import base64
import logging
import ipaddress
from urllib.parse import urlparse, urljoin
import requests
from config import Config

logger = logging.getLogger(__name__)

class UrlReputationService:
    """
    URL Reputation & Security Inspection Service.
    
    Adheres strictly to safety protocols:
    1. Comprehensive SSRF Protection: Blocks private, loopback, link-local, cloud-metadata (169.254.169.254),
       and DNS-resolved internal addresses across both initial URL and redirect hops.
    2. Safe Redirect Resolution: Follows redirects safely one hop at a time (max 5 hops) with loop detection
       and destination validation without opening suspicious sites in a browser.
    3. Punycode & Lookalike Detection: Flags IDN homoglyphs (xn--) and deceptive brand subdomains.
    4. Threat Intelligence API Integration: VirusTotal v3 and Google Safe Browsing v4.
    5. Truthful Status Reporting: NEVER guarantees a URL is 100% safe. Transparently reports when live
       APIs are unconfigured, rate-limited, or unavailable.
    6. English & Telugu localization for all security explanations.
    """

    VT_API_URL = "https://www.virustotal.com/api/v3"
    SAFE_BROWSING_API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
    REQUEST_TIMEOUT = 10  # seconds
    MAX_REDIRECT_HOPS = 5

    TRUSTED_OFFICIAL_DOMAINS = [
        'npci.org.in', 'rbi.org.in', 'onlinesbi.sbi', 'paytm.com', 
        'phonepe.com', 'googlepay.com', 'bhimupi.org.in', 'gov.in', 
        'nic.in', 'cybercrime.gov.in', 'sbi.co.in', 'hdfcbank.com', 
        'icicibank.com', 'google.com'
    ]

    POPULAR_TARGET_BRANDS = [
        'sbi', 'npci', 'rbi', 'paytm', 'phonepe', 'bhim',
        'hdfc', 'icici', 'axis', 'cybercrime', 'yono'
    ]

    # SSRF & Address Translation Constants (RFC 6052, RFC 8215, RFC 4291, RFC 6598)
    NAT64_WELL_KNOWN_PREFIX = ipaddress.IPv6Network('64:ff9b::/96')
    NAT64_LOCAL_USE_PREFIX = ipaddress.IPv6Network('64:ff9b:1::/48')
    IPV4_MAPPED_PREFIX = ipaddress.IPv6Network('::ffff:0:0/96')
    IPV4_TRANSLATED_PREFIX = ipaddress.IPv6Network('::ffff:0:0:0/96')
    IPV4_COMPATIBLE_PREFIX = ipaddress.IPv6Network('::/96')
    CARRIER_GRADE_NAT = ipaddress.ip_network('100.64.0.0/10')
    CURRENT_NETWORK = ipaddress.ip_network('0.0.0.0/8')
    IPV6_DISCARD_PREFIX = ipaddress.IPv6Network('100::/64')
    IPV6_DOC_PREFIX = ipaddress.IPv6Network('2001:db8::/32')
    IPV6_BENCH_PREFIX = ipaddress.IPv6Network('2001:2::/48')

    # -------------------------------------------------------------------------
    # SSRF & DNS Resolution Safeguards
    # -------------------------------------------------------------------------
    @classmethod
    def is_restricted_ip(cls, ip_str: str) -> bool:
        """
        Checks if an IP address belongs to private, loopback, link-local,
        carrier-grade NAT, cloud metadata, or prohibited internal/reserved ranges.
        Handles both IPv4 and IPv6, including IPv4-mapped, IPv4-translated (SIIT),
        and NAT64 (RFC 6052 / RFC 8215) addresses without erroneously blocking
        valid public NAT64 IPv6 addresses.
        """
        if not ip_str:
            return False

        clean_ip = str(ip_str).strip()
        # Strip brackets from IPv6 literal if present (e.g., [::1] or [64:ff9b::2d7f:4bd2])
        if clean_ip.startswith('[') and clean_ip.endswith(']'):
            clean_ip = clean_ip[1:-1].strip()

        try:
            ip = ipaddress.ip_address(clean_ip)
        except ValueError:
            return False

        # --- IPv4 Address Evaluation ---
        if isinstance(ip, ipaddress.IPv4Address):
            # Standard Python checks: loopback (127.0.0.0/8), private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16),
            # link-local (169.254.0.0/16), multicast (224.0.0.0/4), unspecified (0.0.0.0), reserved (240.0.0.0/4)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_unspecified or ip.is_reserved:
                return True
            # Cloud Metadata IP (AWS, GCP, Azure, DigitalOcean)
            if str(ip) == "169.254.169.254":
                return True
            # Carrier-Grade NAT (RFC 6598: 100.64.0.0/10)
            if ip in cls.CARRIER_GRADE_NAT:
                return True
            # Current network (0.0.0.0/8) & Broadcast (255.255.255.255)
            if ip in cls.CURRENT_NETWORK:
                return True
            return False

        # --- IPv6 Address Evaluation ---
        if isinstance(ip, ipaddress.IPv6Address):
            # Unambiguously restricted IPv6 ranges:
            # loopback (::1), link-local (fe80::/10), unique-local / private (fc00::/7),
            # multicast (ff00::/8), unspecified (::)
            if ip.is_loopback or ip.is_link_local or ip.is_private or ip.is_multicast or ip.is_unspecified:
                return True

            # Local-Use IPv4/IPv6 Translation (RFC 8215: 64:ff9b:1::/48) - strictly internal/local
            if ip in cls.NAT64_LOCAL_USE_PREFIX:
                return True

            # Discard (RFC 6666: 100::/64), Documentation (RFC 3849: 2001:db8::/32), Benchmarking (RFC 5180: 2001:2::/48)
            if (ip in cls.IPV6_DISCARD_PREFIX or
                ip in cls.IPV6_DOC_PREFIX or
                ip in cls.IPV6_BENCH_PREFIX):
                return True

            # IPv4-Mapped IPv6 (RFC 4291: ::ffff:0:0/96)
            if ip.ipv4_mapped:
                return cls.is_restricted_ip(str(ip.ipv4_mapped))

            # IPv4-Translated / SIIT (RFC 2765 / RFC 6052: ::ffff:0:0:0/96)
            if ip in cls.IPV4_TRANSLATED_PREFIX:
                v4 = ipaddress.IPv4Address(int(ip) & 0xFFFFFFFF)
                return cls.is_restricted_ip(str(v4))

            # Well-Known NAT64 Prefix (RFC 6052: 64:ff9b::/96)
            # Embeds an IPv4 address in bits 96..127.
            # Inspect the embedded IPv4 address for internal/restricted ranges.
            if ip in cls.NAT64_WELL_KNOWN_PREFIX:
                v4 = ipaddress.IPv4Address(int(ip) & 0xFFFFFFFF)
                return cls.is_restricted_ip(str(v4))

            # Deprecated IPv4-Compatible IPv6 (RFC 4291: ::/96)
            if ip in cls.IPV4_COMPATIBLE_PREFIX:
                v4 = ipaddress.IPv4Address(int(ip) & 0xFFFFFFFF)
                return cls.is_restricted_ip(str(v4))

            # General reserved IPv6 check (excluding the translation prefixes already handled above)
            if ip.is_reserved:
                return True

            return False

        return False

    @classmethod
    def check_hostname_ssrf(cls, hostname: str) -> tuple:
        """
        Validates hostname against SSRF via both literal string checks and DNS resolution.
        Returns (is_ssrf: bool, reason: str).
        """
        clean_host = (hostname or '').strip().lower()
        if not clean_host:
            return True, "Empty hostname"

        # Strip brackets from IPv6 literal or host:port
        if clean_host.startswith('['):
            closing = clean_host.find(']')
            if closing != -1:
                clean_host = clean_host[1:closing].strip()
        elif clean_host.count(':') == 1:
            clean_host = clean_host.split(':', 1)[0].strip()

        # 1. Literal host string checks
        if clean_host in ('localhost', '127.0.0.1', '0.0.0.0', 'broadcasthost', '::1') or clean_host.endswith('.local'):
            return True, f"Blocked local loopback/internal hostname '{clean_host}'"

        # 2. Check if hostname is directly an IP literal
        try:
            if cls.is_restricted_ip(clean_host):
                return True, f"Blocked direct private/reserved IP address '{clean_host}'"
        except Exception:
            pass

        # 3. DNS Resolution check (prevents DNS rebinding and nip.io/sslip.io attacks)
        try:
            addr_info = socket.getaddrinfo(clean_host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
            for item in addr_info:
                resolved_ip = item[4][0]
                if cls.is_restricted_ip(resolved_ip):
                    return True, f"Hostname '{clean_host}' resolves to restricted internal IP '{resolved_ip}' (SSRF protection)"
        except socket.gaierror:
            # Domain could not be resolved by DNS - not an internal IP, will be handled during HTTP connection
            pass
        except Exception as err:
            logger.debug(f"DNS resolution check error for {clean_host}: {err}")

        return False, ""

    # -------------------------------------------------------------------------
    # Lookalike & Punycode (IDN) Detection
    # -------------------------------------------------------------------------
    @classmethod
    def check_punycode_and_lookalikes(cls, hostname: str) -> tuple:
        """
        Detects Punycode (IDN) homoglyphs and deceptive brand subdomains.
        Returns (is_suspicious: bool, reason_en: str, reason_te: str).
        """
        lower = (hostname or '').strip().lower()

        # 1. Punycode check (xn--)
        if 'xn--' in lower:
            try:
                decoded = lower.encode('ascii').decode('idna')
            except Exception:
                decoded = lower
            reason_en = f"Punycode (IDN) internationalized domain detected: '{lower}' (decodes to: '{decoded}'). Scammers frequently use non-Latin homoglyph characters to spoof banking domains."
            reason_te = f"ప్యునీకోడ్ (Punycode / IDN) అంతర్జాతీయ డొమైన్ గుర్తించబడింది: '{lower}' (అసలు రూపం: '{decoded}'). బ్యాంక్ వెబ్‌సైట్లను అనుకరించడానికి హ్యాకర్లు ఇలాంటి అక్షరాలను ఉపయోగిస్తారు."
            return True, reason_en, reason_te

        # 2. Cyrillic / Non-ASCII mixed script check
        for char in lower:
            code = ord(char)
            # Basic Latin: 0-127, allow standard dots and dashes
            if code > 127 and char not in ('-', '.'):
                reason_en = f"Suspicious mixed-script character detected in domain '{lower}'. Fraudulent sites use non-Latin characters resembling standard English letters."
                reason_te = f"ఈ డొమైన్‌లో ({lower}) అనుమానాస్పద మిశ్రమ అక్షరాలు గుర్తించబడ్డాయి. సాధారణ ఇంగ్లీష్ అక్షరాలలా కనిపించే ఇతర భాషా అక్షరాలతో నకిలీ సైట్‌లను సృష్టిస్తారు."
                return True, reason_en, reason_te

        # 3. Deceptive Brand Subdomains
        # Example: sbi.co.in.fraud-site.com or paytm.com.secure-payment.xyz
        parts = lower.split('.')
        if len(parts) >= 3:
            # Check if any legitimate brand is embedded in the subdomain while the apex domain is untrusted
            is_official = any(lower == dom or lower.endswith('.' + dom) for dom in cls.TRUSTED_OFFICIAL_DOMAINS)
            if not is_official:
                for brand in cls.POPULAR_TARGET_BRANDS:
                    # Check if brand appears as an isolated subdomain part (e.g. sbi in sbi.evil.com)
                    if brand in parts[:-2]:
                        reason_en = f"Deceptive brand subdomain spoofing detected: Domain uses '{brand}' in its subdomain path while hosted on an untrusted root domain ('{'.'.join(parts[-2:])}')."
                        reason_te = f"నకిలీ బ్రాండ్ అనుకరణ గుర్తించబడింది: ఈ సైట్ అధికారికమైనది కాదు. యూజర్లను మోసగించడానికి సబ్-డొమైన్‌లో '{brand}' పేరును ఉపయోగిస్తోంది."
                        return True, reason_en, reason_te

        return False, "", ""

    # -------------------------------------------------------------------------
    # Safe Redirect Inspection (Without Opening Browser)
    # -------------------------------------------------------------------------
    @classmethod
    def inspect_redirects_safely(cls, initial_url: str) -> dict:
        """
        Inspects HTTP redirects hop-by-hop up to MAX_REDIRECT_HOPS.
        Validates target schemes and enforces SSRF DNS checks on every hop.
        Returns a dictionary with redirect details and any safety violations.
        """
        current_url = initial_url
        redirect_chain = [current_url]
        seen_urls = {current_url}

        session = requests.Session()
        session.headers.update({
            "User-Agent": "UPISurakshaMitra-SecurityAudit/4.0 (+https://cybercrime.gov.in)",
            "Accept": "*/*"
        })

        for hop in range(cls.MAX_REDIRECT_HOPS):
            parsed = urlparse(current_url)
            
            # Validate scheme at this hop
            if parsed.scheme not in ('http', 'https'):
                return {
                    'safe': False,
                    'error': 'UNSAFE_SCHEME',
                    'reason': f"Redirect chain attempted to open unsafe protocol '{parsed.scheme}://'",
                    'chain': redirect_chain,
                    'final_url': current_url
                }

            # Check SSRF on hostname at this hop
            is_ssrf, ssrf_msg = cls.check_hostname_ssrf(parsed.hostname)
            if is_ssrf:
                return {
                    'safe': False,
                    'error': 'SSRF_BLOCKED',
                    'reason': f"Redirect hop {hop + 1} blocked by SSRF filter: {ssrf_msg}",
                    'chain': redirect_chain,
                    'final_url': current_url
                }

            try:
                # Issue HEAD or lightweight GET with stream=True and allow_redirects=False
                resp = session.get(
                    current_url,
                    allow_redirects=False,
                    timeout=5,
                    stream=True
                )
                
                # Check for redirect status codes (301, 302, 303, 307, 308)
                if resp.status_code in (301, 302, 303, 307, 308) and 'Location' in resp.headers:
                    next_loc = resp.headers['Location'].strip()
                    next_url = urljoin(current_url, next_loc)

                    # Loop detection
                    if next_url in seen_urls:
                        return {
                            'safe': False,
                            'error': 'REDIRECT_LOOP',
                            'reason': f"Redirect loop detected back to '{next_url}'",
                            'chain': redirect_chain,
                            'final_url': next_url
                        }

                    seen_urls.add(next_url)
                    redirect_chain.append(next_url)
                    current_url = next_url
                else:
                    # Non-redirect response reached
                    break
            except requests.exceptions.RequestException as req_err:
                # Stop following on connection error, but preserve what was reached
                logger.debug(f"Redirect hop error: {req_err}")
                break

        return {
            'safe': True,
            'error': None,
            'has_redirects': len(redirect_chain) > 1,
            'hops_count': len(redirect_chain) - 1,
            'chain': redirect_chain,
            'final_url': current_url
        }

    # -------------------------------------------------------------------------
    # Provider Check & Threat Intelligence Query
    # -------------------------------------------------------------------------
    @classmethod
    def get_configured_provider(cls) -> str:
        """Determines which live threat intelligence provider is configured."""
        if Config.VIRUSTOTAL_API_KEY and Config.VIRUSTOTAL_API_KEY.strip():
            return "virustotal"
        if Config.SAFE_BROWSING_API_KEY and Config.SAFE_BROWSING_API_KEY.strip():
            return "safebrowsing"
        return "none"

    @classmethod
    def check_url(cls, target_url: str, language: str = "en") -> dict:
        """
        Queries the configured live threat intelligence database.
        Returns a dictionary with status, reason, action, source, and metadata.
        """
        provider = cls.get_configured_provider()
        lang = language if language in ("en", "te") else "en"

        if provider == "none":
            return cls._result_unconfigured(target_url, lang)
        elif provider == "virustotal":
            return cls._check_virustotal(target_url, lang)
        elif provider == "safebrowsing":
            return cls._check_safebrowsing(target_url, lang)

        return cls._result_unconfigured(target_url, lang)

    # -------------------------------------------------------------------------
    # VirusTotal v3 Integration
    # -------------------------------------------------------------------------
    @classmethod
    def _check_virustotal(cls, target_url: str, lang: str) -> dict:
        api_key = Config.VIRUSTOTAL_API_KEY.strip()
        url_id = base64.urlsafe_b64encode(target_url.encode("utf-8")).decode("utf-8").strip("=")
        endpoint = f"{cls.VT_API_URL}/urls/{url_id}"
        headers = {
            "x-apikey": api_key,
            "Accept": "application/json"
        }

        try:
            resp = requests.get(endpoint, headers=headers, timeout=cls.REQUEST_TIMEOUT)

            # Case 1: URL found and analyzed
            if resp.status_code == 200:
                data = resp.json()
                attrs = data.get("data", {}).get("attributes", {})
                stats = attrs.get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                harmless = stats.get("harmless", 0)
                undetected = stats.get("undetected", 0)
                total_engines = malicious + suspicious + harmless + undetected

                # Positive Threat
                if malicious > 0 or suspicious > 1:
                    status = "Malicious/Suspicious"
                    score = min(99, 70 + (malicious * 10))
                    if lang == "te":
                        reason = (
                            f"వైరస్‌టోటల్ (VirusTotal) ప్రత్యక్ష తనిఖీలో {malicious} సెక్యూరిటీ ఇంజిన్లు "
                            f"ఈ లింక్‌ను హానికరమైనదిగా (Malicious/Phishing) గుర్తించాయి."
                        )
                        action = "ఈ లింక్‌ను తెరవవద్దు. మీ యూపీఐ పిన్ లేదా బ్యాంకింగ్ వివరాలు ఎప్పుడూ నమోదు చేయవద్దు. హెల్ప్‌లైన్ 1930 కి రిపోర్ట్ చేయండి."
                    else:
                        reason = (
                            f"Flagged as a security threat by {malicious} engine(s) on VirusTotal "
                            f"({suspicious} suspicious out of {total_engines} engines scanned)."
                        )
                        action = "Do not open this link or provide payment credentials. Block the sender and report to Cyber Crime Helpline 1930."
                    return cls._format_result(
                        status=status,
                        is_safe=False,
                        score=score,
                        reason=reason,
                        action=action,
                        source="VirusTotal v3",
                        configured=True,
                        raw_stats=stats
                    )

                # Clean in VirusTotal database
                status = "No known threats detected"
                score = 10
                if lang == "te":
                    reason = (
                        f"వైరస్‌టోటల్ ప్రత్యక్ష డేటాబేస్‌లోని {total_engines} సెక్యూరిటీ ఇంజిన్లలో ఎలాంటి ముప్పులు కనుగొనబడలేదు. "
                        f"గమనిక: ఏ లింక్ కూడా 100% సురక్షితమని హామీ ఇవ్వలేము; కొత్త ఫిషింగ్ పేజీలు ఇంకా నమోదు కాకపోవచ్చు."
                    )
                    action = "జాగ్రత్తగా కొనసాగండి. అధికారిక వెబ్‌సైట్ మరియు బ్రౌజర్ HTTPS గుర్తును నిర్ధారించుకోండి. యూపీఐ పిన్ ఎప్పుడూ నమోదు చేయవద్దు."
                else:
                    reason = (
                        f"No known threats detected across {total_engines} security vendors in the VirusTotal database. "
                        f"Note: Never guarantee a URL is 100% safe, as newly created phishing pages may not yet be indexed."
                    )
                    action = "Proceed with caution. Always verify HTTPS, inspect the exact domain name, and never enter your UPI PIN to receive money."
                return cls._format_result(
                    status=status,
                    is_safe=True,
                    score=score,
                    reason=reason,
                    action=action,
                    source="VirusTotal v3",
                    configured=True,
                    raw_stats=stats
                )

            # Case 2: URL not in VirusTotal database (404)
            if resp.status_code == 404:
                parsed = urlparse(target_url)
                domain = (parsed.hostname or "").lower()
                domain_checked = False
                domain_stats = {}

                if domain:
                    try:
                        dom_resp = requests.get(
                            f"{cls.VT_API_URL}/domains/{domain}",
                            headers=headers,
                            timeout=cls.REQUEST_TIMEOUT
                        )
                        if dom_resp.status_code == 200:
                            dom_data = dom_resp.json()
                            domain_stats = dom_data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                            domain_checked = True
                            dom_malicious = domain_stats.get("malicious", 0)
                            dom_suspicious = domain_stats.get("suspicious", 0)

                            if dom_malicious > 0 or dom_suspicious > 1:
                                status = "Malicious/Suspicious"
                                if lang == "te":
                                    reason = f"వైరస్‌టోటల్‌లో ఈ డొమైన్ ({domain}) పై {dom_malicious} సెక్యూరిటీ ముప్పులు నమోదయ్యాయి."
                                    action = "ఈ వెబ్‌సైట్‌ను సందర్శించవద్దు. బ్యాంకింగ్ లేదా వ్యక్తిగత సమాచారం నమోదు చేయవద్దు."
                                else:
                                    reason = f"Domain '{domain}' is flagged by {dom_malicious} threat engines on VirusTotal."
                                    action = "Do not open this website. Never disclose UPI PIN, OTPs, or passwords."
                                return cls._format_result(
                                    status=status,
                                    is_safe=False,
                                    score=85,
                                    reason=reason,
                                    action=action,
                                    source="VirusTotal v3 (Domain scan)",
                                    configured=True,
                                    raw_stats=domain_stats
                                )
                    except Exception as dom_err:
                        logger.debug(f"Domain lookup fallback error: {dom_err}")

                status = "Unable to Verify"
                if lang == "te":
                    reason = "ఈ నిర్దిష్ట లింక్‌కు వైరస్‌టోటల్ డేటాబేస్‌లో మునుపటి స్కానింగ్ రికార్డులు అందుబాటులో లేవు."
                    action = "జాగ్రత్త వహించండి. అపరిచిత లింక్‌లను క్లిక్ చేయవద్దు మరియు అధికారిక యాప్‌ల ద్వారా నేరుగా ధృవీకరించుకోండి."
                else:
                    reason = "This specific URL has no prior scan history in the VirusTotal live reputation database."
                    action = "Exercise caution. Do not enter personal details, passwords, or UPI PINs; verify directly through official channels."
                return cls._format_result(
                    status=status,
                    is_safe=False,
                    score=50,
                    reason=reason,
                    action=action,
                    source="VirusTotal v3",
                    configured=True,
                    details="HTTP 404 - Not yet indexed"
                )

            # Case 3: Rate limit / Quota exceeded (429)
            if resp.status_code == 429:
                status = "Unable to Verify"
                if lang == "te":
                    reason = "వైరస్‌టోటల్ లైవ్ కొటేషన్ పరిమితి (Rate limit / Quota exceeded) పూర్తయింది. ఈ సమయంలో లైవ్ తనిఖీ నిర్వహించలేము."
                    action = "కొంత సమయం తర్వాత మళ్ళీ ప్రయత్నించండి. అపరిచిత లింక్‌లలో మీ యూపీఐ పిన్ నమోదు చేయవద్దు."
                else:
                    reason = "VirusTotal API request quota exceeded (HTTP 429). Could not perform live threat intelligence lookup at this moment."
                    action = "Please retry after a few minutes. Never enter your UPI PIN or banking credentials on unverified links."
                return cls._format_result(
                    status=status,
                    is_safe=False,
                    score=50,
                    reason=reason,
                    action=action,
                    source="VirusTotal v3",
                    configured=True,
                    details="HTTP 429 Quota Exceeded"
                )

            # Case 4: Authentication error (401 / 403)
            if resp.status_code in (401, 403):
                status = "Unable to Verify"
                if lang == "te":
                    reason = "వైరస్‌టోటల్ API కీ చెల్లదు లేదా అనుమతించబడలేదు (HTTP 401/403). దయచేసి backend/.env లోని VIRUSTOTAL_API_KEY ని తనిఖీ చేయండి."
                    action = "అపరిచిత లింక్‌లను క్లిక్ చేయవద్దు."
                else:
                    reason = f"VirusTotal API key rejected or unauthorized (HTTP {resp.status_code}). Please verify VIRUSTOTAL_API_KEY in backend/.env."
                    action = "Do not trust unknown links. Verify payment requests directly inside your official UPI app."
                return cls._format_result(
                    status=status,
                    is_safe=False,
                    score=50,
                    reason=reason,
                    action=action,
                    source="VirusTotal v3",
                    configured=False,
                    details=f"HTTP {resp.status_code} Auth Error"
                )

            status = "Unable to Verify"
            reason = f"VirusTotal service returned unexpected HTTP response {resp.status_code}."
            action = "Exercise caution. Do not click unknown links."
            return cls._format_result(
                status=status,
                is_safe=False,
                score=50,
                reason=reason,
                action=action,
                source="VirusTotal v3",
                configured=True,
                details=f"HTTP {resp.status_code}"
            )

        except requests.exceptions.Timeout:
            status = "Unable to Verify"
            if lang == "te":
                reason = "వైరస్‌టోటల్ సర్వర్‌తో కనెక్షన్ సమయం ముగిసింది (Request timed out). లైవ్ తనిఖీ పూర్తి కాలేదు."
                action = "దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ని సరిచూసి మళ్ళీ ప్రయత్నించండి."
            else:
                reason = "VirusTotal reputation service request timed out. Could not complete live database verification."
                action = "Please verify your network connection and retry. Exercise caution before opening unfamiliar links."
            return cls._format_result(status, False, 50, reason, action, "VirusTotal v3", True, "Timeout")

        except Exception as exc:
            logger.error(f"VirusTotal lookup error: {exc}")
            status = "Unable to Verify"
            reason = f"Unable to reach VirusTotal live service: {type(exc).__name__}."
            action = "Do not enter passwords or UPI PINs on unverified links."
            return cls._format_result(status, False, 50, reason, action, "VirusTotal v3", True, str(exc))

    # -------------------------------------------------------------------------
    # Google Safe Browsing Lookup API (v4) Integration
    # -------------------------------------------------------------------------
    @classmethod
    def _check_safebrowsing(cls, target_url: str, lang: str) -> dict:
        api_key = Config.SAFE_BROWSING_API_KEY.strip()
        endpoint = f"{cls.SAFE_BROWSING_API_URL}?key={api_key}"
        payload = {
            "client": {
                "clientId": "upisurakshamitra",
                "clientVersion": "4.0.0"
            },
            "threatInfo": {
                "threatTypes": [
                    "MALWARE",
                    "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE",
                    "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": target_url}]
            }
        }

        try:
            resp = requests.post(endpoint, json=payload, timeout=cls.REQUEST_TIMEOUT)

            if resp.status_code == 200:
                data = resp.json() or {}
                matches = data.get("matches", [])

                if matches:
                    threat_types = list({m.get("threatType", "THREAT") for m in matches})
                    threat_summary = ", ".join(threat_types)
                    status = "Malicious/Suspicious"
                    score = 95
                    if lang == "te":
                        reason = f"గూగుల్ సేఫ్ బ్రౌజింగ్ (Google Safe Browsing) ఈ లింక్‌ను ముప్పుగా గుర్తించింది: {threat_summary}."
                        action = "ఈ లింక్‌ను ఎట్టి పరిస్థితుల్లోనూ తెరవవద్దు. సైబర్ హెల్ప్‌లైన్ 1930 కి రిపోర్ట్ చేయండి."
                    else:
                        reason = f"Google Safe Browsing identified this URL as an active threat: {threat_summary}."
                        action = "Do not open this link under any circumstances. Never enter your UPI PIN or banking credentials."
                    return cls._format_result(
                        status=status,
                        is_safe=False,
                        score=score,
                        reason=reason,
                        action=action,
                        source="Google Safe Browsing v4",
                        configured=True,
                        details={"matches": matches}
                    )

                status = "No known threats detected"
                score = 10
                if lang == "te":
                    reason = (
                        "గూగుల్ సేఫ్ బ్రౌజింగ్ ప్రత్యక్ష తనిఖీలో ఎలాంటి బెదిరింపులు కనుగొనబడలేదు. "
                        "గమనిక: ఏ లింక్ కూడా 100% సురక్షితమని హామీ ఇవ్వలేము; కొత్త ఫిషింగ్ పేజీలు ఇంకా డేటాబేస్‌లో నమోదు కాకపోవచ్చు."
                    )
                    action = "జాగ్రత్తగా కొనసాగండి. అధికారిక వెబ్‌సైట్ మరియు HTTPS గుర్తును నిర్ధారించుకోండి. డబ్బులు స్వీకరించడానికి ఎప్పుడూ మీ యూపీఐ పిన్ ఎంటర్ చేయవద్దు."
                else:
                    reason = (
                        "Google Safe Browsing reported no threat matches for this URL. "
                        "Note: Never guarantee a URL is 100% safe, as newly launched phishing sites may not yet be indexed."
                    )
                    action = "Proceed with caution. Always verify HTTPS, inspect the domain, and never enter your UPI PIN to receive funds."
                return cls._format_result(
                    status=status,
                    is_safe=True,
                    score=score,
                    reason=reason,
                    action=action,
                    source="Google Safe Browsing v4",
                    configured=True,
                    details="No matches found"
                )

            if resp.status_code == 429:
                status = "Unable to Verify"
                if lang == "te":
                    reason = "గూగుల్ సేఫ్ బ్రౌజింగ్ API కొటేషన్ పరిమితి ముగిసింది (HTTP 429). ప్రస్తుతానికి లైవ్ తనిఖీ నిర్వహించలేము."
                    action = "కొంత సమయం తర్వాత ప్రయత్నించండి. అపరిచిత లింక్‌లలో వ్యక్తిగత వివరాలను నమోదు చేయవద్దు."
                else:
                    reason = "Google Safe Browsing API quota exceeded (HTTP 429). Could not perform live threat check at this moment."
                    action = "Please retry shortly. Exercise caution and do not disclose banking details."
                return cls._format_result(status, False, 50, reason, action, "Google Safe Browsing v4", True, "HTTP 429 Quota Exceeded")

            if resp.status_code in (400, 401, 403):
                status = "Unable to Verify"
                if lang == "te":
                    reason = f"గూగుల్ సేఫ్ బ్రౌజింగ్ API కీ అనుమతించబడలేదు (HTTP {resp.status_code}). దయచేసి backend/.env లో SAFE_BROWSING_API_KEY ని సరిచూడండి."
                    action = "అపరిచిత లింక్‌లను క్లిక్ చేయవద్దు."
                else:
                    reason = (
                        f"Google Safe Browsing API returned HTTP {resp.status_code}. "
                        "Expected a valid Google Cloud API key with Safe Browsing API enabled in SAFE_BROWSING_API_KEY."
                    )
                    action = "Do not trust unknown links. Verify payments directly in your official banking app."
                return cls._format_result(status, False, 50, reason, action, "Google Safe Browsing v4", False, f"HTTP {resp.status_code}")

            status = "Unable to Verify"
            reason = f"Google Safe Browsing returned HTTP {resp.status_code}."
            action = "Exercise caution. Do not click unknown links."
            return cls._format_result(status, False, 50, reason, action, "Google Safe Browsing v4", True, f"HTTP {resp.status_code}")

        except requests.exceptions.Timeout:
            status = "Unable to Verify"
            if lang == "te":
                reason = "గూగుల్ సేఫ్ బ్రౌజింగ్ సర్వర్ అభ్యర్థన సమయం ముగిసింది (Timeout)."
                action = "దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ని సరిచూసి మళ్ళీ ప్రయత్నించండి."
            else:
                reason = "Google Safe Browsing request timed out. Could not complete live verification."
                action = "Please verify your network connection and retry."
            return cls._format_result(status, False, 50, reason, action, "Google Safe Browsing v4", True, "Timeout")

        except Exception as exc:
            logger.error(f"Google Safe Browsing error: {exc}")
            status = "Unable to Verify"
            reason = f"Unable to reach Google Safe Browsing service: {type(exc).__name__}."
            action = "Do not enter passwords or UPI PINs on unverified links."
            return cls._format_result(status, False, 50, reason, action, "Google Safe Browsing v4", True, str(exc))

    # -------------------------------------------------------------------------
    # Fallback when no live provider is configured
    # -------------------------------------------------------------------------
    @classmethod
    def _result_unconfigured(cls, target_url: str, lang: str) -> dict:
        status = "Unable to Verify"
        score = 50
        if lang == "te":
            reason = (
                "ప్రత్యక్ష ముప్పు ఇంటెలిజెన్స్ API కీ (VirusTotal లేదా Google Safe Browsing) backend/.env లో కాన్ఫిగర్ చేయబడలేదు. "
                "లైవ్ సెక్యూరిటీ స్కానింగ్ కోసం backend/.env లో VIRUSTOTAL_API_KEY లేదా SAFE_BROWSING_API_KEY ని సెట్ చేయండి. "
                "లైవ్ సెక్యూరిటీ డేటాబేస్ తనిఖీ నిర్వహించలేము."
            )
            action = "జాగ్రత్త వహించండి. అపరిచిత లింక్‌లలో మీ యూపీఐ పిన్, ఓటీపీ లేదా బ్యాంకింగ్ ఆధారాలను ఎప్పుడూ నమోదు చేయవద్దు; అధికారిక మూలాల ద్వారా ధృవీకరించుకోండి."
        else:
            reason = (
                "No live threat intelligence API key (VirusTotal or Google Safe Browsing) is configured in backend/.env. "
                "Set VIRUSTOTAL_API_KEY or SAFE_BROWSING_API_KEY to enable live reputation scanning. "
                "Could not verify domain against a live reputation database."
            )
            action = (
                "Exercise caution. Do not enter sensitive credentials, passwords, or your UPI PIN; "
                "verify the domain directly via official sources."
            )

        return cls._format_result(
            status=status,
            is_safe=False,
            score=score,
            reason=reason,
            action=action,
            source="None (Unconfigured)",
            configured=False,
            details="API keys not provided in backend/.env"
        )

    @classmethod
    def _format_result(
        cls,
        status: str,
        is_safe: bool,
        score: int,
        reason: str,
        action: str,
        source: str,
        configured: bool,
        details=None,
        raw_stats=None
    ) -> dict:
        return {
            "status": status,
            "riskLevel": status,
            "isSafe": is_safe,
            "score": score,
            "reason": reason,
            "action": action,
            "source": source,
            "configured": configured,
            "details": details,
            "rawStats": raw_stats
        }
