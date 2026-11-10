import sys
import json
import unittest
from unittest.mock import patch, MagicMock
import requests
import socket

if sys.platform == 'win32' and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app import app
from config import Config
from services.upi_service import UpiService
from services.url_reputation_service import UrlReputationService
from services.gemini_service import GeminiService

class TestLinkAndUpiAuditSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    # -------------------------------------------------------------------------
    # 1. A valid UPI ID format
    # -------------------------------------------------------------------------
    def test_01_valid_upi_id_format(self):
        print("\n[Test 1] Testing Valid UPI ID Format...")
        res = self.client.post('/api/verify-upi', json={'vpa': 'shopkeeper_ramesh@okhdfcbank', 'language': 'en'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertTrue(data['isValidFormat'])
        self.assertFalse(data['isUrl'])
        self.assertEqual(data['status'], 'Format Valid (Account Unverified)')
        self.assertIn('0 Complaints', data['riskLevel'])
        self.assertFalse(data.get('verificationGuaranteed', True))
        print("✓ Valid UPI ID accepted with truthful unverified account status (NOT marked as false SAFE)")

    # -------------------------------------------------------------------------
    # 2. A malformed UPI ID
    # -------------------------------------------------------------------------
    def test_02_malformed_upi_id(self):
        print("\n[Test 2] Testing Malformed UPI ID...")
        res = self.client.post('/api/verify-upi', json={'vpa': 'invalid_handle_without_at_symbol', 'language': 'en'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertFalse(data['isValidFormat'])
        self.assertEqual(data['status'], 'Malformed UPI Handle')
        self.assertEqual(data['riskLevel'], 'Invalid Format')
        print("✓ Malformed UPI handle rejected with clear syntax error")

    # -------------------------------------------------------------------------
    # 3. A supported phone-number format
    # -------------------------------------------------------------------------
    def test_03_supported_phone_format(self):
        print("\n[Test 3] Testing Supported Phone Number Format...")
        res = self.client.post('/api/verify-upi', json={'vpa': '9876543210', 'language': 'en'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertTrue(data['isValidFormat'])
        self.assertEqual(data['inputType'], 'phone')
        self.assertEqual(data['status'], 'Format Valid (Account Unverified)')
        print("✓ 10-digit mobile phone number recognized as valid UPI phone format")

    # -------------------------------------------------------------------------
    # 4. https://example.com entered in the UPI VPA field
    # -------------------------------------------------------------------------
    def test_04_url_entered_in_upi_vpa_field(self):
        print("\n[Test 4] Testing 'https://example.com' entered in UPI VPA field...")
        res = self.client.post('/api/verify-upi', json={'vpa': 'https://example.com', 'language': 'en'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertTrue(data['isUrl'])
        self.assertFalse(data['isValidFormat'])
        self.assertFalse(data['isSafe'])
        self.assertNotEqual(data['status'], 'VERIFIED REGULAR UPI ID')
        self.assertIn('URL Submitted in UPI VPA Field', data['status'])
        self.assertEqual(data['suggestedAction'], 'open_link_tester')
        self.assertIn('Suspicious Link Tester', data['reason'])
        print("✓ 'https://example.com' rejected in UPI field, directed to Link Tester, NOT marked as SAFE")

    # -------------------------------------------------------------------------
    # 5. A valid URL submitted to the Suspicious Link Tester
    # -------------------------------------------------------------------------
    def test_05_valid_url_submitted_to_link_tester(self):
        print("\n[Test 5] Testing Valid URL in Suspicious Link Tester...")
        res = self.client.post('/api/ai/analyze-link', json={'url': 'https://cybercrime.gov.in', 'language': 'en'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['status'], 'No known threats detected')
        self.assertIn('Note: Never guarantee a URL is 100% safe', data['reason'])
        print("✓ Valid official URL recognized with mandatory disclaimer (never guaranteed 100% safe)")

    # -------------------------------------------------------------------------
    # 6. A malformed URL and an unsupported URL scheme
    # -------------------------------------------------------------------------
    def test_06_malformed_url_and_unsupported_scheme(self):
        print("\n[Test 6] Testing Malformed URL and Unsupported Schemes...")
        # Unsupported scheme: ftp://
        res1 = self.client.post('/api/ai/analyze-link', json={'url': 'ftp://malicious-server.com/payload', 'language': 'en'})
        self.assertEqual(res1.status_code, 400)
        data1 = res1.get_json()
        self.assertFalse(data1['success'])
        self.assertIn('Only standard HTTP and HTTPS', data1['reason'])

        # Unsupported scheme: javascript:
        res2 = self.client.post('/api/ai/analyze-link', json={'url': 'javascript:alert(1)', 'language': 'en'})
        self.assertEqual(res2.status_code, 400)

        # Empty URL
        res3 = self.client.post('/api/ai/analyze-link', json={'url': '   ', 'language': 'en'})
        self.assertEqual(res3.status_code, 400)
        print("✓ Unsupported schemes (ftp, javascript) and empty URLs cleanly rejected with HTTP 400")

    # -------------------------------------------------------------------------
    # 7. Zero community complaints without a false SAFE result
    # -------------------------------------------------------------------------
    def test_07_zero_complaints_no_false_safe(self):
        print("\n[Test 7] Testing Zero Community Complaints Truthful Status...")
        res = self.client.post('/api/verify-upi', json={'vpa': 'clean_user_test@okaxis', 'language': 'en'})
        data = res.get_json()
        self.assertEqual(data['reportsCount'], 0)
        self.assertNotEqual(data['status'], 'SAFE')
        self.assertNotEqual(data['status'], 'VERIFIED REGULAR UPI ID')
        self.assertEqual(data['status'], 'Format Valid (Account Unverified)')
        self.assertIn('Syntax validation does not prove account existence', data['reason'])
        print("✓ Zero complaints handle is NOT labeled 'SAFE' or 'VERIFIED ACCOUNT HOLDER'")

    # -------------------------------------------------------------------------
    # 8. Unavailable threat-intelligence APIs
    # -------------------------------------------------------------------------
    def test_08_unavailable_threat_intelligence_apis(self):
        print("\n[Test 8] Testing Behavior When Threat Intelligence APIs are Unavailable...")
        # Test third-party domain when VT & SafeBrowsing are unconfigured
        with patch.object(UrlReputationService, 'get_configured_provider', return_value='none'):
            res = self.client.post('/api/ai/analyze-link', json={'url': 'https://arbitrary-unindexed-domain.org', 'language': 'en'})
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data['status'], 'Unable to Verify')
            self.assertFalse(data['reputationConfigured'])
            self.assertEqual(data['reputationSource'], 'None (Unconfigured)')
            self.assertIn('No live threat intelligence API key', data['reason'])
        print("✓ Unconfigured APIs transparently reported as 'Unable to Verify' without pretending to be connected")

    # -------------------------------------------------------------------------
    # 9. Invalid API keys, timeouts, rate limits, and partial failures
    # -------------------------------------------------------------------------
    def test_09_api_failures_and_rate_limits(self):
        print("\n[Test 9] Testing API Quota, Auth, and Timeout Error Handling...")
        # 429 Quota Exceeded Mock
        mock_resp_429 = MagicMock()
        mock_resp_429.status_code = 429
        with patch('requests.get', return_value=mock_resp_429), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='virustotal'):
            res429 = UrlReputationService.check_url('https://test.com', language='en')
            self.assertEqual(res429['status'], 'Unable to Verify')
            self.assertIn('HTTP 429', res429['details'])

        # 401 Auth Error Mock
        mock_resp_401 = MagicMock()
        mock_resp_401.status_code = 401
        with patch('requests.get', return_value=mock_resp_401), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='virustotal'):
            res401 = UrlReputationService.check_url('https://test.com', language='en')
            self.assertEqual(res401['status'], 'Unable to Verify')
            self.assertFalse(res401['configured'])

        # Timeout Mock
        with patch('requests.get', side_effect=requests.exceptions.Timeout), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='virustotal'):
            res_to = UrlReputationService.check_url('https://test.com', language='en')
            self.assertEqual(res_to['status'], 'Unable to Verify')
            self.assertEqual(res_to['details'], 'Timeout')
        print("✓ Quota (429), Auth (401), and Timeouts handled with honest 'Unable to Verify'")

    # -------------------------------------------------------------------------
    # 10. Suspicious redirect destinations, punycode, and private IP access
    # -------------------------------------------------------------------------
    def test_10_redirects_punycode_and_private_ip_ssrf(self):
        print("\n[Test 10] Testing SSRF, Punycode Lookalikes, and Deceptive Subdomains...")
        # Private loopback IP check
        res_loopback = self.client.post('/api/ai/analyze-link', json={'url': 'http://127.0.0.1:5000/api/health', 'language': 'en'})
        data_loopback = res_loopback.get_json()
        self.assertEqual(data_loopback['status'], 'Malicious/Suspicious')
        self.assertIn('SSRF', data_loopback['reason'])

        # Cloud Metadata IP check
        res_meta = self.client.post('/api/ai/analyze-link', json={'url': 'http://169.254.169.254/latest/meta-data', 'language': 'en'})
        data_meta = res_meta.get_json()
        self.assertEqual(data_meta['status'], 'Malicious/Suspicious')

        # Punycode domain detection
        res_puny = self.client.post('/api/ai/analyze-link', json={'url': 'https://xn--sbi-9cd.com/login', 'language': 'en'})
        data_puny = res_puny.get_json()
        self.assertEqual(data_puny['status'], 'Malicious/Suspicious')
        self.assertIn('Punycode', data_puny['reason'])

        # Deceptive brand subdomain spoofing detection
        res_deceptive = self.client.post('/api/ai/analyze-link', json={'url': 'https://sbi.co.in.scam-host.xyz/verify', 'language': 'en'})
        data_deceptive = res_deceptive.get_json()
        self.assertEqual(data_deceptive['status'], 'Malicious/Suspicious')
        self.assertIn('Deceptive brand subdomain', data_deceptive['reason'])
        print("✓ Private IPs, Cloud Metadata, Punycode (xn--), and Deceptive Subdomains properly blocked")

    # -------------------------------------------------------------------------
    # 11. English and Telugu result messages
    # -------------------------------------------------------------------------
    def test_11_english_and_telugu_localization(self):
        print("\n[Test 11] Testing English and Telugu Result Messages...")
        # Telugu URL test
        with patch.object(UrlReputationService, 'get_configured_provider', return_value='none'):
            res_te_url = self.client.post('/api/ai/analyze-link', json={'url': 'https://example.com', 'language': 'te'})
            data_te_url = res_te_url.get_json()
            self.assertIn('లైవ్ సెక్యూరిటీ డేటాబేస్ తనిఖీ నిర్వహించలేము', data_te_url['reason'])

        # Telugu UPI test (URL in UPI field)
        res_te_upi_url = self.client.post('/api/verify-upi', json={'vpa': 'https://example.com', 'language': 'te'})
        data_te_upi_url = res_te_upi_url.get_json()
        self.assertIn('వెబ్‌సైట్ లింక్', data_te_upi_url['status'])
        self.assertIn('అనుమానాస్పద లింక్ టెస్టర్', data_te_upi_url['reason'])

        # Telugu Valid Handle test
        res_te_valid = self.client.post('/api/verify-upi', json={'vpa': 'kalyan@okhdfcbank', 'language': 'te'})
        data_te_valid = res_te_valid.get_json()
        self.assertIn('ఫార్మాట్ సరైనది', data_te_valid['status'])
        self.assertIn('ధృవీకరించలేము', data_te_valid['reason'])
        print("✓ Natural Telugu translations verified for both Link Analysis and UPI Verification")

    # -------------------------------------------------------------------------
    # 12. Flagged scam handle check
    # -------------------------------------------------------------------------
    def test_12_flagged_scam_handle(self):
        print("\n[Test 12] Testing Flagged Fraud Handle Detection...")
        res = self.client.post('/api/verify-upi', json={'vpa': 'sbi_army_refund@upi', 'language': 'en'})
        data = res.get_json()
        self.assertEqual(data['status'], 'FLAGGED SUSPICIOUS UPI ID')
        self.assertEqual(data['riskLevel'], 'High Threat')
        self.assertEqual(data['reportsCount'], 42)
        self.assertIn('Helpline 1930', data['action'])
        print("✓ Fraud keywords / reported handles correctly flagged with High Threat warning")

    # -------------------------------------------------------------------------
    # 13. VirusTotal live provider: Known Threat vs Clean Result
    # -------------------------------------------------------------------------
    def test_13_virustotal_threat_detection_and_clean_result(self):
        print("\n[Test 13] Testing VirusTotal Known Threat vs Clean Result Handling...")
        
        # 13a. Known Threat (Evidence-supported)
        mock_vt_threat = MagicMock()
        mock_vt_threat.status_code = 200
        mock_vt_threat.json.return_value = {
            "data": {
                "attributes": {
                    "last_analysis_stats": {
                        "malicious": 14,
                        "suspicious": 3,
                        "harmless": 45,
                        "undetected": 10
                    }
                }
            }
        }
        with patch('requests.get', return_value=mock_vt_threat), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='virustotal'):
            res_threat = UrlReputationService.check_url('https://phishing-scam-site.org/login', language='en')
            self.assertEqual(res_threat['status'], 'Malicious/Suspicious')
            self.assertFalse(res_threat['isSafe'])
            self.assertGreaterEqual(res_threat['score'], 90)
            self.assertIn('14 engine(s)', res_threat['reason'])
            self.assertEqual(res_threat['source'], 'VirusTotal v3')

        # 13b. Clean Result (Mandatory Disclaimer: Never guaranteed 100% safe)
        mock_vt_clean = MagicMock()
        mock_vt_clean.status_code = 200
        mock_vt_clean.json.return_value = {
            "data": {
                "attributes": {
                    "last_analysis_stats": {
                        "malicious": 0,
                        "suspicious": 0,
                        "harmless": 72,
                        "undetected": 0
                    }
                }
            }
        }
        with patch('requests.get', return_value=mock_vt_clean), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='virustotal'):
            res_clean = UrlReputationService.check_url('https://unflagged-clean-site.com', language='en')
            self.assertEqual(res_clean['status'], 'No known threats detected')
            self.assertIn('Never guarantee a URL is 100% safe', res_clean['reason'])
        print("✓ VirusTotal evidence-supported threat and clean results with mandatory safety disclaimer verified")

    # -------------------------------------------------------------------------
    # 14. Google Safe Browsing live provider: Known Threat vs Clean Result
    # -------------------------------------------------------------------------
    def test_14_safebrowsing_threat_detection_and_clean_result(self):
        print("\n[Test 14] Testing Google Safe Browsing Threat vs Clean Result...")
        
        # 14a. Known Threat (Evidence-supported)
        mock_sb_threat = MagicMock()
        mock_sb_threat.status_code = 200
        mock_sb_threat.json.return_value = {
            "matches": [
                {"threatType": "MALWARE", "platformType": "ANY_PLATFORM"},
                {"threatType": "SOCIAL_ENGINEERING", "platformType": "ANY_PLATFORM"}
            ]
        }
        with patch('requests.post', return_value=mock_sb_threat), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='safebrowsing'):
            res_sb_threat = UrlReputationService.check_url('https://infected-malware.biz/dl', language='en')
            self.assertEqual(res_sb_threat['status'], 'Malicious/Suspicious')
            self.assertFalse(res_sb_threat['isSafe'])
            self.assertEqual(res_sb_threat['score'], 95)
            self.assertIn('MALWARE', res_sb_threat['reason'])
            self.assertEqual(res_sb_threat['source'], 'Google Safe Browsing v4')

        # 14b. Clean Result (Mandatory Disclaimer: Never guaranteed 100% safe)
        mock_sb_clean = MagicMock()
        mock_sb_clean.status_code = 200
        mock_sb_clean.json.return_value = {"matches": []}
        with patch('requests.post', return_value=mock_sb_clean), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='safebrowsing'):
            res_sb_clean = UrlReputationService.check_url('https://unflagged-clean-site.com', language='en')
            self.assertEqual(res_sb_clean['status'], 'No known threats detected')
            self.assertIn('Never guarantee a URL is 100% safe', res_sb_clean['reason'])
        print("✓ Safe Browsing threat detection and clean status with disclaimer verified")

    # -------------------------------------------------------------------------
    # 15. Google Safe Browsing Auth, Quota, and Timeout Error Handling
    # -------------------------------------------------------------------------
    def test_15_safebrowsing_auth_quota_and_timeout(self):
        print("\n[Test 15] Testing Safe Browsing Auth, Quota, and Timeout Handling...")
        
        # 15a. 401 Auth Error
        mock_401 = MagicMock()
        mock_401.status_code = 401
        with patch('requests.post', return_value=mock_401), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='safebrowsing'):
            res_401 = UrlReputationService.check_url('https://test.com', language='en')
            self.assertEqual(res_401['status'], 'Unable to Verify')
            self.assertFalse(res_401['configured'])
            self.assertIn('SAFE_BROWSING_API_KEY', res_401['reason'])

        # 15b. 429 Quota Exceeded
        mock_429 = MagicMock()
        mock_429.status_code = 429
        with patch('requests.post', return_value=mock_429), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='safebrowsing'):
            res_429 = UrlReputationService.check_url('https://test.com', language='en')
            self.assertEqual(res_429['status'], 'Unable to Verify')
            self.assertIn('HTTP 429 Quota Exceeded', res_429['details'])

        # 15c. Timeout
        with patch('requests.post', side_effect=requests.exceptions.Timeout), \
             patch.object(UrlReputationService, 'get_configured_provider', return_value='safebrowsing'):
            res_to = UrlReputationService.check_url('https://test.com', language='en')
            self.assertEqual(res_to['status'], 'Unable to Verify')
            self.assertEqual(res_to['details'], 'Timeout')
        print("✓ Safe Browsing Auth (401), Quota (429), and Timeouts handled with honest 'Unable to Verify'")

    # -------------------------------------------------------------------------
    # 16. Harmless URL test: https://example.com/ in unconfigured environment
    # -------------------------------------------------------------------------
    def test_16_harmless_url_example_com_unconfigured(self):
        print("\n[Test 16] Testing Harmless URL (https://example.com/) in unconfigured environment...")
        with patch.object(UrlReputationService, 'get_configured_provider', return_value='none'):
            res = self.client.post('/api/ai/analyze-link', json={'url': 'https://example.com/', 'language': 'en'})
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertTrue(data['success'])
            self.assertEqual(data['status'], 'Unable to Verify')
            self.assertFalse(data['reputationConfigured'])
            self.assertEqual(data['reputationSource'], 'None (Unconfigured)')
            self.assertIn('VIRUSTOTAL_API_KEY or SAFE_BROWSING_API_KEY', data['reason'])
        print("✓ Harmless URL (https://example.com/) transparently returns 'Unable to Verify' pointing to env vars")

    # -------------------------------------------------------------------------
    # 18. VirusTotal configured provider test
    # -------------------------------------------------------------------------
    def test_18_virustotal_provider_detection(self):
        print("\n[Test 18] Testing VirusTotal Provider Detection & Priority...")
        with patch.object(Config, 'VIRUSTOTAL_API_KEY', 'valid_test_key_vt'), \
             patch.object(Config, 'SAFE_BROWSING_API_KEY', ''):
            self.assertEqual(UrlReputationService.get_configured_provider(), 'virustotal')
        print("✓ VirusTotal recognized as active provider when VIRUSTOTAL_API_KEY is configured")

    # -------------------------------------------------------------------------
    # 17. Verify Gemini API is NOT used for link analysis
    # -------------------------------------------------------------------------
    def test_17_verify_gemini_not_used_for_link_analysis(self):
        print("\n[Test 17] Verifying Gemini API is isolated and NOT used for link analysis...")
        with patch.object(GeminiService, 'generate_content') as mock_gen:
            res = self.client.post('/api/ai/analyze-link', json={'url': 'https://example.com/', 'language': 'en'})
            self.assertEqual(res.status_code, 200)
            mock_gen.assert_not_called()
        print("✓ Confirmed Gemini API is NOT invoked for URL threat verification")

    # -------------------------------------------------------------------------
    # 19. NAT64 Exact Failing Case & Safe Public IPv4/IPv6 Addresses
    # -------------------------------------------------------------------------
    def test_19_nat64_exact_failing_case_and_public_ipv4_ipv6(self):
        print("\n[Test 19] Testing Exact Failing Case & Safe Public IPv4/IPv6 Addresses...")
        # 19a. Exact failing case: cybercrime.gov.in resolving to NAT64 address 64:ff9b::2d7f:4bd2
        mock_addrinfo_gov = [(socket.AF_INET6, socket.SOCK_STREAM, 0, '', ('64:ff9b::2d7f:4bd2', 443, 0, 0))]
        with patch('socket.getaddrinfo', return_value=mock_addrinfo_gov):
            is_ssrf, ssrf_reason = UrlReputationService.check_hostname_ssrf('cybercrime.gov.in')
            self.assertFalse(is_ssrf, f"cybercrime.gov.in NAT64 should not be flagged as SSRF: {ssrf_reason}")

            # Verify endpoint produces clean official domain status, not SSRF block
            res = self.client.post('/api/ai/analyze-link', json={'url': 'https://cybercrime.gov.in', 'language': 'en'})
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data['status'], 'No known threats detected')
            self.assertIn('official government', data['reason'])

        # 19b. Safe public IPv4, IPv6, and NAT64 addresses
        safe_addresses = [
            '8.8.8.8',                      # Public IPv4 (Google DNS)
            '1.1.1.1',                      # Public IPv4 (Cloudflare DNS)
            '45.127.75.210',                # Public IPv4 (Cybercrime portal)
            '2606:4700:4700::1111',         # Public IPv6 (Cloudflare)
            '2001:4860:4860::8888',         # Public IPv6 (Google)
            '64:ff9b::2d7f:4bd2',           # NAT64 public (embeds 45.127.75.210)
            '64:ff9b::8.8.8.8',             # NAT64 public dotted quad
            '::ffff:8.8.8.8',               # IPv4-mapped public
            '::ffff:0:8.8.8.8',             # IPv4-translated (SIIT) public
        ]
        for addr in safe_addresses:
            self.assertFalse(
                UrlReputationService.is_restricted_ip(addr),
                f"Address '{addr}' should be recognized as safe/public, not restricted"
            )
        print("✓ Verified exact failing case resolved: cybercrime.gov.in NAT64 accepted and public IPs allowed")

    # -------------------------------------------------------------------------
    # 20. Prohibited Destinations via NAT64, IPv4-Mapped, and Internal Ranges
    # -------------------------------------------------------------------------
    def test_20_nat64_and_mapped_prohibited_destinations(self):
        print("\n[Test 20] Testing Prohibited Destinations via NAT64 and Mapped IPv6...")
        prohibited_addresses = [
            '127.0.0.1',                    # IPv4 loopback
            '169.254.169.254',              # IPv4 cloud metadata
            '10.0.0.1',                     # IPv4 private 10/8
            '172.16.0.1',                   # IPv4 private 172.16/12
            '192.168.1.1',                  # IPv4 private 192.168/16
            '100.64.0.1',                   # IPv4 Carrier-Grade NAT
            '0.0.0.0',                      # IPv4 current network
            '::1',                          # IPv6 loopback
            '[::1]',                        # IPv6 loopback with brackets
            'fe80::1',                      # IPv6 link-local
            'fc00::1',                      # IPv6 Unique Local Address (ULA)
            '64:ff9b::127.0.0.1',           # NAT64 loopback
            '64:ff9b::7f00:1',              # NAT64 loopback (hex)
            '64:ff9b::169.254.169.254',     # NAT64 cloud metadata
            '64:ff9b::a9fe:a9fe',           # NAT64 cloud metadata (hex)
            '64:ff9b::10.0.0.1',            # NAT64 private 10.x
            '64:ff9b::192.168.1.1',         # NAT64 private 192.168.x
            '64:ff9b::100.64.0.1',          # NAT64 Carrier-Grade NAT
            '64:ff9b:1::8.8.8.8',           # RFC 8215 Local-Use NAT64 (always restricted)
            '::ffff:127.0.0.1',             # IPv4-mapped loopback
            '::ffff:169.254.169.254',       # IPv4-mapped cloud metadata
            '::ffff:0:127.0.0.1',           # IPv4-translated (SIIT) loopback
            '::127.0.0.1',                  # Deprecated IPv4-compatible loopback
        ]
        for addr in prohibited_addresses:
            self.assertTrue(
                UrlReputationService.is_restricted_ip(addr),
                f"Prohibited destination '{addr}' must be blocked by is_restricted_ip"
            )

        # Direct API test: sending NAT64 loopback to analyze-link must return SSRF block
        res_nat64_loopback = self.client.post('/api/ai/analyze-link', json={
            'url': 'http://[64:ff9b::127.0.0.1]:5000/api/health',
            'language': 'en'
        })
        self.assertEqual(res_nat64_loopback.status_code, 200)
        data = res_nat64_loopback.get_json()
        self.assertEqual(data['status'], 'Malicious/Suspicious')
        self.assertIn('SSRF', data['reason'])
        print("✓ All prohibited NAT64, IPv4-mapped, cloud metadata, and loopback addresses strictly blocked")

    # -------------------------------------------------------------------------
    # 21. Redirects and DNS Rebinding Safeguards
    # -------------------------------------------------------------------------
    def test_21_redirects_and_dns_resolution_changes(self):
        print("\n[Test 21] Testing Redirect Destination Safety & DNS Rebinding Protections...")
        
        # 21a. Safe redirect hop inspection: redirecting to a prohibited NAT64 destination
        mock_redirect_resp = MagicMock()
        mock_redirect_resp.status_code = 302
        mock_redirect_resp.headers = {'Location': 'http://[64:ff9b::127.0.0.1]:5000/admin'}
        with patch('requests.Session.get', return_value=mock_redirect_resp):
            redirect_result = UrlReputationService.inspect_redirects_safely('https://innocent-shortener.com/link')
            self.assertFalse(redirect_result['safe'])
            self.assertEqual(redirect_result['error'], 'SSRF_BLOCKED')
            self.assertIn('SSRF filter', redirect_result['reason'])

        # 21b. DNS Rebinding: Hostname changes resolution to internal IP (e.g. 127.0.0.1 or NAT64 loopback)
        mock_rebound_addrinfo = [(socket.AF_INET, socket.SOCK_STREAM, 0, '', ('127.0.0.1', 80))]
        with patch('socket.getaddrinfo', return_value=mock_rebound_addrinfo):
            is_ssrf, ssrf_reason = UrlReputationService.check_hostname_ssrf('rebound-domain.com')
            self.assertTrue(is_ssrf)
            self.assertIn('resolves to restricted internal IP', ssrf_reason)

        # 21c. DNS Rebinding targeting NAT64 loopback
        mock_rebound_nat64 = [(socket.AF_INET6, socket.SOCK_STREAM, 0, '', ('64:ff9b::7f00:1', 80, 0, 0))]
        with patch('socket.getaddrinfo', return_value=mock_rebound_nat64):
            is_ssrf, ssrf_reason = UrlReputationService.check_hostname_ssrf('rebound-nat64.com')
            self.assertTrue(is_ssrf)
            self.assertIn('resolves to restricted internal IP', ssrf_reason)

        print("✓ Safe redirect hops and DNS rebinding protections verified against NAT64 and loopback bypasses")

if __name__ == '__main__':
    print("=" * 70)
    print("UPI Suraksha Mitra — Complete Link Tester & UPI Verifier Test Suite")
    print("=" * 70)
    unittest.main()
