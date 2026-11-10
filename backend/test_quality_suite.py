import json
import time
import requests
import sys

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000"

def count_words(text: str) -> int:
    return len(text.split())

def run_tests():
    print("=" * 70)
    print("UPI Suraksha Mitra — Quality Verification Suite")
    print("=" * 70)

    # Health Check
    try:
        health_res = requests.get(f"{BASE_URL}/api/health", timeout=5)
        print(f"[Health Check] HTTP {health_res.status_code}: {health_res.json()}")
    except Exception as e:
        print(f"[Health Check] FAILED: {e}")
        return

    results = []

    # Test 1: What is a UPI PIN?
    q1 = "What is a UPI PIN?"
    print(f"\n--- Test 1: '{q1}' ---")
    t0 = time.time()
    res1 = requests.post(f"{BASE_URL}/api/ai/chat", json={"question": q1, "language": "en"}, timeout=30)
    t1 = time.time()
    data1 = res1.json()
    ans1 = data1.get("answer", "")
    w1 = count_words(ans1)
    print(f"Status Code: {res1.status_code} ({t1-t0:.2f}s)")
    print(f"Word Count: {w1}")
    print(f"Response:\n{ans1}")
    results.append({"test": "1. What is a UPI PIN?", "words": w1, "status": res1.status_code, "text": ans1})

    # Test 2: Why should I never share an OTP?
    q2 = "Why should I never share an OTP?"
    print(f"\n--- Test 2: '{q2}' ---")
    t0 = time.time()
    res2 = requests.post(f"{BASE_URL}/api/ai/chat", json={"question": q2, "language": "en"}, timeout=30)
    t1 = time.time()
    data2 = res2.json()
    ans2 = data2.get("answer", "")
    w2 = count_words(ans2)
    print(f"Status Code: {res2.status_code} ({t1-t0:.2f}s)")
    print(f"Word Count: {w2}")
    print(f"Response:\n{ans2}")
    results.append({"test": "2. Why should I never share an OTP?", "words": w2, "status": res2.status_code, "text": ans2})

    # Test 3: I clicked a suspicious link. What should I do?
    q3 = "I clicked a suspicious link. What should I do?"
    print(f"\n--- Test 3: '{q3}' ---")
    t0 = time.time()
    res3 = requests.post(f"{BASE_URL}/api/ai/chat", json={"question": q3, "language": "en"}, timeout=30)
    t1 = time.time()
    data3 = res3.json()
    ans3 = data3.get("answer", "")
    w3 = count_words(ans3)
    print(f"Status Code: {res3.status_code} ({t1-t0:.2f}s)")
    print(f"Word Count: {w3}")
    print(f"Response:\n{ans3}")
    results.append({"test": "3. I clicked a suspicious link", "words": w3, "status": res3.status_code, "text": ans3})

    # Test 4: Is this URL safe? (Chat + Analyze-Link with test URLs)
    # 4a: Direct chat question asking about URL
    q4 = "Is this URL safe? https://example.com"
    print(f"\n--- Test 4a (Chat): '{q4}' ---")
    t0 = time.time()
    res4a = requests.post(f"{BASE_URL}/api/ai/chat", json={"question": q4, "language": "en"}, timeout=30)
    t1 = time.time()
    data4a = res4a.json()
    ans4a = data4a.get("answer", "")
    w4a = count_words(ans4a)
    print(f"Status Code: {res4a.status_code} ({t1-t0:.2f}s)")
    print(f"Word Count: {w4a}")
    print(f"Response:\n{ans4a}")
    results.append({"test": "4a. Chat URL Check", "words": w4a, "status": res4a.status_code, "text": ans4a})

    # 4b: Analyze-link endpoint test with unverified URL
    test_url = "https://example.com"
    print(f"\n--- Test 4b (Analyze-Link): '{test_url}' ---")
    res4b = requests.post(f"{BASE_URL}/api/ai/analyze-link", json={"url": test_url, "language": "en"}, timeout=15)
    data4b = res4b.json()
    print(f"Status Code: {res4b.status_code}")
    print(f"Status Field: {data4b.get('status')}")
    print(f"Reason Field: {data4b.get('reason')}")
    print(f"Action Field: {data4b.get('action')}")
    print(f"Formatted:\n{data4b.get('formattedAnalysis')}")
    results.append({"test": "4b. Analyze-Link Third-Party URL", "status": res4b.status_code, "text": data4b.get("formattedAnalysis")})

    # 4c: Analyze-link endpoint test with official domain
    gov_url = "https://cybercrime.gov.in"
    print(f"\n--- Test 4c (Analyze-Link Official): '{gov_url}' ---")
    res4c = requests.post(f"{BASE_URL}/api/ai/analyze-link", json={"url": gov_url, "language": "en"}, timeout=15)
    data4c = res4c.json()
    print(f"Status Code: {res4c.status_code}")
    print(f"Status Field: {data4c.get('status')}")
    print(f"Reason Field: {data4c.get('reason')}")
    print(f"Action Field: {data4c.get('action')}")
    results.append({"test": "4c. Analyze-Link Official URL", "status": res4c.status_code, "text": data4c.get("formattedAnalysis")})

    # Test 5: What is a QR code scam?
    q5 = "What is a QR code scam?"
    print(f"\n--- Test 5: '{q5}' ---")
    t0 = time.time()
    res5 = requests.post(f"{BASE_URL}/api/ai/chat", json={"question": q5, "language": "en"}, timeout=30)
    t1 = time.time()
    data5 = res5.json()
    ans5 = data5.get("answer", "")
    w5 = count_words(ans5)
    print(f"Status Code: {res5.status_code} ({t1-t0:.2f}s)")
    print(f"Word Count: {w5}")
    print(f"Response:\n{ans5}")
    results.append({"test": "5. What is a QR code scam?", "words": w5, "status": res5.status_code, "text": ans5})

    # Test 6: Relevant follow-up to a previous answer
    q6 = "Explain how fraudsters trick people into scanning the QR code in more detail."
    history6 = [
        {"sender": "user", "text": q5},
        {"sender": "ai", "text": ans5}
    ]
    print(f"\n--- Test 6 (Follow-up): '{q6}' ---")
    t0 = time.time()
    res6 = requests.post(f"{BASE_URL}/api/ai/chat", json={"question": q6, "language": "en", "history": history6}, timeout=30)
    t1 = time.time()
    data6 = res6.json()
    ans6 = data6.get("answer", "")
    w6 = count_words(ans6)
    print(f"Status Code: {res6.status_code} ({t1-t0:.2f}s)")
    print(f"Word Count: {w6}")
    print(f"Response:\n{ans6}")
    results.append({"test": "6. Follow-up Question", "words": w6, "status": res6.status_code, "text": ans6})

    # Test 7: Bilingual Telugu check
    q7 = "యూపీఐ పిన్ అంటే ఏమిటి?"
    print(f"\n--- Test 7 (Telugu): '{q7}' ---")
    t0 = time.time()
    res7 = requests.post(f"{BASE_URL}/api/ai/chat", json={"question": q7, "language": "te"}, timeout=30)
    t1 = time.time()
    data7 = res7.json()
    ans7 = data7.get("answer", "")
    w7 = count_words(ans7)
    print(f"Status Code: {res7.status_code} ({t1-t0:.2f}s)")
    print(f"Word Count: {w7}")
    print(f"Response:\n{ans7}")
    results.append({"test": "7. Telugu UPI PIN", "words": w7, "status": res7.status_code, "text": ans7})

    print("\n" + "=" * 70)
    print("SUMMARY OF RESULTS")
    print("=" * 70)
    for r in results:
        wc_info = f", Words: {r['words']}" if "words" in r else ""
        print(f"• {r['test']}: HTTP {r['status']}{wc_info}")
    
    # Save results to scratch json file
    with open("test_quality_output.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("\nDetailed results saved to backend/test_quality_output.json")

if __name__ == "__main__":
    run_tests()
