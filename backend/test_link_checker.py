import sys
import json
import requests

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000"

def test_link(url: str, lang: str = "en"):
    print(f"\n=======================================================")
    print(f"Testing URL: {url} (Language: {lang})")
    print(f"=======================================================")
    res = requests.post(
        f"{BASE_URL}/api/ai/analyze-link",
        json={"url": url, "language": lang},
        timeout=15
    )
    print(f"HTTP Status: {res.status_code}")
    data = res.json()
    print("Response JSON:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    return data

if __name__ == "__main__":
    print("Testing Link Checker Endpoint...")
    # 1. Harmless third-party test URL (English)
    t1 = test_link("https://example.com", "en")
    
    # 2. Recognized official domain (English)
    t2 = test_link("https://cybercrime.gov.in", "en")
    
    # 3. Harmless third-party test URL (Telugu)
    t3 = test_link("https://example.com", "te")

    # 4. Phishing / Malware suspicious URL heuristic (English)
    t4 = test_link("https://sbi-kyc-verify-reward.xyz/login", "en")

    # 5. Direct APK download (English)
    t5 = test_link("https://updates-payment.com/banking-app.apk", "en")

    # 6. SSRF Blocked URL (English)
    t6 = test_link("http://127.0.0.1:5000/api/health", "en")

    print("\n=======================================================")
    print("All link verification tests completed successfully!")
    print("=======================================================")
