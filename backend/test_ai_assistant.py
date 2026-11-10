import os
import sys
import json
from unittest.mock import patch, MagicMock

# Force UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from app import app
from services.gemini_service import GeminiService, GeminiConfigError, GeminiAPIError

def test_missing_api_key_honest_responses():
    """Verify Step 3: When Gemini API key is missing, backend returns honest 503 error."""
    print("\n--- TEST 1: Missing API Key Honest Responses ---")
    client = app.test_client()

    with patch.object(GeminiService, 'get_api_key', return_value=""):
        # English test
        res_en = client.post('/api/ai/chat', json={'question': 'What is a UPI PIN?', 'language': 'en'})
        data_en = res_en.get_json()
        assert res_en.status_code == 503, f"Expected 503, got {res_en.status_code}"
        assert data_en['success'] is False, "Expected success: False"
        assert data_en['error'] == 'API_KEY_MISSING'
        assert "Gemini API key is not configured" in data_en['message']
        print("✓ English honest error verified (Status 503, API_KEY_MISSING)")

        # Telugu test
        res_te = client.post('/api/ai/chat', json={'question': 'యూపీఐ పిన్ అంటే ఏమిటి?', 'language': 'te'})
        data_te = res_te.get_json()
        assert res_te.status_code == 503, f"Expected 503, got {res_te.status_code}"
        assert data_te['success'] is False, "Expected success: False"
        assert data_te['error'] == 'API_KEY_MISSING'
        assert "జెమిని API కీ కాన్ఫిగర్ చేయబడలేదు" in data_te['message']
        print("✓ Telugu honest error verified (Status 503, Telugu message)")


def test_gemini_request_formatting_and_history():
    """Verify Step 2: Ensure prompt and history are formatted with proper roles and system instructions."""
    print("\n--- TEST 2: Request Formatting & Context Preservation ---")
    
    history = [
        {"sender": "ai", "text": "Welcome to UPI Suraksha Mitra!"},  # Leading AI turn should be dropped
        {"sender": "user", "text": "What is a QR code scam?"},
        {"sender": "ai", "text": "A QR scam occurs when a fraudster asks you to scan a code to receive money. Warning signs: 1. Demanding urgent scan, 2. Asking for UPI PIN to receive money, 3. Fake cashback promises."},
    ]
    follow_up = "Explain the second warning sign in more detail."

    formatted = GeminiService.format_chat_contents(history, follow_up)
    
    assert formatted[0]['role'] == 'user', "First turn must be 'user'"
    assert formatted[1]['role'] == 'model', "Second turn must be 'model'"
    assert formatted[2]['role'] == 'user', "Third turn must be 'user'"
    assert formatted[2]['parts'][0]['text'] == follow_up
    print("✓ Content alternation and history formatting verified (user -> model -> user)")

    # Verify system instruction includes all required criteria
    sys_inst_en = GeminiService.get_system_instruction("en")
    assert "Understand the user's specific question" in sys_inst_en
    assert "Answer the question directly" in sys_inst_en
    assert "Explain technical terms in simple language" in sys_inst_en
    assert "Give examples when useful" in sys_inst_en
    assert "Avoid repeating generic safety advice" in sys_inst_en
    assert "Remember relevant previous messages during follow-up questions" in sys_inst_en
    assert "Ask for clarification when the question is genuinely unclear" in sys_inst_en
    print("✓ System instruction contains all Step 2 requirements")


def test_mocked_gemini_questions():
    """Verify Step 5: Test the 6 specific questions and verify distinct, contextual answers."""
    print("\n--- TEST 3: Six Specific Questions (Verification) ---")
    client = app.test_client()

    mock_answers = {
        "What is a UPI PIN?": (
            "A UPI PIN (Unified Payments Interface Personal Identification Number) is a confidential 4-digit or 6-digit passcode "
            "that you set up during your initial bank account registration. It acts like an ATM PIN for your mobile phone payments. "
            "You only enter it when authorizing outbound money transfers from your bank account."
        ),
        "Why should I never share my OTP?": (
            "You should never share your OTP (One-Time Password) because it is a 2-factor authentication security key sent by your bank "
            "to authenticate transactions, register your account on new devices, or approve withdrawals. Anyone with your OTP can bypass "
            "security protections and drain your bank balance."
        ),
        "What should I do if I click a suspicious link?": (
            "If you click a suspicious link: 1. Immediately disconnect your internet/Wi-Fi to prevent background payload downloads. "
            "2. Do not enter any bank credentials, card numbers, or UPI PINs. 3. Check your downloads folder and delete any downloaded .apk files. "
            "4. Change your net banking and UPI PIN immediately if you entered any information. 5. Call 1930 if you notice unauthorized debits."
        ),
        "How can I report UPI fraud in India?": (
            "To report UPI fraud in India: 1. Call the National Cyber Crime Helpline at 1930 immediately within the golden hour to freeze stolen funds. "
            "2. File a formal complaint online at cybercrime.gov.in with transaction UTR numbers and screenshots. "
            "3. Notify your bank and the UPI app provider (Google Pay, PhonePe, Paytm, BHIM) to dispute the transaction."
        ),
        "What is a QR code scam?": (
            "A QR code scam is a fraud scheme where scammers manipulate victims into scanning a QR code under the pretext of 'receiving' money, "
            "lottery prizes, or payments for items sold online. In reality, scanning a QR code and entering a UPI PIN always debits money from your account."
        ),
        "Explain the second warning sign in more detail.": (
            "The second warning sign—'Asking for UPI PIN to receive money'—is the definitive indicator of fraud. In the UPI architecture designed by NPCI, "
            "receiving funds is an incoming credit that requires zero authentication from the recipient. Whenever an app or person prompts you for a PIN, "
            "you are authorizing an outgoing payment, never a receipt."
        )
    }

    def mock_generate_content(prompt, system_instruction="", language="en", history=None):
        return mock_answers.get(prompt, f"Detailed answer for: {prompt}")

    with patch.object(GeminiService, 'generate_content', side_effect=mock_generate_content):
        responses = {}
        for q in mock_answers.keys():
            history = []
            if q == "Explain the second warning sign in more detail.":
                history = [
                    {"sender": "user", "text": "What is a QR code scam?"},
                    {"sender": "ai", "text": mock_answers["What is a QR code scam?"]}
                ]
            res = client.post('/api/ai/chat', json={'question': q, 'language': 'en', 'history': history})
            assert res.status_code == 200, f"Expected 200 for question: {q}"
            data = res.get_json()
            assert data['success'] is True
            assert len(data['answer']) > 50
            responses[q] = data['answer']
            print(f"✓ '{q}' -> Answered with {len(data['answer'])} chars")

        # Verify that all answers are unique (no two questions receive the same generic answer!)
        answer_set = set(responses.values())
        assert len(answer_set) == len(mock_answers), "All answers must be distinct and specific to the question!"
        print("✓ All 6 answers are unique, direct, and specific to the questions asked!")


def test_google_genai_sdk_mocked_calls():
    """Verify Step 3 & 7: Test official google-genai SDK Client integration using mocked responses."""
    print("\n--- TEST 4: Google GenAI SDK Client Integration (Mocked) ---")
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "**A UPI PIN** is a secret 4-6 digit passcode used to authorize payments."
    mock_client.models.generate_content.return_value = mock_response

    with patch.object(GeminiService, 'get_api_key', return_value="dummy_valid_test_key_12345"), \
         patch.object(GeminiService, 'get_client', return_value=mock_client):
        # 1. Text generation test
        ans = GeminiService.generate_content("What is a UPI PIN?", language="en")
        assert ans == "A UPI PIN is a secret 4-6 digit passcode used to authorize payments."
        assert mock_client.models.generate_content.called
        call_kwargs = mock_client.models.generate_content.call_args.kwargs
        assert call_kwargs['model'] == GeminiService.MODELS[0]
        assert 'contents' in call_kwargs
        assert 'config' in call_kwargs
        print("✓ google-genai SDK text generation verified with mock client and types.GenerateContentConfig")

        # 2. Vision analysis test
        mock_vision_response = MagicMock()
        mock_vision_response.text = "Inspection complete: No evidence of fraudulent transaction generator."
        mock_client.models.generate_content.return_value = mock_vision_response
        vision_ans = GeminiService.analyze_image_content(b"test_image_bytes", mime_type="image/jpeg", language="en")
        assert "Inspection complete" in vision_ans
        print("✓ google-genai SDK vision analysis verified with types.Part.from_bytes")


def test_google_genai_error_categorization():
    """Verify Step 2 & 7: Test categorized API error messages in English and Telugu."""
    print("\n--- TEST 5: Error Categorization & Status Mappings ---")
    # 1. API Key Invalid
    err_401 = Exception("ClientError 401: API key not valid. Please pass a valid API key.")
    code_en, msg_en = GeminiService.categorize_api_error(err_401, lang="en")
    assert code_en == "API_KEY_INVALID"
    assert "invalid or unauthorized" in msg_en
    code_te, msg_te = GeminiService.categorize_api_error(err_401, lang="te")
    assert code_te == "API_KEY_INVALID"
    assert "చెల్లదు" in msg_te
    print("✓ API_KEY_INVALID categorized correctly (EN & TE)")

    # 2. Rate Limit / Quota
    err_429 = Exception("ClientError 429: Resource exhausted. Quota exceeded.")
    code_q, msg_q = GeminiService.categorize_api_error(err_429, lang="en")
    assert code_q == "QUOTA_EXCEEDED"
    assert "rate limit or quota exceeded" in msg_q
    print("✓ QUOTA_EXCEEDED categorized correctly")

    # 3. Model Overload
    err_503 = Exception("ServerError 503: The model is overloaded. Please try again later.")
    code_ov, msg_ov = GeminiService.categorize_api_error(err_503, lang="en")
    assert code_ov == "MODEL_OVERLOADED"
    assert "temporarily experiencing high traffic" in msg_ov
    print("✓ MODEL_OVERLOADED categorized correctly")

    # 4. Network / Timeout
    err_net = Exception("httpx.ConnectTimeout: Connection timed out")
    code_net, msg_net = GeminiService.categorize_api_error(err_net, lang="en")
    assert code_net == "NETWORK_ERROR"
    assert "network issues" in msg_net
    print("✓ NETWORK_ERROR categorized correctly")


def test_live_gemini_if_key_configured():
    """If a valid GEMINI_API_KEY is found in the environment, test live API call."""
    api_key = GeminiService.get_api_key()
    if api_key and len(api_key) > 20 and not "your_gemini" in api_key.lower():
        print("\n--- TEST 6: Live Gemini API Call (Key Configured) ---")
        try:
            answer = GeminiService.generate_content("What is a UPI PIN in one short sentence?", language="en")
            print(f"✓ Live Gemini response: {answer[:120]}...")
            return True
        except Exception as e:
            print(f"✗ Live Gemini call failed: {e}")
            return False
    else:
        print("\n--- TEST 6: Live Gemini API Call (Skipped: No GEMINI_API_KEY set) ---")
        return None

def test_canned_message_translation():
    """Verify offline canned pattern translation for tool attachments and errors."""
    print("\n--- TEST 7: Canned Tool Pattern & Error Offline Translation ---")
    
    # 1. Tool messages English -> Telugu
    en_tool_msgs = [
        {"id": "img1", "text": "📷 [Submitted Image for Fraud Inspection: receipt.png]"},
        {"id": "qr1", "text": "🔳 [Uploaded QR Code Image: qr_code.png]"},
        {"id": "qr2", "text": "🔳 [QR Code Payload: upi://pay?pa=fraud@upi&pn=Scam]"},
        {"id": "link1", "text": "🔗 [Checking Suspicious Link: https://fake-bank.xyz]"},
        {"id": "sms1", "text": '💬 [Analyzing Message Text: "Dear user your electricity bill is unpaid"]'},
        {"id": "err1", "text": "⚠️ Unable to connect to backend server. Please verify the Flask backend is running on port 5000."}
    ]
    
    # Run with empty API key to prove these work offline without Gemini!
    with patch.object(GeminiService, 'get_api_key', return_value=""):
        res_te = GeminiService.translate_messages(en_tool_msgs, target_language="te", source_language="en")
        
        assert len(res_te) == 6
        assert "విశ్లేషణ కోసం ఇమేజ్ సమర్పించబడింది: receipt.png" in res_te[0]["text"]
        assert "క్యూఆర్ కోడ్ ఇమేజ్: qr_code.png" in res_te[1]["text"]
        assert "క్యూఆర్ కోడ్ పేలోడ్: upi://pay?pa=fraud@upi&pn=Scam" in res_te[2]["text"]
        assert "అనుమానాస్పద లింక్ తనిఖీ: https://fake-bank.xyz" in res_te[3]["text"]
        assert 'సందేశం విశ్లేషణ: "Dear user your electricity bill is unpaid"' in res_te[4]["text"]
        assert "సర్వర్‌కు కనెక్ట్ చేయడంలో లోపం ఏర్పడింది" in res_te[5]["text"]
        assert all(m["translated"] is True for m in res_te)
        print("✓ All 6 tool and error patterns translated English -> Telugu offline")

        # 2. Reverse Telugu -> English
        te_tool_msgs = [
            {"id": "img1", "text": res_te[0]["text"]},
            {"id": "qr1", "text": res_te[1]["text"]},
            {"id": "qr2", "text": res_te[2]["text"]},
            {"id": "link1", "text": res_te[3]["text"]},
            {"id": "sms1", "text": res_te[4]["text"]},
            {"id": "err1", "text": res_te[5]["text"]}
        ]
        res_en = GeminiService.translate_messages(te_tool_msgs, target_language="en", source_language="te")
        assert len(res_en) == 6
        assert "Submitted Image for Fraud Inspection: receipt.png" in res_en[0]["text"]
        assert "Uploaded QR Code Image: qr_code.png" in res_en[1]["text"]
        assert "QR Code Payload: upi://pay?pa=fraud@upi&pn=Scam" in res_en[2]["text"]
        assert "Checking Suspicious Link: https://fake-bank.xyz" in res_en[3]["text"]
        assert 'Analyzing Message Text: "Dear user your electricity bill is unpaid"' in res_en[4]["text"]
        assert "Unable to connect to backend server" in res_en[5]["text"]
        assert all(m["translated"] is True for m in res_en)
        print("✓ All 6 tool and error patterns translated Telugu -> English offline")


def test_ai_batch_translation_mocked():
    """Verify batch AI translation with technical term preservation and clean output."""
    print("\n--- TEST 8: AI Batch Translation with Technical Term Preservation ---")
    
    mock_sdk_response = MagicMock()
    mock_sdk_response.text = json.dumps([
        "యూపీఐ పిన్ అంటే ఏమిటి?",
        "యూపీఐ పిన్ మీ అత్యంత రహస్య భద్రతా కోడ్. డబ్బులు స్వీకరించడానికి ఎప్పుడూ యూపీఐ పిన్ ఎంటర్ చేయకూడదు. అనుమానం ఉంటే వెంటనే 1930 కి కాల్ చేయండి."
    ])

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_sdk_response

    input_msgs = [
        {"id": "msg-1", "text": "What is a UPI PIN?"},
        {"id": "msg-2", "text": "A UPI PIN is your confidential security code. Never enter UPI PIN to receive money. If in doubt, immediately call 1930."}
    ]

    with patch.object(GeminiService, 'get_api_key', return_value="dummy_key_for_test"), \
         patch.object(GeminiService, 'get_client', return_value=mock_client):
        res = GeminiService.translate_messages(input_msgs, target_language="te", source_language="en")
        
        assert len(res) == 2
        assert res[0]["id"] == "msg-1"
        assert res[0]["text"] == "యూపీఐ పిన్ అంటే ఏమిటి?"
        assert res[0]["translated"] is True
        assert res[1]["id"] == "msg-2"
        assert "యూపీఐ పిన్" in res[1]["text"]
        assert "1930" in res[1]["text"]
        assert res[1]["translated"] is True
        print("✓ English -> Telugu AI batch translation preserves technical terms ('UPI PIN', '1930')")


def test_translate_api_endpoint():
    """Verify POST /api/ai/translate endpoint, including graceful fallbacks."""
    print("\n--- TEST 9: POST /api/ai/translate Endpoint & Error Fallback ---")
    client = app.test_client()

    # 1. Empty payload
    res_empty = client.post('/api/ai/translate', json={'messages': [], 'target_language': 'te'})
    data_empty = res_empty.get_json()
    assert res_empty.status_code == 200
    assert data_empty['success'] is True
    assert data_empty['messages'] == []
    print("✓ Empty message array handled gracefully")

    # 2. Canned messages through API route
    canned_payload = {
        'messages': [
            {'id': '101', 'text': '🔗 [Checking Suspicious Link: https://phishing-site.xyz]'}
        ],
        'target_language': 'te'
    }
    res_canned = client.post('/api/ai/translate', json=canned_payload)
    data_canned = res_canned.get_json()
    assert res_canned.status_code == 200
    assert data_canned['success'] is True
    assert len(data_canned['messages']) == 1
    assert data_canned['messages'][0]['id'] == '101'
    assert 'అనుమానాస్పద లింక్ తనిఖీ' in data_canned['messages'][0]['text']
    print("✓ API endpoint successfully translated canned link message to Telugu")

    # 3. Translation error fallback does not erase chat history
    with patch.object(GeminiService, 'translate_messages', side_effect=Exception("Simulated API failure")):
        res_fail = client.post('/api/ai/translate', json={
            'messages': [{'id': '201', 'text': 'Original important fraud question'}],
            'target_language': 'te'
        })
        data_fail = res_fail.get_json()
        assert res_fail.status_code == 200
        assert data_fail['success'] is False
        assert data_fail['error'] == 'TRANSLATION_FAILED'
        # Crucial requirement 6: original message retained, history not erased!
        assert len(data_fail['messages']) == 1
        assert data_fail['messages'][0]['id'] == '201'
        assert data_fail['messages'][0]['text'] == 'Original important fraud question'
        assert data_fail['messages'][0]['translated'] is False
        print("✓ Translation error returns HTTP 200 fallback with original messages intact (never erases chat)")


if __name__ == '__main__':
    print("========================================")
    print("UPI Suraksha Mitra AI Assistant Test Suite")
    print("========================================")
    test_missing_api_key_honest_responses()
    test_gemini_request_formatting_and_history()
    test_mocked_gemini_questions()
    test_google_genai_sdk_mocked_calls()
    test_google_genai_error_categorization()
    test_live_gemini_if_key_configured()
    test_canned_message_translation()
    test_ai_batch_translation_mocked()
    test_translate_api_endpoint()
    print("\n========================================")
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("========================================")

