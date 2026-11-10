from flask import Blueprint, jsonify, request

awareness_bp = Blueprint('awareness', __name__)

FAQS = [
    {
        "id": 1,
        "question_en": "What is UPI?",
        "question_te": "యూపీఐ (UPI) అంటే ఏమిటి?",
        "question_hi": "यूपीआई (UPI) क्या है?",
        "answer_en": "Unified Payments Interface (UPI) is a real-time instant payment system developed by NPCI that allows instant money transfers between bank accounts using a smartphone.",
        "answer_te": "యూనిఫైడ్ పేమెంట్స్ ఇంటర్‌ఫేస్ (UPI) అనేది ఎన్‌పీసీఐ (NPCI) ద్వారా అభివృద్ధి చేయబడిన తక్షణ చెల్లింపు వ్యవస్థ. ఇది స్మార్ట్‌ఫోన్ ద్వారా రెండు బ్యాంక్ ఖాతాల మధ్య నేరుగా డబ్బు పంపడానికి సహాయపడుతుంది.",
        "answer_hi": "यूनिफाइड पेमेंट्स इंटरफेस (UPI) एनपीसीआई (NPCI) द्वारा विकसित एक वास्तविक समय भुगतान प्रणाली है जो स्मार्टफोन का उपयोग करके बैंक खातों के बीच तुरंत धन हस्तांतरण की अनुमति देती है।"
    },
    {
        "id": 2,
        "question_en": "Is UPI safe for daily transactions?",
        "question_te": "రోజువారీ లావాదేవీలకు యూపీఐ సురక్షితమేనా?",
        "question_hi": "क्या दैनिक लेनदेन के लिए यूपीआई सुरक्षित है?",
        "answer_en": "Yes, UPI uses bank-grade encryption and two-factor authentication. However, safety depends on keeping your secret UPI PIN and OTP confidential at all times.",
        "answer_te": "అవును, యూపీఐ బ్యాంక్-స్థాయి ఎన్‌క్రిప్షన్ మరియు రెండు-దశల భద్రతను ఉపయోగిస్తుంది. అయితే, మీ యూపీఐ పిన్ మరియు ఓటీపీలను రహస్యంగా ఉంచడం అత్యంత ముఖ్యం.",
        "answer_hi": "हां, यूपीआई बैंक-ग्रेड एन्क्रिप्शन का उपयोग करता है। हालांकि, सुरक्षा आपके गुप्त यूपीआई पिन और ओटीपी को हर समय गोपनीय रखने पर निर्भर करती है।"
    },
    {
        "id": 3,
        "question_en": "Can someone steal money using OTP?",
        "question_te": "ఓటీపీ (OTP) ద్వారా ఎవరైనా డబ్బు దొంగిలించవచ్చా?",
        "question_hi": "क्या कोई ओटीपी (OTP) का उपयोग करके पैसे चुरा सकता है?",
        "answer_en": "Yes! OTP is your digital signature for approving bank debits. If shared with anyone, fraudsters can drain your bank account within seconds.",
        "answer_te": "అవును! ఓటీపీ అనేది మీ బ్యాంక్ ఖాతా నుండి డబ్బు పంపడానికి డిజిటల్ సంతకం. ఎవరికైనా ఓటీపీ చెబితే కొద్ది సెకన్లలో మీ డబ్బు మాయమవుతుంది.",
        "answer_hi": "हां! ओटीपी बैंक डेबिट को मंजूरी देने के लिए आपका डिजिटल हस्ताक्षर है। यदि किसी के साथ साझा किया जाता है, तो धोखेबाज़ कुछ ही सेकंड में आपके खाते से पैसे निकाल सकते हैं।"
    },
    {
        "id": 4,
        "question_en": "What should I do if I scan a fake QR code?",
        "question_te": "నేను నకిలీ క్యూఆర్ కోడ్‌ని స్కాన్ చేస్తే ఏమి చేయాలి?",
        "question_hi": "यदि मैं किसी फर्जी क्यूआर कोड को स्कैन कर लूं तो मुझे क्या करना चाहिए?",
        "answer_en": "If you scanned a QR code and money was deducted, do NOT enter your PIN again. Block your UPI app immediately, report to your bank, and call helpline 1930.",
        "answer_te": "మీరు క్యూఆర్ కోడ్ స్కాన్ చేసి డబ్బు కట్ అయితే, మళ్లీ పిన్ ఎంటర్ చేయవద్దు. వెంటనే మీ UPI యాప్‌ను బ్లాక్ చేసి, బ్యాంక్‌కు మరియు 1930 హెల్ప్‌లైన్‌కు ఫిర్యాదు చేయండి.",
        "answer_hi": "यदि आपने क्यूआर कोड स्कैन किया और पैसे कट गए, तो दोबारा पिन दर्ज न करें। तुरंत अपना यूपीआई ऐप ब्लॉक करें, बैंक को सूचित करें और 1930 पर कॉल करें।"
    },
    {
        "id": 5,
        "question_en": "How do I report cyber fraud?",
        "question_te": "సైబర్ మోసాన్ని ఎలా నివేదించాలి?",
        "question_hi": "मैं साइबर धोखाधड़ी की रिपोर्ट कैसे करूं?",
        "answer_en": "Call the toll-free helpline 1930 immediately within 2 hours or file a complaint online at www.cybercrime.gov.in.",
        "answer_te": "వెంటనే 2 గంటల లోపు ఉచిత హెల్ప్‌లైన్ 1930 కి కాల్ చేయండి లేదా www.cybercrime.gov.in లో ఆన్‌లైన్ ఫిర్యాదు చేయండి.",
        "answer_hi": "तुरंत 2 घंटे के भीतर टोल-फ्री हेल्पलाइन 1930 पर कॉल करें या www.cybercrime.gov.in पर ऑनलाइन शिकायत दर्ज करें।"
    },
    {
        "id": 6,
        "question_en": "What is Cyber Crime Helpline 1930?",
        "question_te": "సైబర్ క్రైమ్ హెల్ప్‌లైన్ 1930 అంటే ఏమిటి?",
        "question_hi": "साइबर क्राइम हेल्पलाइन 1930 क्या है?",
        "answer_en": "1930 is the official 24x7 National Cyber Crime Reporting Helpline operated by the Ministry of Home Affairs to freeze stolen funds in fraud cases.",
        "answer_te": "1930 అనేది కేంద్ర హోం మంత్రిత్వ శాఖచే నిర్వహించబడే 24x7 జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్. మోసంలో పోయిన డబ్బును స్తంభింపజేయడానికి ఇది పనిచేస్తుంది.",
        "answer_hi": "1930 गृह मंत्रालय द्वारा संचालित आधिकारिक 24x7 राष्ट्रीय साइबर अपराध हेल्पलाइन है जो धोखाधड़ी के मामलों में चुराए गए धन को तुरंत रोकने में मदद करती है।"
    },
    {
        "id": 7,
        "question_en": "Is UPI PIN needed to receive money?",
        "question_te": "డబ్బులు రావడానికి యూపీఐ పిన్ అవసరమా?",
        "question_hi": "क्या पैसे प्राप्त करने के लिए यूपीआई पिन की आवश्यकता है?",
        "answer_en": "NO! UPI PIN is NEVER required to receive money into your bank account. PIN is only needed to SEND or transfer money.",
        "answer_te": "ఖచ్చితంగా లేదు! డబ్బులు మీ ఖాతాకు రావడానికి యూపీఐ పిన్ ఎప్పటికీ అవసరం లేదు. కేవలం డబ్బు పంపడానికి మాత్రమే పిన్ కొట్టాలి.",
        "answer_hi": "बिल्कुल नहीं! आपके बैंक खाते में पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन की आवश्यकता नहीं होती है। पिन केवल पैसे भेजने के लिए चाहिए।"
    },
    {
        "id": 8,
        "question_en": "What happens if I install an APK file from WhatsApp?",
        "question_te": "వాట్సాప్ నుండి వచ్చిన ఎపికె (APK) ఫైల్ ఇన్‌స్టాల్ చేస్తే ఏమవుతుంది?",
        "question_hi": "यदि मैं व्हाट्सएप से कोई एपीके (APK) फ़ाइल इंस्टॉल करता हूं तो क्या होगा?",
        "answer_en": "Malicious APK files install spyware on your phone, allowing hackers to read your SMS, steal passwords, and control your device remotely.",
        "answer_te": "హానికరమైన APK ఫైళ్లు మీ ఫోన్‌లో గూఢచారి సాఫ్ట్‌వేర్‌ను ఇన్‌స్టాల్ చేస్తాయి. దీనివల్ల హ్యాకర్లు మీ SMSలు చదివి, బ్యాంక్ పాస్‌వర్డ్‌లను దొంగిలిస్తారు.",
        "answer_hi": "हानिकारक एपीके फ़ाइलें आपके फोन में स्पाइवेयर इंस्टॉल कर देती हैं, जिससे हैकर्स आपके एसएमएस पढ़ सकते हैं और पासवर्ड चुरा सकते हैं।"
    },
    {
        "id": 9,
        "question_en": "Why do fraudsters ask for screen sharing apps like AnyDesk?",
        "question_te": "మోసగాళ్ళు ఎనీడెస్క్ (AnyDesk) వంటి యాప్‌లను ఎందుకు ఇన్‌స్టాల్ చేయమంటారు?",
        "question_hi": "धोखेबाज़ एनीडेस्क (AnyDesk) जैसे स्क्रीन शेयरिंग ऐप इंस्टॉल करने के लिए क्यों कहते हैं?",
        "answer_en": "Screen sharing apps allow scammers to view your phone screen live in real-time, enabling them to steal your UPI PIN and banking passwords as you type.",
        "answer_te": "స్క్రీన్ షేరింగ్ యాప్‌లు మీ ఫోన్ స్క్రీన్‌ను నేరుగా నేరగాళ్లకు చూపిస్తాయి. మీరు పాస్‌వర్డ్ టైప్ చేస్తున్నప్పుడు వారు దానిని చూసి దొంగిలిస్తారు.",
        "answer_hi": "स्क्रीन शेयरिंग ऐप धोखेबाज़ों को आपके फोन की स्क्रीन लाइव देखने की अनुमति देते हैं, जिससे आपके टाइप करते ही वे आपके पासवर्ड चुरा लेते हैं।"
    },
    {
        "id": 10,
        "question_en": "How can I identify fake customer care numbers?",
        "question_te": "నకిలీ కస్టమర్ కేర్ నంబర్లను ఎలా గుర్తించాలి?",
        "question_hi": "मैं नकली कस्टमर केयर नंबरों की पहचान कैसे कर सकता हूं?",
        "answer_en": "Never trust helpline numbers found on Google search or social media. Always check numbers listed inside official bank apps or back of debit cards.",
        "answer_te": "గూగుల్ సెర్చ్ లేదా సోషల్ మీడియాలోని నంబర్లను నమ్మవద్దు. కేవలం మీ బ్యాంక్ యాప్ లేదా డెబిట్ కార్డ్ వెనుక ఉన్న నంబర్లను మాత్రమే ఉపయోగించండి.",
        "answer_hi": "गूगल सर्च या सोशल मीडिया पर मिले हेल्पलाइन नंबरों पर कभी भरोसा न करें। हमेशा आधिकारिक बैंक ऐप या डेबिट कार्ड के पीछे लिखे नंबरों का उपयोग करें।"
    },
    {
        "id": 11,
        "question_en": "Can banks call asking for my debit card details or OTP?",
        "question_te": "బ్యాంక్ అధికారులు డెబిట్ కార్డ్ వివరాలు లేదా ఓటీపీ అడగవచ్చా?",
        "question_hi": "क्या बैंक अधिकारी मेरे कार्ड विवरण या ओटीपी मांग सकते हैं?",
        "answer_en": "NEVER. Bank employees, RBI officers, and police will never ask for your card details, CVV, OTP, or UPI PIN under any circumstances.",
        "answer_te": "ఎప్పటికీ లేదు. బ్యాంక్ ఉద్యోగులు, ఆర్‌బిఐ లేదా పోలీసులు ఎట్టి పరిస్థితుల్లోనూ మీ కార్డ్ వివరాలు, CVV లేదా ఓటీపీ అడగరు.",
        "answer_hi": "कभी नहीं। बैंक कर्मचारी, आरबीआई अधिकारी और पुलिस कभी भी किसी भी परिस्थिति में आपके कार्ड विवरण या ओटीपी नहीं मांगेंगे।"
    },
    {
        "id": 12,
        "question_en": "What is the Golden Hour in cyber fraud recovery?",
        "question_te": "సైబర్ మోసాల రికవరీలో 'గోల్డెన్ అవర్' అంటే ఏమిటి?",
        "question_hi": "साइबर धोखाधड़ी में 'गोल्डन आवर' क्या है?",
        "answer_en": "The Golden Hour refers to the first 2 hours after a cyber fraud occurs. Calling 1930 during this window gives police highest success in freezing funds.",
        "answer_te": "మోసం జరిగిన మొదటి 2 గంటలను గోల్డెన్ అవర్ అంటారు. ఈ సమయంలో 1930 కి కాల్ చేస్తే పోలీసులు మోసగాళ్ల ఖాతాల్లో డబ్బును నిలిపివేయడం సులువవుతుంది.",
        "answer_hi": "गोल्डन आवर का तात्पर्य धोखाधड़ी के बाद के पहले 2 घंटों से है। इस दौरान 1930 पर कॉल करने से पुलिस चुराए गए धन को रोकने में सबसे सफल होती है।"
    },
    {
        "id": 13,
        "question_en": "How does UPI Suraksha Mitra protect village citizens?",
        "question_te": "యూపీఐ సురక్ష మిత్ర గ్రామీణ పౌరులను ఎలా కాపాడుతుంది?",
        "question_hi": "यूपीआई सुरक्षा मित्र ग्रामीण नागरिकों की सुरक्षा कैसे करता है?",
        "answer_en": "We provide audio/video guides in regional languages, real-time district scam warnings, AI verification tools, and community reporting networks.",
        "answer_te": "మేము ప్రాంతీయ భాషల్లో ఆడియో/వీడియో గైడ్‌లు, లైవ్ జిల్లా సైబర్ హెచ్చరికలు, AI వెరిఫికేషన్ సాధనాలు మరియు గ్రామ సహాయ నెట్‌వర్క్‌ను అందిస్తున్నాము.",
        "answer_hi": "हम क्षेत्रीय भाषाओं में ऑडियो/वीडियो गाइड, लाइव जिला साइबर अलर्ट, एआई सत्यापन उपकरण और सामुदायिक रिपोर्टिंग नेटवर्क प्रदान करते हैं।"
    },
    {
        "id": 14,
        "question_en": "What should I do if my SIM card suddenly stops working?",
        "question_te": "నా సిమ్ కార్డ్ హఠాత్తుగా పనిచేయడం ఆగిపోతే నేను ఏమి చేయాలి?",
        "question_hi": "यदि मेरा सिम कार्ड अचानक काम करना बंद कर दे तो मुझे क्या करना चाहिए?",
        "answer_en": "If your SIM loses signal unexpectedly for hours, contact your telecom operator immediately to check for unauthorised SIM Swap fraud.",
        "answer_te": "మీ సిమ్ లో సిగ్నల్ హఠాత్తుగా పోతే, ఎవరైనా అనధికారికంగా SIM Swap చేశారేమో తెలుసుకోవడానికి వెంటనే టెలికాం ఆపరేటర్‌ను సంప్రదించండి.",
        "answer_hi": "यदि आपका सिम अचानक सिग्नल खो देता है, तो अनधिकृत सिम स्वैप धोखाधड़ी की जांच के लिए तुरंत अपने टेलीकॉम ऑपरेटर से संपर्क करें।"
    },
    {
        "id": 15,
        "question_en": "How can I check if a UPI ID is fake or reported for fraud?",
        "question_te": "ఒక యూపీఐ ఐడీ నకిలీదో కాదో ఎలా తనిఖీ చేయాలి?",
        "question_hi": "मैं कैसे जांच सकता हूं कि कोई यूपीआई आईडी नकली या रिपोर्ट की गई है?",
        "answer_en": "Use our UPI ID Verifier tool to query handles against national cyber crime complaint databases before completing any payment.",
        "answer_te": "ఎవరైనా డబ్బు అడిగితే చెల్లింపు చేసే ముందు మా యూపీఐ వెరిఫైయర్ సాధనాన్ని ఉపయోగించి ఆ ఐడీ మోసపూరితమైనదో కాదో సరిచూసుకోండి.",
        "answer_hi": "भुगतान पूरा करने से पहले हमारे यूपीआई आईडी सत्यापक टूल का उपयोग करके किसी भी हैंडल की जांच राष्ट्रीय साइबर शिकायत डेटाबेस से करें।"
    }
]

@awareness_bp.route('/api/awareness/faq', methods=['GET'])
def get_faqs():
    lang = request.args.get('lang', 'en').lower()
    result = []
    for f in FAQS:
        q_key = f"question_{lang}" if f"question_{lang}" in f else "question_en"
        a_key = f"answer_{lang}" if f"answer_{lang}" in f else "answer_en"
        result.append({
            "id": f["id"],
            "question": f[q_key],
            "answer": f[a_key]
        })
    return jsonify({
        "success": True,
        "count": len(result),
        "faqs": result
    }), 200

@awareness_bp.route('/api/awareness/content', methods=['GET'])
def get_awareness_content():
    return jsonify({
        "success": True,
        "title": "UPI Suraksha Mitra - Citizen Cyber Security Portal",
        "tagline": "Protecting Every Payment",
        "emergency_helpline": "1930",
        "portal_url": "https://cybercrime.gov.in"
    }), 200
