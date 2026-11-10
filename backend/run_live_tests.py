import json
import sys

# Force UTF-8 on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from app import app

client = app.test_client()

print("=" * 70)
print("LIVE AI FRAUD ASSISTANT ENDPOINT VERIFICATION")
print("=" * 70)

# Question 1
q1 = "What is a UPI PIN?"
print(f"\n[Question 1]: {q1}")
res1 = client.post('/api/ai/chat', json={'question': q1, 'language': 'en'})
data1 = res1.get_json()
ans1 = data1.get('answer', '')
print(f"Status: {res1.status_code} | Success: {data1.get('success')}")
print(f"Response:\n{ans1}\n")

# Question 2
q2 = "Why should I never share my OTP?"
print(f"\n[Question 2]: {q2}")
res2 = client.post('/api/ai/chat', json={'question': q2, 'language': 'en'})
data2 = res2.get_json()
ans2 = data2.get('answer', '')
print(f"Status: {res2.status_code} | Success: {data2.get('success')}")
print(f"Response:\n{ans2}\n")

# Question 3
q3 = "What should I do if I click a suspicious link?"
print(f"\n[Question 3]: {q3}")
res3 = client.post('/api/ai/chat', json={'question': q3, 'language': 'en'})
data3 = res3.get_json()
ans3 = data3.get('answer', '')
print(f"Status: {res3.status_code} | Success: {data3.get('success')}")
print(f"Response:\n{ans3}\n")

# Question 4
q4 = "How can I report UPI fraud in India?"
print(f"\n[Question 4]: {q4}")
res4 = client.post('/api/ai/chat', json={'question': q4, 'language': 'en'})
data4 = res4.get_json()
ans4 = data4.get('answer', '')
print(f"Status: {res4.status_code} | Success: {data4.get('success')}")
print(f"Response:\n{ans4}\n")

# Question 5
q5 = "What is a QR code scam?"
print(f"\n[Question 5]: {q5}")
res5 = client.post('/api/ai/chat', json={'question': q5, 'language': 'en'})
data5 = res5.get_json()
ans5 = data5.get('answer', '')
print(f"Status: {res5.status_code} | Success: {data5.get('success')}")
print(f"Response:\n{ans5}\n")

# Question 6 (Follow-up to Question 5)
q6 = "Explain the second warning sign in more detail."
print(f"\n[Question 6 (Follow-up)]: {q6}")
history = [
    {"sender": "user", "text": q5},
    {"sender": "ai", "text": ans5}
]
res6 = client.post('/api/ai/chat', json={'question': q6, 'language': 'en', 'history': history})
data6 = res6.get_json()
ans6 = data6.get('answer', '')
print(f"Status: {res6.status_code} | Success: {data6.get('success')}")
print(f"Response:\n{ans6}\n")

# Telugu Test Question
q_te = "యూపీఐ పిన్ ఎవరికైనా చెప్పవచ్చా?"
print(f"\n[Telugu Verification Question]: {q_te}")
res_te = client.post('/api/ai/chat', json={'question': q_te, 'language': 'te'})
data_te = res_te.get_json()
ans_te = data_te.get('answer', '')
print(f"Status: {res_te.status_code} | Success: {data_te.get('success')}")
print(f"Response:\n{ans_te}\n")

print("=" * 70)
print("VERIFICATION CHECKS:")
answers = [ans1, ans2, ans3, ans4, ans5, ans6]
all_success = all([res1.status_code == 200, res2.status_code == 200, res3.status_code == 200, res4.status_code == 200, res5.status_code == 200, res6.status_code == 200, res_te.status_code == 200])
unique_count = len(set(answers))
print(f"All HTTP 200 Success: {all_success}")
print(f"Unique Answers (out of 6): {unique_count}/6")
assert all_success, "All endpoints must succeed"
assert unique_count == 6, "Every answer must be distinct and tailored"
print("ALL LIVE TESTS COMPLETED AND VERIFIED!")
print("=" * 70)
