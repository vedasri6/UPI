import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Clock, 
  Download, 
  RefreshCw,
  Smartphone,
  Bot,
  LayoutDashboard,
  Volume2,
  VolumeX
} from 'lucide-react';

export const QuizPage = () => {
  const { t, language } = useLanguage();
  const { speakText, isSpeaking, stopSpeech } = useAccessibility();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer

  const rawQuestions = [
    {
      q: "Do you need to enter your UPI PIN to RECEIVE money into your bank account?",
      options: ["YES, PIN is always required", "NO, receiving money requires NO PIN or QR scan", "Only if the sender is an Army officer"],
      answer: 1,
      explanation: "UPI PIN is required ONLY to SEND money. Receiving money needs NO PIN."
    },
    {
      q: "A caller claiming to be a Bank Manager asks for your OTP to stop account disconnection. What should you do?",
      options: ["Share OTP immediately", "Never share OTP and hang up the call immediately", "Ask them to send a WhatsApp message first"],
      answer: 1,
      explanation: "Banks and customer care will NEVER ask for your confidential OTP over the phone."
    },
    {
      q: "What does scanning a QR code do on a UPI app?",
      options: ["It receives cashback money", "It ALWAYS deducts (sends) money from your account", "It verifies your mobile SIM card"],
      answer: 1,
      explanation: "Scanning a QR code always initiates an outgoing payment FROM your bank account."
    },
    {
      q: "You receive an SMS: 'Electricity bill unpaid! Power will disconnect tonight at 9:30 PM. Click link'. What should you do?",
      options: ["Click the link and pay immediately", "Ignore the SMS or check your bill on official electricity app", "Share your bank details on call"],
      answer: 1,
      explanation: "This is a fake utility bill disconnection scam. Never tap links in SMS."
    },
    {
      q: "A WhatsApp message claims you won ₹25 Lakhs in KBC lottery, but asks for ₹10,000 tax. Is this genuine?",
      options: ["Yes, pay the tax to get ₹25 Lakhs", "No, it is a 100% fake lottery scam", "Only if they send a photo of cheque"],
      answer: 1,
      explanation: "Legitimate lotteries never ask winners to deposit advance tax money."
    },
    {
      q: "Where should you download mobile banking and UPI apps from?",
      options: ["Links sent on WhatsApp", "Official Google Play Store or Apple App Store only", "Random website APK files"],
      answer: 1,
      explanation: "Download apps ONLY from official app stores to avoid fake malware APKs."
    },
    {
      q: "What is the National Cyber Crime Helpline toll-free number in India?",
      options: ["100", "1930", "108"],
      answer: 1,
      explanation: "Helpline 1930 connects directly to National Cyber Crime Reporting Portal."
    },
    {
      q: "A caller asks you to install AnyDesk or TeamViewer on your phone to resolve a refund. Should you?",
      options: ["Yes, install it", "Never install remote control screen sharing apps for strangers", "Install if they sound polite"],
      answer: 1,
      explanation: "Remote desktop apps allow scammers to view your screen live and steal bank passwords."
    },
    {
      q: "What should you check on your banking screen before entering your UPI PIN?",
      options: ["Your phone battery percentage", "The exact registered payee name and payment amount", "The wallpaper color"],
      answer: 1,
      explanation: "Always verify the receiver's name to ensure money goes to the correct merchant."
    },
    {
      q: "What should you do if money is fraudulently deducted from your bank account?",
      options: ["Wait for 7 days", "Call Helpline 1930 within 2 hours (Golden Hour)", "Delete your UPI app"],
      answer: 1,
      explanation: "Calling 1930 within the Golden Hour gives an 85%+ success rate in freezing stolen funds."
    },
    {
      q: "Is it safe to search for bank customer care numbers on Google Search or Google Maps?",
      options: ["Yes, top results are always real", "No, scammers post fake numbers on Google Maps", "Yes, if it says 'verified'"],
      answer: 1,
      explanation: "Refer only to helpline numbers printed behind your debit card or official app."
    },
    {
      q: "What is an OTP (One-Time Password)?",
      options: ["A public discount code", "A secret digital signature to approve bank transfers", "A phone call password"],
      answer: 1,
      explanation: "OTP approves financial transactions. Never share it with anyone."
    },
    {
      q: "Someone sends a QR code on WhatsApp claiming to send you ₹5,000. Will you receive money if you scan it?",
      options: ["Yes, money will be credited", "No, scanning QR code ALWAYS sends money OUT", "Only if you enter 4-digit PIN"],
      answer: 1,
      explanation: "Receiving money NEVER requires scanning a QR code or entering a PIN."
    },
    {
      q: "An online job promises ₹5,000 daily for liking YouTube videos if you deposit ₹2,000 first. Is it real?",
      options: ["Yes, legitimate job opportunity", "No, it is a task deposit investment scam", "Yes, if they pay ₹100 first"],
      answer: 1,
      explanation: "Real companies never ask job applicants to deposit money for tasks."
    },
    {
      q: "What should you do if someone claims to be a Police Officer on video call demanding 'digital arrest' money?",
      options: ["Transfer money immediately out of fear", "Disconnect call immediately. Police never conduct 'digital arrest' on video call", "Share your bank PIN"],
      answer: 1,
      explanation: "Digital arrest is a fake police impersonation scam. Real police do not demand video money."
    },
    {
      q: "Why should you avoid making UPI payments on open public Wi-Fi networks?",
      options: ["Public Wi-Fi is too fast", "Open Wi-Fi networks can be intercepted by hackers to capture passwords", "It uses too much battery"],
      answer: 1,
      explanation: "Use mobile data (4G/5G) for financial payments instead of public Wi-Fi."
    },
    {
      q: "What is the official website of National Cyber Crime Reporting Portal?",
      options: ["cybercrime.gov.in", "police.com", "fakebank.org"],
      answer: 0,
      explanation: "https://cybercrime.gov.in is the official Ministry of Home Affairs portal."
    },
    {
      q: "Can you change your UPI PIN safely inside your UPI app whenever you want?",
      options: ["Yes, anytime inside official app settings", "No, only bank managers can change PIN", "No, PIN cannot be changed"],
      answer: 0,
      explanation: "You can change or reset your UPI PIN anytime inside your bank app."
    },
    {
      q: "A SIM card upgrade call asks you to forward an SMS with 20-digit SIM number. Should you forward it?",
      options: ["Yes, to get 5G fast network", "Never forward SIM swap SMS or eSIM QR codes", "Yes, if caller sounds official"],
      answer: 1,
      explanation: "Forwarding SIM numbers allows scammers to hijack your mobile number for OTPs."
    },
    {
      q: "What is the best way to protect senior citizens from UPI scams?",
      options: ["Teach them to never share OTP / PIN and save Helpline 1930", "Tell them to delete bank apps", "Give them stranger numbers"],
      answer: 0,
      explanation: "Education on basic safety rules and 1930 helpline saves citizens from cyber fraud."
    }
  ];

  const rawQuestionsTe = [
    {
      q: "మీ బ్యాంక్ ఖాతాలోకి డబ్బులు అందుకోవడానికి (RECEIVE) యూపీఐ పిన్ కొట్టాల్సిన అవసరం ఉందా?",
      options: ["అవును, ఎల్లప్పుడూ పిన్ అవసరం", "లేదు, డబ్బులు రావడానికి పిన్ లేదా క్యూఆర్ స్కాన్ అవసరం లేదు", "సైనికాధికారి పంపితే మాత్రమే"],
      answer: 1,
      explanation: "యూపీఐ పిన్ కేవలం డబ్బులు పంపడానికి (SEND) మాత్రమే అవసరం. డబ్బులు తీసుకోవడానికి ఎటువంటి పిన్ అవసరం లేదు."
    },
    {
      q: "బ్యాంక్ మేనేజర్‌గా చెప్పుకునే వ్యక్తి ఖాతా రద్దు కాకుండా ఉండటానికి మీ ఓటీపీని అడిగితే మీరు ఏమి చేయాలి?",
      options: ["వెంటనే ఓటీపీ చెప్పాలి", "ఎప్పుడూ ఓటీపీ చెప్పకూడదు, వెంటనే కాల్ కట్ చేయాలి", "ముందు వాట్సాప్‌లో మెసేజ్ పెట్టమనాలి"],
      answer: 1,
      explanation: "బ్యాంకులు మరియు కస్టమర్ కేర్ ఎప్పుడూ మీ వ్యక్తిగత రహస్య ఓటీపీని ఫోన్‌లో అడగవు."
    },
    {
      q: "యూపీఐ యాప్‌లో క్యూఆర్ కోడ్‌ను స్కాన్ చేస్తే ఏమి జరుగుతుంది?",
      options: ["క్యాష్‌బ్యాక్ డబ్బులు వస్తాయి", "మీ ఖాతా నుండి డబ్బులు ఎల్లప్పుడూ కట్ అవుతాయి (డెబిట్ అవుతాయి)", "మీ సిమ్ కార్డు ధృవీకరించబడుతుంది"],
      answer: 1,
      explanation: "క్యూఆర్ కోడ్‌ను స్కాన్ చేయడం అంటే ఎల్లప్పుడూ మీ ఖాతా నుండి డబ్బులు చెల్లించడమే."
    },
    {
      q: "కరెంట్ బిల్లు చెల్లించలేదని, ఈ రాత్రి 9:30కి విద్యుత్ సరఫరా ఆగిపోతుందని SMS వస్తే మీరు ఏమి చేయాలి?",
      options: ["లింక్ నొక్కి వెంటనే పే చేయాలి", "SMS ను పట్టించుకోకూడదు లేదా అధికారిక విద్యుత్ యాప్‌లో తనిఖీ చేయాలి", "బ్యాంక్ వివరాలు కాల్‌లో చెప్పాలి"],
      answer: 1,
      explanation: "ఇది విద్యుత్ బిల్లుల పేరిట జరిగే మోసం. SMS లో వచ్చే తెలియని లింకులను ఎప్పుడూ నొక్కవద్దు."
    },
    {
      q: "KBC లాటరీలో ₹25 లక్షలు గెలుచుకున్నారని, ₹10,000 పన్ను కట్టాలని వాట్సాప్ మెసేజ్ వస్తే అది నిజమేనా?",
      options: ["అవును, ₹25 లక్షల కోసం ₹10,000 కట్టాలి", "కాదు, ఇది 100% నకిలీ లాటరీ మోసం", "చెక్ ఫోటో పంపితేనే నమ్మాలి"],
      answer: 1,
      explanation: "అసలైన లాటరీలు ఎప్పుడూ విజేతలను ముందుగా పన్ను డబ్బులు కట్టమని అడగవు."
    },
    {
      q: "మొబైల్ బ్యాంకింగ్ మరియు యూపీఐ యాప్‌లను ఎక్కడి నుండి డౌన్‌లోడ్ చేసుకోవాలి?",
      options: ["వాట్సాప్‌లో వచ్చిన లింకుల నుండి", "అధికారిక గూగుల్ ప్లే స్టోర్ లేదా యాపిల్ యాప్ స్టోర్ నుండి మాత్రమే", "ఏదైనా వెబ్‌సైట్ APK ఫైల్స్ నుండి"],
      answer: 1,
      explanation: "నకిలీ వైరస్ యాప్‌ల నుండి రక్షణ పొందడానికి అధికారిక యాప్ స్టోర్‌ల నుండి మాత్రమే యాప్‌లను డౌన్‌లోడ్ చేయండి."
    },
    {
      q: "భారతదేశంలో జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్ టోల్-ఫ్రీ నంబర్ ఏది?",
      options: ["100", "1930", "108"],
      answer: 1,
      explanation: "హెల్ప్‌లైన్ 1930 నేరుగా జాతీయ సైబర్ క్రైమ్ రిపోర్టింగ్ పోర్టల్‌కు కనెక్ట్ చేస్తుంది."
    },
    {
      q: "రీఫండ్ సమస్యను పరిష్కరించడానికి ఫోన్‌లో AnyDesk లేదా TeamViewer యాప్ ఇన్‌స్టాల్ చేయమని కాలర్ చెబితే మీరు ఏమి చేయాలి?",
      options: ["అవును, ఇన్‌స్టాల్ చేయాలి", "అపరిచితుల కోసం ఎప్పుడూ స్క్రీన్ షేరింగ్ యాప్‌లను ఇన్‌స్టాల్ చేయకూడదు", "మర్యాదగా మాట్లాడితే ఇన్‌స్టాల్ చేయవచ్చు"],
      answer: 1,
      explanation: "రిమోట్ డెస్క్‌టాప్ యాప్‌లు మోసగాళ్లకు మీ ఫోన్ స్క్రీన్‌ను ప్రత్యక్షంగా చూపించి పాస్‌వర్డ్‌లను దొంగిలించడానికి అవకాశం ఇస్తాయి."
    },
    {
      q: "యూపీఐ పిన్ కొట్టే ముందు బ్యాంకింగ్ స్క్రీన్‌పై ఏమి పరిశీలించాలి?",
      options: ["ఫోన్ బ్యాటరీ శాతం", "ఖాతాదారుని అసలు పేరు మరియు పంపే మొత్తం", "వాల్‌పేపర్ రంగు"],
      answer: 1,
      explanation: "సరైన వ్యాపారికి లేదా వ్యక్తికి డబ్బులు వెళ్తున్నాయని నిర్ధారించుకోవడానికి ఎల్లప్పుడూ గ్రహీత పేరును సరిచూసుకోండి."
    },
    {
      q: "మీ ఖాతా నుండి మోసపూరితంగా డబ్బులు కట్ అయితే మీరు వెంటనే ఏమి చేయాలి?",
      options: ["7 రోజులు వేచి చూడాలి", "గోల్డెన్ అవర్‌లో (2 గంటల్లో) 1930 హెల్ప్‌లైన్‌కు కాల్ చేయాలి", "యూపీఐ యాప్‌ను డిలీట్ చేయాలి"],
      answer: 1,
      explanation: "మోసం జరిగిన 2 గంటల్లో 1930 కి కాల్ చేస్తే పోయిన డబ్బులను ఫ్రీజ్ చేసే అవకాశం 85% కంటే ఎక్కువగా ఉంటుంది."
    },
    {
      q: "గూగుల్ సెర్చ్ లేదా గూగుల్ మ్యాప్స్‌లో బ్యాంక్ కస్టమర్ కేర్ నంబర్లను వెతకడం సురక్షితమేనా?",
      options: ["అవును, మొదట వచ్చేవి నిజమైనవే", "కాదు, మోసగాళ్లు గూగుల్ మ్యాప్స్‌లో నకిలీ నంబర్లు పెడతారు", "వెరిఫైడ్ అని రాసి ఉంటే నమ్మవచ్చు"],
      answer: 1,
      explanation: "మీ డెబిట్ కార్డు వెనుక లేదా అధికారిక బ్యాంక్ యాప్‌లో ఉన్న నంబర్లను మాత్రమే ఉపయోగించండి."
    },
    {
      q: "ఓటీపీ (One-Time Password) అంటే ఏమిటి?",
      options: ["డిస్కౌంట్ కూపన్ కోడ్", "బ్యాంక్ లావాదేవీలను ఆమోదించే రహస్య డిజిటల్ సంతకం", "ఫోన్ కాల్ పాస్‌వర్డ్"],
      answer: 1,
      explanation: "ఓటీపీ ఆర్థిక లావాదేవీలను ఆమోదిస్తుంది. దీన్ని ఎవరితోనూ పంచుకోవద్దు."
    },
    {
      q: "వాట్సాప్‌లో క్యూఆర్ కోడ్ పంపి ₹5,000 పంపుతున్నామని అంటే, దాన్ని స్కాన్ చేస్తే మీకు డబ్బులు వస్తాయా?",
      options: ["అవును, డబ్బులు జమవుతాయి", "రాదు, క్యూఆర్ కోడ్ స్కాన్ చేస్తే మీ నుండే డబ్బులు పోతాయి", "4 అంకెల పిన్ కొడితేనే వస్తాయి"],
      answer: 1,
      explanation: "డబ్బులు అందుకోవడానికి క్యూఆర్ కోడ్ స్కాన్ చేయాల్సిన అవసరం ఎప్పటికీ ఉండదు."
    },
    {
      q: "యూట్యూబ్ వీడియోలను లైక్ చేస్తే రోజుకు ₹5,000 ఇస్తామని, మొదట ₹2,000 డిపాజిట్ చేయమంటే అది నిజమేనా?",
      options: ["అవును, నిజమైన ఉద్యోగ అవకాశం", "కాదు, ఇది టాస్క్ డిపాజిట్ పెట్టుబడి మోసం", "మొదట ₹100 ఇస్తే నమ్మవచ్చు"],
      answer: 1,
      explanation: "నిజమైన కంపెనీలు ఉద్యోగాల కోసం లేదా టాస్క్‌ల కోసం ముందస్తుగా డబ్బులు డిపాజిట్ చేయమని అడగవు."
    },
    {
      q: "పోలీస్ అధికారినని వీడియో కాల్ చేసి 'డిజిటల్ అరెస్ట్' పేరిట డబ్బులు డిమాండ్ చేస్తే ఏమి చేయాలి?",
      options: ["భయపడి వెంటనే డబ్బులు పంపాలి", "వెంటనే కాల్ కట్ చేయాలి. నిజమైన పోలీసులు ఎప్పుడూ వీడియో కాల్‌లో అరెస్ట్ చేయరు", "బ్యాంక్ పిన్ చెప్పాలి"],
      answer: 1,
      explanation: "డిజిటల్ అరెస్ట్ అనేది పోలీసుల పేరిట జరిగే మోసం. అసలైన పోలీసులు ఎప్పుడూ వీడియో కాల్ ద్వారా డబ్బులు డిమాండ్ చేయరు."
    },
    {
      q: "పబ్లిక్ వై-ఫై నెట్‌వర్క్‌లలో యూపీఐ చెల్లింపులు ఎందుకు చేయకూడదు?",
      options: ["పబ్లిక్ వై-ఫై చాలా వేగంగా ఉంటుంది", "ఓపెన్ నెట్‌వర్క్‌లలో హ్యాకర్లు బ్యాంక్ పాస్‌వర్డ్‌లను దొంగిలించవచ్చు", "ఎక్కువ బ్యాటరీ ఖర్చవుతుంది"],
      answer: 1,
      explanation: "ఆర్థిక లావాదేవీల కోసం పబ్లిక్ వై-ఫై కి బదులుగా మీ స్వంత మొబైల్ డేటాను (4G/5G) ఉపయోగించండి."
    },
    {
      q: "నేషనల్ సైబర్ క్రైమ్ రిపోర్టింగ్ పోర్టల్ అధికారిక వెబ్‌సైట్ ఏది?",
      options: ["cybercrime.gov.in", "police.com", "fakebank.org"],
      answer: 0,
      explanation: "https://cybercrime.gov.in కేంద్ర హోం మంత్రిత్వ శాఖ అధికారిక సైబర్ క్రైమ్ పోర్టల్."
    },
    {
      q: "మీ యూపీఐ యాప్‌లో ఎప్పుడైనా సురక్షితంగా యూపీఐ పిన్ మార్చుకోవచ్చా?",
      options: ["అవును, అధికారిక యాప్ సెట్టింగ్స్‌లో ఎప్పుడైనా మార్చుకోవచ్చు", "లేదు, బ్యాంక్ మేనేజర్ మాత్రమే మార్చగలరు", "పిన్ మార్చడం కుదరదు"],
      answer: 0,
      explanation: "మీ బ్యాంకింగ్ లేదా యూపీఐ యాప్ సెట్టింగ్స్‌లో ఎప్పుడైనా పిన్‌ని సులభంగా మార్చుకోవచ్చు."
    },
    {
      q: "సిమ్ అప్‌గ్రేడ్ కోసం 20 అంకెల సిమ్ నంబర్‌తో వచ్చిన SMS ని ఫార్వర్డ్ చేయమని కాలర్ అడిగితే చేయవచ్చా?",
      options: ["అవును, 5G నెట్‌వర్క్ వస్తుంది", "ఎప్పుడూ సిమ్ స్వాప్ SMS లేదా ఈ-సిమ్ క్యూఆర్ కోడ్‌లను పంపకూడదు", "కాలర్ మంచిగా మాట్లాడితే పంపవచ్చు"],
      answer: 1,
      explanation: "సిమ్ నంబర్లను ఫార్వర్డ్ చేయడం ద్వారా మోసగాళ్లు మీ నంబర్‌ను వారి ఫోన్‌లోకి మార్చుకుని ఓటీపీలను దొంగిలిస్తారు."
    },
    {
      q: "వయోవృద్ధులను యూపీఐ మోసాల నుండి కాపాడటానికి ఉత్తమ మార్గం ఏది?",
      options: ["ఓటీపీ/పిన్ ఎవరికీ చెప్పవద్దని నేర్పించడం మరియు 1930 నంబర్ ఫోన్‌లో సేవ్ చేయడం", "బ్యాంక్ యాప్‌లను డిలీట్ చేయమనడం", "అపరిచితుల నంబర్లను ఇవ్వడం"],
      answer: 0,
      explanation: "ప్రాథమిక భద్రతా నిబంధనలపై అవగాహన మరియు 1930 హెల్ప్‌లైన్ పౌరులను సైబర్ మోసాల నుండి కాపాడుతుంది."
    }
  ];

  // Initialize questions based on active language
  useEffect(() => {
    const list = language === 'te' ? rawQuestionsTe : rawQuestions;
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setSelectedOption(null);
    setIsFinished(false);
  }, [language]);

  // Timer countdown
  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, timeLeft]);

  const handleSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === questions[currentQ].answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const scorePercentage = Math.round((score / (questions.length || 1)) * 100);
  const isPassed = scorePercentage >= 80;

  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Certificate Background
    ctx.fillStyle = '#0F4C81';
    ctx.fillRect(0, 0, 1000, 700);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(30, 30, 940, 640);

    ctx.strokeStyle = '#16A34A';
    ctx.lineWidth = 8;
    ctx.strokeRect(50, 50, 900, 600);

    // Header Text
    ctx.fillStyle = '#0F4C81';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF CYBER SAFETY AWARENESS', 500, 130);

    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('NATIONAL DIGITAL PAYMENT SURAKSHA INITIATIVE', 500, 170);

    ctx.fillStyle = '#1E293B';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText('This is to certify that', 500, 240);

    ctx.fillStyle = '#0F4C81';
    ctx.font = 'black 36px Inter, sans-serif';
    ctx.fillText('CERTIFIED DIGITAL SAFETY CHAMPION', 500, 300);

    ctx.fillStyle = '#334155';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`Has successfully passed the National Cyber Awareness Examination with a score of ${scorePercentage}%.`, 500, 360);
    ctx.fillText('Demonstrating mastery in UPI PIN Security, OTP Protection, QR Scam Prevention & 1930 Emergency Guidelines.', 500, 390);

    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText(`Certificate ID: UPI-SURAKSHA-${Date.now().toString().slice(-8)}`, 500, 470);
    ctx.fillText(`Issue Date: ${new Date().toLocaleDateString()}`, 500, 500);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 580);
    ctx.lineTo(350, 580);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(650, 580);
    ctx.lineTo(850, 580);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('National Cyber Safety Authority', 250, 610);
    ctx.fillText('UPI Suraksha Mitra Platform', 750, 610);

    const link = document.createElement('a');
    link.download = `Cyber_Safety_Certificate_${scorePercentage}percent.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-6">
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>{t.toolPages?.backToHome || 'Back to Home'}</span>
        </button>

        <div className="p-8 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-8">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 flex items-center justify-center shrink-0">
              <Award className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'te' ? "డిజిటల్ భద్రతా పరీక్ష" : "Multilingual Cyber Safety Quiz"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {t.features?.awarenessQuiz?.title || "Digital Payment Safety Exam"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                {language === 'te' ? "20 ప్రశ్నలకు సమాధానమిచ్చి 80%+ సాధించి మీ సర్టిఫికేట్ పొందండి." : "Answer 20 questions. Score 80%+ to earn your official Downloadable Cyber Safety Certificate!"}
              </p>
            </div>
          </div>

          {/* Progress Bar & Timer */}
          {!isFinished && questions.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-slate-600 dark:text-slate-300">
                <span>{language === 'te' ? `ప్రశ్న ${currentQ + 1} / ${questions.length}` : `Progress: Question ${currentQ + 1} of ${questions.length}`}</span>
                <span className="flex items-center gap-1 text-red-600 font-black">
                  <Clock className="w-4 h-4" />
                  {language === 'te' ? 'సమయం:' : 'Time Left:'} {formatTime(timeLeft)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Quiz Result View */}
          {isFinished ? (
            <div className="p-8 bg-slate-900 text-white rounded-3xl text-center space-y-6 animate-in zoom-in-95 shadow-2xl border border-slate-800">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${
                isPassed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                <Award className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black">{isPassed ? (language === 'te' ? 'అభినందనలు! మీరు ఉత్తీర్ణులయ్యారు!' : 'Congratulations! You Passed!') : (language === 'te' ? 'పరీక్ష పూర్తయింది' : 'Exam Completed')}</h2>
                <div className="text-3xl font-black text-emerald-400">{language === 'te' ? 'మీ స్కోరు:' : 'Your Score:'} {scorePercentage}% ({score} / {questions.length})</div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-semibold">
                  {isPassed 
                    ? (language === 'te' ? 'అద్భుతం! మీరు యూపీఐ పిన్, ఓటీపీ భద్రత మరియు సైబర్ మోసాల నివారణలో పూర్తి జ్ఞానాన్ని సాధించారు.' : 'Outstanding! You have mastered UPI PIN rules, OTP protection, and cyber scam prevention.')
                    : (language === 'te' ? 'మీరు 80% కంటే తక్కువ స్కోరు సాధించారు. దయచేసి మార్గదర్శకాలను చదివి మళ్లీ సాధన చేయండి.' : 'You scored below the 80% passing threshold. Please review the safety guidelines and retake the exam.')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {isPassed && (
                  <button
                    onClick={downloadCertificate}
                    className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'te' ? "అధికారిక సర్టిఫికేట్ డౌన్‌లోడ్ చేయి" : "Download Official Certificate"}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const list = language === 'te' ? rawQuestionsTe : rawQuestions;
                    const shuffled = [...list].sort(() => 0.5 - Math.random());
                    setQuestions(shuffled);
                    setCurrentQ(0);
                    setScore(0);
                    setSelectedOption(null);
                    setIsFinished(false);
                    setTimeLeft(300);
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'te' ? "మళ్లీ పరీక్ష రాయండి" : "Retake Quiz"}</span>
                </button>
              </div>

              {/* Connected Next Actions */}
              <div className="pt-6 border-t border-slate-800 space-y-3 text-left">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider block text-center">
                  {language === 'te' ? "తదుపరి ప్రాక్టీస్ చర్యలు:" : "Connected Next Actions:"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => navigate('/practice-upi')}
                    className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700 shadow-md flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <span>{language === 'te' ? "ప్రాక్టీస్ యూపీఐ చేయండి" : "Practice UPI Payment"}</span>
                  </button>

                  <button
                    onClick={() => navigate('/ai-assistant')}
                    className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700 shadow-md flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4 text-amber-400" />
                    <span>{language === 'te' ? "AI అసిస్టెంట్‌ని అడగండి" : "Ask AI Assistant"}</span>
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700 shadow-md flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'te' ? "డాష్‌బోర్డ్‌కి వెళ్లండి" : "Go to Dashboard"}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            questions.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {questions[currentQ].q}
                  </h3>
                  <button
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeech();
                      } else {
                        const questionToRead = questions[currentQ];
                        const optionsText = questionToRead.options.map((opt, i) => `${language === 'te' ? `ఎంపిక ${i + 1}` : `Option ${i + 1}`}: ${opt}`).join('. ');
                        speakText(`${questionToRead.q}. ${optionsText}`);
                      }
                    }}
                    className={`shrink-0 p-2.5 rounded-xl border flex items-center gap-1.5 font-bold text-xs transition-all ${
                      isSpeaking
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                    title={language === 'te' ? "ప్రశ్నను బిగ్గరగా చదవండి" : "Read question aloud"}
                    aria-label={language === 'te' ? "ప్రశ్నను బిగ్గరగా చదవండి" : "Read question aloud"}
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5 text-amber-600" /> : <Volume2 className="w-5 h-5 text-primary" />}
                    <span className="hidden sm:inline font-black">{isSpeaking ? (language === 'te' ? 'ఆపండి' : 'Stop') : (language === 'te' ? 'వినండి' : 'Listen')}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {questions[currentQ].options.map((optText, idx) => {
                    let btnColor = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-primary";
                    
                    if (selectedOption !== null) {
                      if (idx === questions[currentQ].answer) {
                        btnColor = "bg-emerald-600 text-white border-emerald-700 font-black";
                      } else if (selectedOption === idx) {
                        btnColor = "bg-red-600 text-white border-red-700 font-black";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`w-full p-4 text-left text-xs sm:text-sm font-extrabold rounded-2xl border ${btnColor} transition-all flex items-center justify-between shadow-sm`}
                      >
                        <span>{optText}</span>
                        {selectedOption !== null && idx === questions[currentQ].answer && <CheckCircle2 className="w-5 h-5 text-white" />}
                        {selectedOption === idx && idx !== questions[currentQ].answer && <XCircle className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 animate-in fade-in space-y-3">
                    <p>💡 <span className="font-black">{language === 'te' ? 'వివరణ:' : 'Explanation:'}</span> {questions[currentQ].explanation}</p>
                    <button
                      onClick={handleNext}
                      className="w-full py-3 bg-primary hover:bg-primary-light text-white font-black text-xs sm:text-sm rounded-xl shadow-md"
                    >
                      {currentQ < questions.length - 1 
                        ? (language === 'te' ? 'తదుపరి ప్రశ్న ➔' : 'Next Question ➔') 
                        : (language === 'te' ? 'పరీక్ష ఫలితం చూడండి' : 'View Exam Result')}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuizPage;
