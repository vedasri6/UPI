import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SafeMarkdown from '../components/SafeMarkdown';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Copy, 
  Download, 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  MessageSquare, 
  Image as ImageIcon, 
  QrCode,
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  Loader2, 
  Check, 
  User,
  Plus,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Camera,
  RotateCcw,
  PhoneCall,
  ChevronDown,
  Info,
  Globe
} from 'lucide-react';

export const AiAssistantPage = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [lastFailedAction, setLastFailedAction] = useState(null);

  // Translation & Language Persistence State
  const [isTranslatingChat, setIsTranslatingChat] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const prevLanguageRef = useRef(language);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Helper to construct normalized message objects preserving originalText & translations cache
  const buildMessage = ({
    id = Date.now().toString(),
    sender,
    text,
    originalText = null,
    originalLang = null,
    translations = null,
    timestamp = null,
    category = 'chat',
    riskLevel = null,
    imagePreview = null,
    isError = false
  }) => {
    const currentLang = language;
    const origText = originalText !== null ? originalText : text;
    const origLang = originalLang !== null ? originalLang : currentLang;
    const trans = translations ? { ...translations } : {};
    if (!trans[currentLang]) {
      trans[currentLang] = text;
    }
    if (!trans[origLang]) {
      trans[origLang] = origText;
    }

    return {
      id,
      sender,
      text,
      originalText: origText,
      originalLang: origLang,
      translations: trans,
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category,
      riskLevel,
      imagePreview,
      isError
    };
  };

  // Plus menu & tool modals state
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [activeToolModal, setActiveToolModal] = useState(null); // 'image' | 'qr' | 'link' | 'sms' | null

  // Tool 1: Image Tool State
  const [toolImageFile, setToolImageFile] = useState(null);
  const [toolImagePreview, setToolImagePreview] = useState(null);
  const [imageCameraActive, setImageCameraActive] = useState(false);
  const imageVideoRef = useRef(null);
  const imageStreamRef = useRef(null);

  // Tool 2: QR Tool State
  const [qrTab, setQrTab] = useState('camera'); // 'camera' | 'upload' | 'text'
  const [toolQrInput, setToolQrInput] = useState('');
  const [qrImageFile, setQrImageFile] = useState(null);
  const [qrImagePreview, setQrImagePreview] = useState(null);
  const [qrCameraActive, setQrCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(null);
  const qrVideoRef = useRef(null);
  const qrStreamRef = useRef(null);
  const qrScanIntervalRef = useRef(null);

  // Tool 3: Link Tool State
  const [toolLinkInput, setToolLinkInput] = useState('');

  // Tool 4: SMS Tool State
  const [toolSmsInput, setToolSmsInput] = useState('');

  // Speech Recognition & Synthesis
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const recognitionRef = useRef(null);

  // Scrolling state
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const hasUserSentMessageRef = useRef(false);

  // Ensure initial scroll position starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle language switching: translate all existing messages into newly selected language
  useEffect(() => {
    if (prevLanguageRef.current === language) {
      return;
    }
    const previousLang = prevLanguageRef.current;
    prevLanguageRef.current = language;

    const currentMessages = messagesRef.current;
    if (!currentMessages || currentMessages.length === 0) return;

    let needsApiTranslation = false;
    const messagesToTranslate = [];

    // 1. Immediately apply cached translations (0ms instant switch)
    const instantlyUpdated = currentMessages.map(msg => {
      const cached = msg.translations && msg.translations[language];
      if (cached) {
        return { ...msg, text: cached };
      }
      needsApiTranslation = true;
      messagesToTranslate.push({
        id: msg.id,
        text: msg.originalText || msg.text,
        source_language: msg.originalLang || previousLang
      });
      return msg;
    });

    setMessages(instantlyUpdated);

    // If all messages already had translations for this language, no API request is needed
    if (!needsApiTranslation || messagesToTranslate.length === 0) {
      return;
    }

    let isCancelled = false;
    setIsTranslatingChat(true);
    setTranslationError(null);

    const translateChatMessages = async () => {
      try {
        const payload = {
          messages: messagesToTranslate,
          target_language: language,
          source_language: previousLang
        };

        let res;
        try {
          res = await fetch('/api/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (netErr) {
          res = await fetch('http://localhost:5000/api/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json().catch(() => null);

        if (isCancelled) return;

        if (!res.ok || !data || data.success === false) {
          const fallbackWarning = language === 'te'
            ? "సందేశాల అనువాదం తాత్కాలికంగా విఫలమైంది. అసలు సందేశాలు భద్రపరచబడ్డాయి."
            : "Translation temporarily unavailable. Retaining original message content.";
          setTranslationError(fallbackWarning);
          setTimeout(() => setTranslationError(null), 5000);
          return;
        }

        const translatedList = Array.isArray(data.messages) ? data.messages : [];
        const transMap = {};
        translatedList.forEach(item => {
          if (item && item.id && item.text) {
            transMap[item.id] = item.text;
          }
        });

        // Update displayed text and store in translations cache
        setMessages(prev => prev.map(msg => {
          const trans = transMap[msg.id];
          if (trans) {
            return {
              ...msg,
              text: trans,
              translations: {
                ...(msg.translations || {}),
                [language]: trans
              }
            };
          }
          return msg;
        }));
      } catch (err) {
        console.error("Translation error:", err);
        if (!isCancelled) {
          const fallbackWarning = language === 'te'
            ? "అనువాద సర్వర్‌తో కనెక్ట్ కాలేకపోయాము. సందేశాలు అలాగే ఉంచబడ్డాయి."
            : "Translation server connection failed. Messages retained unchanged.";
          setTranslationError(fallbackWarning);
          setTimeout(() => setTranslationError(null), 5000);
        }
      } finally {
        if (!isCancelled) {
          setIsTranslatingChat(false);
        }
      }
    };

    translateChatMessages();

    return () => {
      isCancelled = true;
    };
  }, [language]);

  const aiText = t.aiPage || {};

  // Welcome content strings
  const welcomeGreeting = language === 'te' 
    ? "నమస్తే! నేను మీ AI ఫ్రాడ్ అసిస్టెంట్‌ని"
    : "Hi! I'm your AI Fraud Assistant";

  const welcomeDescription = language === 'te'
    ? "భారతీయ డిజిటల్ చెల్లింపులు మరియు యూపీఐ మోసాల నివారణకు మీ అధికారిక సైబర్ భద్రతా సహాయకుడు. ప్రశ్నలు అడగండి, చెల్లింపు లింక్‌లు లేదా SMS లను తనిఖీ చేయండి, లేదా క్యూఆర్ కోడ్‌లను స్కాన్ చేయండి."
    : "Your intelligent cyber safety companion for Indian digital payments and UPI fraud prevention. Ask questions, verify suspicious links or messages, or inspect QR codes.";

  // Clickable Sample Suggestions
  const sampleSuggestions = language === 'te' ? [
    "డబ్బులు రావడానికి యూపీఐ పిన్ కొడితే మోసం ఎందుకు అవుతుంది?",
    "కస్టమర్ కేర్ కాల్‌లో బ్యాంక్ అధికారులు ఓటీపీ అడగవచ్చా?",
    "నకిలీ కరెంట్ బిల్లు కట్ అయ్యే SMS ను ఎలా గుర్తించాలి?",
    "ఖాతా నుండి తెలియకుండా డబ్బులు కట్ అయితే వెంటనే ఏమి చేయాలి?",
    "క్యూఆర్ కోడ్ స్కాన్ చేస్తే నా బ్యాంక్ ఖాతా నుండి డబ్బులు కట్ అవుతాయా?",
    "వాట్సాప్‌లో వచ్చే APK ఫైల్స్ ఇన్‌స్టాల్ చేయడం సురక్షితమేనా?"
  ] : [
    "Is entering my UPI PIN to receive money a scam?",
    "Can a bank customer care agent ask for an OTP over the phone?",
    "How do I recognize a fake electricity bill disconnection SMS?",
    "What should I do immediately if money was deducted from my account?",
    "Can scanning a QR code transfer money out of my bank?",
    "Is an APK file sent on WhatsApp safe to install?"
  ];

  // Scroll handler to detect if user manually scrolled up
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    setIsUserScrolledUp(distanceToBottom > 80);
  };

  const scrollToBottom = (behavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  // Only scroll to bottom when user actually sends a message or when a response arrives
  useEffect(() => {
    if (hasUserSentMessageRef.current && !isUserScrolledUp) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Clean up camera streams on unmount or modal close
  const stopAllCameras = () => {
    if (imageStreamRef.current) {
      imageStreamRef.current.getTracks().forEach(track => track.stop());
      imageStreamRef.current = null;
    }
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach(track => track.stop());
      qrStreamRef.current = null;
    }
    if (qrScanIntervalRef.current) {
      clearInterval(qrScanIntervalRef.current);
      qrScanIntervalRef.current = null;
    }
    setImageCameraActive(false);
    setQrCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopAllCameras();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speech Recognition setup (English & Telugu)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const langMap = { en: 'en-IN', te: 'te-IN' };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  // Text to Speech
  const toggleSpeak = (text, id) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingMsgId === id) {
      setSpeakingMsgId(null);
      return;
    }

    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap = { en: 'en-IN', te: 'te-IN' };
    utterance.lang = langMap[language] || 'en-IN';

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper: Get recent conversation turns for context continuity
  const getRecentHistory = () => {
    return messages
      .filter(m => m.text && !m.isError)
      .slice(-8)
      .map(m => ({
        sender: m.sender,
        text: m.text
      }));
  };

  // Send Chat Question (with conversation history context)
  const handleSendMessage = async (queryText = inputText) => {
    const question = (typeof queryText === 'string' ? queryText : inputText).trim();
    if (!question || isLoading) return;

    // If input is directly a URL, route immediately to the real Link Threat Inspector
    const isDirectUrl = /^(https?:\/\/|www\.)[^\s]+$/i.test(question) || 
      (!question.includes(' ') && /^[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(question));

    if (isDirectUrl) {
      await handleAnalyzeLinkSubmit(question);
      return;
    }

    hasUserSentMessageRef.current = true;

    const userMsg = buildMessage({
      id: Date.now().toString(),
      sender: "user",
      text: question,
      category: "chat"
    });

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setLastFailedAction(null);
    setIsUserScrolledUp(false);

    const history = getRecentHistory();
    const requestBody = { 
      question, 
      language, 
      userId: user?.id || "guest",
      history
    };

    try {
      let response;
      try {
        response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      } catch (networkErr) {
        response = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      }

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || data.success === false) {
        const errorText = data?.answer || data?.message || data?.error || (
          language === 'te' 
            ? "AI ప్రతిస్పందనను పొందడంలో లోపం ఏర్పడింది." 
            : "The AI assistant service returned an error."
        );
        throw new Error(errorText);
      }

      const aiResponseText = data.answer || (
        language === 'te' ? "సమాధానం అందుబాటులో లేదు." : "No response content received from assistant."
      );

      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiResponseText,
        riskLevel: data.linkAnalysis?.status || data.linkAnalysis?.riskLevel,
        category: data.linkAnalysis ? "link" : "chat"
      })]);
    } catch (err) {
      console.error("Chat error:", err);
      const isNetworkErr = !err.message || err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch');
      const errMsg = (!isNetworkErr && err.message)
        ? `⚠️ ${err.message}`
        : (language === 'te' 
            ? "⚠️ సర్వర్‌కు కనెక్ట్ చేయడంలో లోపం ఏర్పడింది. దయచేసి బ్యాకెండ్ సర్వర్ (పోర్ట్ 5000) నడుస్తుందో లేదో తనిఖీ చేయండి."
            : "⚠️ Unable to connect to backend server. Please verify the Flask backend is running on port 5000.");

      setLastFailedAction({ type: 'chat', payload: question });
      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: errMsg,
        isError: true,
        category: "chat"
      })]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tool 1: Analyze Image (Screenshot or Camera capture)
  const handleAnalyzeImageSubmit = async () => {
    if (!toolImageFile || isLoading) return;
    hasUserSentMessageRef.current = true;
    setIsLoading(true);
    setLastFailedAction(null);
    stopAllCameras();
    setActiveToolModal(null);
    setIsUserScrolledUp(false);

    const currentFile = toolImageFile;
    const currentPreview = toolImagePreview;

    const userMsg = buildMessage({
      id: Date.now().toString(),
      sender: "user",
      text: language === 'te' 
        ? `📷 [విశ్లేషణ కోసం ఇమేజ్ సమర్పించబడింది: ${currentFile.name}]` 
        : `📷 [Submitted Image for Fraud Inspection: ${currentFile.name}]`,
      imagePreview: currentPreview,
      category: "image"
    });
    setMessages(prev => [...prev, userMsg]);

    const formData = new FormData();
    formData.append('image', currentFile);
    formData.append('language', language);

    try {
      let res;
      try {
        res = await fetch('/api/ai/analyze-image', { method: 'POST', body: formData });
      } catch (err) {
        res = await fetch('http://localhost:5000/api/ai/analyze-image', { method: 'POST', body: formData });
      }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.success === false) {
        throw new Error(data?.message || data?.analysis || 'Image analysis failed');
      }

      const responseText = data.formattedAnalysis || data.analysis;

      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseText,
        riskLevel: data.riskLevel,
        category: "image"
      })]);
    } catch (err) {
      console.error("Image analysis error:", err);
      const isNetworkErr = !err.message || err.message.includes('fetch') || err.message.includes('NetworkError');
      const errMsg = (!isNetworkErr && err.message)
        ? `⚠️ ${err.message}`
        : (language === 'te' 
            ? "⚠️ ఇమేజ్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి స్పష్టమైన ఇమేజ్ అప్‌లోడ్ చేసి మళ్ళీ ప్రయత్నించండి."
            : "⚠️ Failed to inspect the uploaded image. Please ensure the file is under 10MB and try again.");

      setLastFailedAction({ type: 'image', file: currentFile, preview: currentPreview });
      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: errMsg,
        isError: true,
        category: "image"
      })]);
    } finally {
      setIsLoading(false);
      setToolImageFile(null);
      setToolImagePreview(null);
    }
  };

  // Tool 2: Analyze QR (Camera, Image upload, or string payload)
  const handleAnalyzeQrSubmit = async () => {
    if (!toolQrInput.trim() && !qrImageFile) return;
    hasUserSentMessageRef.current = true;
    setIsLoading(true);
    setLastFailedAction(null);
    stopAllCameras();
    setActiveToolModal(null);
    setIsUserScrolledUp(false);

    const payloadText = toolQrInput.trim();
    const qrFile = qrImageFile;
    const qrPreview = qrImagePreview;

    const userMsg = buildMessage({
      id: Date.now().toString(),
      sender: "user",
      text: qrFile 
        ? (language === 'te' ? `🔳 [క్యూఆర్ కోడ్ ఇమేజ్: ${qrFile.name}]` : `🔳 [Uploaded QR Code Image: ${qrFile.name}]`)
        : (language === 'te' ? `🔳 [క్యూఆర్ కోడ్ పేలోడ్: ${payloadText}]` : `🔳 [QR Code Payload: ${payloadText}]`),
      imagePreview: qrPreview,
      category: "qr"
    });
    setMessages(prev => [...prev, userMsg]);

    try {
      let res;
      if (qrFile) {
        const formData = new FormData();
        formData.append('image', qrFile);
        formData.append('language', language);
        try {
          res = await fetch('/api/ai/analyze-qr', { method: 'POST', body: formData });
        } catch (err) {
          res = await fetch('http://localhost:5000/api/ai/analyze-qr', { method: 'POST', body: formData });
        }
      } else {
        const requestBody = { payload: payloadText, language };
        try {
          res = await fetch('/api/ai/analyze-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
        } catch (err) {
          res = await fetch('http://localhost:5000/api/ai/analyze-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
        }
      }

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'QR analysis failed');
      }

      const responseText = data.formattedAnalysis || (
        `**Risk Level:** ${data.riskLevel}\n\n` +
        `**Why it may be suspicious:** ${data.warning || data.whySuspicious}\n\n` +
        `**What you should do:** ${data.safetyAdvice || data.whatToDo}\n\n` +
        `**What you should never do:** NEVER enter your UPI PIN to receive money.`
      );

      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseText,
        riskLevel: data.riskLevel,
        category: "qr"
      })]);
    } catch (err) {
      console.error("QR analysis error:", err);
      const errMsg = language === 'te'
        ? "⚠️ క్యూఆర్ కోడ్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
        : "⚠️ Failed to inspect QR code. Please check the QR payload format and retry.";

      setLastFailedAction({ type: 'qr', payload: payloadText, file: qrFile, preview: qrPreview });
      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: errMsg,
        isError: true,
        category: "qr"
      })]);
    } finally {
      setIsLoading(false);
      setToolQrInput('');
      setQrImageFile(null);
      setQrImagePreview(null);
    }
  };

  // Tool 3: Analyze Link
  const handleAnalyzeLinkSubmit = async (targetUrl = null) => {
    const rawTarget = typeof targetUrl === 'string' ? targetUrl : toolLinkInput;
    const linkUrl = rawTarget.trim();
    if (!linkUrl || isLoading) return;
    hasUserSentMessageRef.current = true;
    setIsLoading(true);
    setLastFailedAction(null);
    setActiveToolModal(null);
    setIsUserScrolledUp(false);
    setInputText('');

    const userMsg = buildMessage({
      id: Date.now().toString(),
      sender: "user",
      text: language === 'te' ? `🔗 [అనుమానాస్పద లింక్ తనిఖీ: ${linkUrl}]` : `🔗 [Checking Suspicious Link: ${linkUrl}]`,
      category: "link"
    });
    setMessages(prev => [...prev, userMsg]);

    try {
      const requestBody = { url: linkUrl, language };
      let res;
      try {
        res = await fetch('/api/ai/analyze-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      } catch (err) {
        res = await fetch('http://localhost:5000/api/ai/analyze-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      }

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Link analysis failed');
      }

      const responseText = data.formattedAnalysis || (
        `Status: ${data.status || data.riskLevel || 'Unable to Verify'}\n` +
        `Reason: ${data.reason}\n` +
        `Action: ${data.action || data.safetyAdvice}`
      );

      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseText,
        riskLevel: data.riskLevel,
        category: "link"
      })]);
    } catch (err) {
      console.error("Link analysis error:", err);
      const errMsg = language === 'te'
        ? "⚠️ లింక్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి వెబ్‌సైట్ లింక్‌ను సరిచూసి మళ్ళీ ప్రయత్నించండి."
        : "⚠️ Failed to verify link safely. Please verify the URL structure and try again.";

      setLastFailedAction({ type: 'link', url: linkUrl });
      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: errMsg,
        isError: true,
        category: "link"
      })]);
    } finally {
      setIsLoading(false);
      setToolLinkInput('');
    }
  };

  // Tool 4: Analyze SMS / Message
  const handleAnalyzeSmsSubmit = async () => {
    const smsText = toolSmsInput.trim();
    if (!smsText || isLoading) return;
    hasUserSentMessageRef.current = true;
    setIsLoading(true);
    setLastFailedAction(null);
    setActiveToolModal(null);
    setIsUserScrolledUp(false);

    const truncatedSms = `${smsText.slice(0, 80)}${smsText.length > 80 ? '...' : ''}`;
    const userMsg = buildMessage({
      id: Date.now().toString(),
      sender: "user",
      text: language === 'te' ? `💬 [సందేశం విశ్లేషణ: "${truncatedSms}"]` : `💬 [Analyzing Message Text: "${truncatedSms}"]`,
      category: "sms"
    });
    setMessages(prev => [...prev, userMsg]);

    try {
      const requestBody = { message: smsText, language };
      let res;
      try {
        res = await fetch('/api/ai/analyze-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      } catch (err) {
        res = await fetch('http://localhost:5000/api/ai/analyze-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      }

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'SMS analysis failed');
      }

      const responseText = data.formattedAnalysis || (
        `**Risk Level:** ${data.riskLevel}\n\n` +
        `**Why it may be suspicious:** ${data.reason}\n\n` +
        `**What you should do:** ${data.preventionTips}\n\n` +
        `**What you should never do:** Never share OTP or click unverified links.`
      );

      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseText,
        riskLevel: data.riskLevel,
        category: "sms"
      })]);
    } catch (err) {
      console.error("SMS analysis error:", err);
      const errMsg = language === 'te'
        ? "⚠️ మెసేజ్ విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
        : "⚠️ Failed to inspect SMS message. Please retry.";

      setLastFailedAction({ type: 'sms', message: smsText });
      setMessages(prev => [...prev, buildMessage({
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: errMsg,
        isError: true,
        category: "sms"
      })]);
    } finally {
      setIsLoading(false);
      setToolSmsInput('');
    }
  };

  // Retry handler for last failed action
  const handleRetryLastAction = () => {
    if (!lastFailedAction) return;
    if (lastFailedAction.type === 'chat') {
      handleSendMessage(lastFailedAction.payload);
    } else if (lastFailedAction.type === 'image') {
      setToolImageFile(lastFailedAction.file);
      setToolImagePreview(lastFailedAction.preview);
      handleAnalyzeImageSubmit();
    } else if (lastFailedAction.type === 'qr') {
      setToolQrInput(lastFailedAction.payload || '');
      setQrImageFile(lastFailedAction.file || null);
      setQrImagePreview(lastFailedAction.preview || null);
      handleAnalyzeQrSubmit();
    } else if (lastFailedAction.type === 'link') {
      setToolLinkInput(lastFailedAction.url);
      handleAnalyzeLinkSubmit();
    } else if (lastFailedAction.type === 'sms') {
      setToolSmsInput(lastFailedAction.message);
      handleAnalyzeSmsSubmit();
    }
  };

  // New Chat: Resets conversation
  const handleNewChat = () => {
    if (messages.length > 0) {
      const confirmText = language === 'te' 
        ? "కొత్త సంభాషణను ప్రారంభించాలా? ప్రస్తుత చాట్ రీసెట్ చేయబడుతుంది." 
        : "Start a fresh conversation? Current chat view will be reset.";
      if (!window.confirm(confirmText)) return;
    }

    stopAllCameras();
    setInputText('');
    setLastFailedAction(null);
    setSpeakingMsgId(null);
    hasUserSentMessageRef.current = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
  };

  // Export History
  const exportHistory = () => {
    if (messages.length === 0) return;
    const textData = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}`).join('\n\n---\n\n');
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UPI_Suraksha_AI_Assistant_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Camera Handler for Tool 1 (Image Camera)
  const startImageCamera = async () => {
    setCameraPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      imageStreamRef.current = stream;
      setImageCameraActive(true);
      setTimeout(() => {
        if (imageVideoRef.current) {
          imageVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Image Camera error:", err);
      setCameraPermissionError(language === 'te' ? "కెమెరా యాక్సెస్ తిరస్కరించబడింది. దయచేసి ఇమేజ్‌ను అప్‌లోడ్ చేయండి." : "Camera access was denied or is not supported. Please upload an image file instead.");
    }
  };

  const captureImageFromCamera = () => {
    if (!imageVideoRef.current) return;
    const video = imageVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_capture_${Date.now()}.png`, { type: 'image/png' });
        setToolImageFile(file);
        setToolImagePreview(canvas.toDataURL('image/png'));
        stopAllCameras();
      }
    }, 'image/png');
  };

  // Camera Handler for Tool 2 (QR Camera)
  const startQrCamera = async () => {
    setCameraPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      qrStreamRef.current = stream;
      setQrCameraActive(true);
      setTimeout(() => {
        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = stream;
        }
      }, 100);

      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        qrScanIntervalRef.current = setInterval(async () => {
          if (qrVideoRef.current && qrVideoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(qrVideoRef.current);
              if (barcodes.length > 0) {
                const detectedVal = barcodes[0].rawValue;
                setToolQrInput(detectedVal);
                stopAllCameras();
              }
            } catch (err) {
              // ignore frame read errors
            }
          }
        }, 600);
      }
    } catch (err) {
      console.error("QR Camera error:", err);
      setCameraPermissionError(language === 'te' ? "కెమెరా యాక్సెస్ తిరస్కరించబడింది. దయచేసి క్యూఆర్ కోడ్ ఫోటోను అప్‌లోడ్ చేయండి." : "Camera access was denied or is not supported. Please upload a QR code image instead.");
    }
  };

  const captureQrSnapshot = () => {
    if (!qrVideoRef.current) return;
    const video = qrVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `qr_capture_${Date.now()}.png`, { type: 'image/png' });
        setQrImageFile(file);
        setQrImagePreview(canvas.toDataURL('image/png'));
        stopAllCameras();
        setQrTab('upload');
      }
    }, 'image/png');
  };

  // Helper to get styled badge for risk level
  const renderRiskBadge = (text) => {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();
    
    const hasStatusTag = lower.includes('status:') || lower.includes('risk level:') || lower.includes('రిస్క్ స్థాయి:');
    if (!hasStatusTag) return null;

    if (lower.includes('potentially dangerous') || lower.includes('high risk') || lower.includes('malicious') || lower.includes('ప్రమాదకరం')) {
      return (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>{language === 'te' ? "అత్యంత ప్రమాదకరం / అనుమానాస్పదం" : "Malicious / Suspicious"}</span>
          </span>
        </div>
      );
    }
    if (lower.includes('suspicious') || lower.includes('అనుమానాస్పదం')) {
      return (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'te' ? "అనుమానాస్పదం" : "Suspicious"}</span>
          </span>
        </div>
      );
    }
    if (lower.includes('no known threats detected') || lower.includes('సురక్షితం') || lower.includes('low risk')) {
      return (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'te' ? "ఎలాంటి ముప్పు గుర్తించబడలేదు" : "No Known Threats Detected"}</span>
          </span>
        </div>
      );
    }
    if (lower.includes('unable to verify') || lower.includes('ధృవీకరించబడలేదు')) {
      return (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'te' ? "ధృవీకరించబడలేదు" : "Unable to Verify"}</span>
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen max-h-screen flex flex-col bg-slate-50 dark:bg-bgDark overflow-hidden select-none sm:select-auto">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Main Full-Page AI Chat Interface Container */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden relative">
        
        {/* Sleek Sub-Header Bar */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2.5 z-10 shrink-0 flex items-center justify-between gap-3 shadow-xs">
          
          {/* Left: Identity and Back Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={language === 'te' ? "హోమ్ పేజీకి వెళ్లు" : "Back to Home"}
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {language === 'te' ? "AI ఫ్రాడ్ అసిస్టెంట్" : "AI Fraud Assistant"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Gemini 3.5</span>
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'te' ? "యూపీఐ సైబర్ భద్రతా సంరక్షకుడు" : "UPI Cyber Fraud Prevention Assistant"}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Bilingual Language Switcher Button (English / Telugu) */}
            <button
              onClick={() => changeLanguage(language === 'en' ? 'te' : 'en')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-xs font-black flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700 transition-all"
              title="Toggle English / Telugu"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span className="uppercase">{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all hover:scale-105"
              title={language === 'te' ? "కొత్త సంభాషణను ప్రారంభించు" : "Start New Chat"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'te' ? "కొత్త చాట్" : "New Chat"}</span>
            </button>

            {/* Export History (when messages exist) */}
            {messages.length > 0 && (
              <button
                onClick={exportHistory}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-xs font-black flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Export Chat History"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{language === 'te' ? "డౌన్‌లోడ్" : "Export"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle Translation Progress / Fallback Status Banner */}
        {isTranslatingChat && (
          <div className="bg-blue-50/95 dark:bg-blue-950/75 border-b border-blue-200/80 dark:border-blue-900/80 px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-bold text-blue-700 dark:text-sky-300 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-sky-400" />
            <span>
              {language === 'te' 
                ? "చాట్ సంభాషణ తెలుగులోకి అనువదించబడుతోంది..." 
                : "Translating chat conversation into English..."}
            </span>
          </div>
        )}

        {translationError && (
          <div className="bg-amber-50/95 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{translationError}</span>
            </div>
            <button 
              onClick={() => setTranslationError(null)} 
              className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Scrollable Chat Message Feed */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin space-y-6"
        >
          <div className="max-w-4xl mx-auto w-full space-y-6">

            {/* =============================================================== */}
            {/* A. WELCOME STATE (Displayed when no conversation messages exist) */}
            {/* =============================================================== */}
            {messages.length === 0 && (
              <div className="py-6 sm:py-10 space-y-8 animate-in fade-in duration-500">
                
                {/* Hero Greeting Box */}
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto mb-2">
                    <Bot className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {welcomeGreeting}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {welcomeDescription}
                  </p>
                </div>

                {/* 4 Feature Action Cards (Blue-and-White Clean Aesthetic) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  
                  {/* Tool 1 Card */}
                  <button
                    onClick={() => setActiveToolModal('image')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left flex items-start gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{language === 'te' ? "రసీదు / స్క్రీన్‌షాట్ తనిఖీ" : "Scan / Upload Image"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'te' ? "చెల్లింపు స్క్రీన్‌షాట్ లేదా రసీదును పరిశీలించండి" : "Inspect payment receipts or vouchers"}
                      </div>
                    </div>
                  </button>

                  {/* Tool 2 Card */}
                  <button
                    onClick={() => setActiveToolModal('qr')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left flex items-start gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{language === 'te' ? "క్యూఆర్ కోడ్ స్కాన్" : "Scan QR Code"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'te' ? "నకిలీ క్యాష్‌బ్యాక్ లేదా మనీ డెబిట్ క్యూఆర్‌ను గుర్తించండి" : "Detect payment debit traps & fake cashbacks"}
                      </div>
                    </div>
                  </button>

                  {/* Tool 3 Card */}
                  <button
                    onClick={() => setActiveToolModal('link')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left flex items-start gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{language === 'te' ? "అనుమానాస్పద లింక్ తనిఖీ" : "Check Suspicious Link"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'te' ? "ఫిషింగ్ సైట్‌లు మరియు నకిలీ వెబ్‌సైట్‌లను గుర్తించండి" : "Inspect URLs for phishing & cyber fraud"}
                      </div>
                    </div>
                  </button>

                  {/* Tool 4 Card */}
                  <button
                    onClick={() => setActiveToolModal('sms')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left flex items-start gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{language === 'te' ? "మెసేజ్ / SMS విశ్లేషణ" : "Analyze SMS / Message"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'te' ? "కరెంట్ బిల్లు, కేవైసీ మరియు లాటరీ నకిలీ మెసేజ్‌లు" : "Power bills, lottery rewards & fake bank KYC"}
                      </div>
                    </div>
                  </button>

                </div>

                {/* Suggested Questions Grid */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'te' ? "తరచుగా అడిగే ప్రశ్నలు (క్లిక్ చేయండి):" : "Suggested Questions (Click to Ask):"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sampleSuggestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputText(q);
                          handleSendMessage(q);
                        }}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700/40 text-left text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
                      >
                        <span className="leading-snug pr-2">"{q}"</span>
                        <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* =============================================================== */}
            {/* B. CONVERSATION MESSAGE LIST                                    */}
            {/* =============================================================== */}
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar on AI Messages */}
                {msg.sender === 'ai' && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                {/* Message Bubble Card */}
                <div className={`space-y-2.5 transition-all ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[75%]'
                    : msg.isError
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 rounded-2xl rounded-tl-xs p-4 sm:p-5 font-medium text-xs sm:text-sm border border-red-200 dark:border-red-800 shadow-xs max-w-[90%] sm:max-w-[80%]'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-xs p-4 sm:p-5 font-normal text-xs sm:text-sm border border-slate-200/90 dark:border-slate-700/80 shadow-xs max-w-[90%] sm:max-w-[80%]'
                }`}>
                  
                  {/* Meta Bar: Sender, Category Pill, Timestamp */}
                  <div className={`flex items-center justify-between gap-4 text-[10px] pb-1.5 border-b font-bold ${
                    msg.sender === 'user' 
                      ? 'border-white/15 text-blue-100' 
                      : 'border-slate-100 dark:border-slate-700 text-slate-400'
                  }`}>
                    <span className="uppercase flex items-center gap-1.5">
                      {msg.sender === 'user' ? (language === 'te' ? 'మీరు' : 'You') : (language === 'te' ? 'AI అసిస్టెంట్' : 'AI Assistant')}
                      {msg.category && msg.category !== 'chat' && (
                        <span className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] ${
                          msg.sender === 'user'
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300'
                        }`}>
                          {msg.category.toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Attached Image Preview inside User Message */}
                  {msg.imagePreview && (
                    <div className="my-2 rounded-xl overflow-hidden max-h-56 border border-white/20 bg-black/10">
                      <img src={msg.imagePreview} alt="Uploaded for inspection" className="max-h-56 object-contain mx-auto" />
                    </div>
                  )}

                  {/* Risk Level Badge (if applicable) */}
                  {msg.sender === 'ai' && renderRiskBadge(msg.text)}

                  {/* Clean Markdown Response Text */}
                  <SafeMarkdown content={msg.text} />

                  {/* AI Message Action Bar */}
                  {msg.sender === 'ai' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Text-to-Speech Toggle */}
                        <button
                          onClick={() => toggleSpeak(msg.text, msg.id || idx)}
                          className="px-2.5 py-1 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-200/80 dark:border-slate-600 transition-colors"
                          title="Listen to response"
                        >
                          {speakingMsgId === (msg.id || idx) ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-red-500" />
                              <span>{language === 'te' ? "ఆపు" : "Stop"}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                              <span>{language === 'te' ? "వినండి" : "Listen"}</span>
                            </>
                          )}
                        </button>

                        {/* Copy Message */}
                        <button
                          onClick={() => copyToClipboard(msg.text, idx)}
                          className="px-2.5 py-1 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-200/80 dark:border-slate-600 transition-colors"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{language === 'te' ? "కాపీ చేయబడింది" : "Copied"}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>{language === 'te' ? "కాపీ" : "Copy"}</span>
                            </>
                          )}
                        </button>

                        {/* Retry button on error */}
                        {msg.isError && lastFailedAction && (
                          <button
                            onClick={handleRetryLastAction}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-black flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{language === 'te' ? "మళ్ళీ ప్రయత్నించు" : "Retry"}</span>
                          </button>
                        )}
                      </div>

                      {/* Micro Links to Practice UPI or Report Scam */}
                      <div className="flex items-center gap-1.5 text-[10px] font-black">
                        <button
                          onClick={() => navigate('/practice-upi')}
                          className="text-blue-600 dark:text-sky-400 hover:underline"
                        >
                          {language === 'te' ? "ప్రాక్టీస్ యూపీఐ" : "Practice UPI"}
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <button
                          onClick={() => navigate('/report-scam')}
                          className="text-slate-500 hover:text-red-600 hover:underline"
                        >
                          {language === 'te' ? "మోసం రిపోర్ట్" : "Report Fraud"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* User Avatar on User Messages */}
                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 mt-1">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Thinking Animation */}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 max-w-sm shadow-xs animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {language === 'te' ? "AI అసిస్టెంట్ విశ్లేషిస్తోంది..." : "AI Fraud Assistant is analyzing..."}
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Floating "Jump to Latest" Button */}
        {isUserScrolledUp && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 right-6 px-3.5 py-1.5 bg-blue-600 text-white rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 hover:bg-blue-700 transition-all z-30"
          >
            <ChevronDown className="w-4 h-4" />
            <span>{language === 'te' ? "తాజా మెసేజ్" : "Jump to latest"}</span>
          </button>
        )}

        {/* =============================================================== */}
        {/* 4. FIXED / STICKY BOTTOM INPUT BAR                             */}
        {/* =============================================================== */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-4 py-3 sm:py-3.5 z-20 shrink-0 shadow-lg">
          <div className="max-w-4xl mx-auto w-full relative">

            {/* Plus (+) Tool Popover Dropdown Menu */}
            {isPlusMenuOpen && (
              <div 
                className="absolute bottom-16 left-0 z-40 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 w-72 space-y-1 animate-in fade-in slide-in-from-bottom-2"
                onMouseLeave={() => setIsPlusMenuOpen(false)}
              >
                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                  {language === 'te' ? "AI విశ్లేషణ సాధనాలు" : "AI Fraud Analysis Tools"}
                </div>

                {/* 1. Upload Image */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setActiveToolModal('image');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black">{language === 'te' ? "📷 ఇమేజ్ / కెమెరా స్కాన్" : "📷 Upload Image / Camera"}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{language === 'te' ? "చెల్లింపు రసీదు లేదా స్క్రీన్‌షాట్" : "Receipts & payment screenshots"}</div>
                  </div>
                </button>

                {/* 2. Scan QR Code */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setActiveToolModal('qr');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black">{language === 'te' ? "🔳 క్యూఆర్ కోడ్ స్కాన్" : "🔳 Scan QR Code"}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{language === 'te' ? "కెమెరా స్కాన్ లేదా క్యూఆర్ ఫోటో" : "Camera scanner or QR image"}</div>
                  </div>
                </button>

                {/* 3. Check Suspicious Link */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setActiveToolModal('link');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black">{language === 'te' ? "🔗 అనుమానాస్పద లింక్ తనిఖీ" : "🔗 Check Suspicious Link"}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{language === 'te' ? "ఫిషింగ్ & షార్ట్‌లింక్ తనిఖీ" : "Inspect URL for phishing & scams"}</div>
                  </div>
                </button>

                {/* 4. Analyze SMS / Message */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setActiveToolModal('sms');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black">{language === 'te' ? "💬 మెసేజ్ / SMS విశ్లేషణ" : "💬 Analyze SMS / Message"}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{language === 'te' ? "కరెంట్ బిల్లు, కేవైసీ, లాటరీ SMS" : "Power bill, OTP traps & lottery SMS"}</div>
                  </div>
                </button>
              </div>
            )}

            {/* Input Row Container */}
            <div className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-3xl p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
              
              {/* Plus (+) Attachment Button */}
              <button
                type="button"
                onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl font-black transition-all border flex items-center justify-center shrink-0 ${
                  isPlusMenuOpen
                    ? 'bg-blue-600 text-white border-blue-600 rotate-45 shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-blue-600 dark:text-sky-400 border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
                }`}
                title={language === 'te' ? "సాధనాలు లంకె చేయండి (+)" : "Attach Tools (+)"}
              >
                <Plus className="w-5 h-5 transition-transform" />
              </button>

              {/* Voice Recognition (Mic) Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl font-bold transition-all border flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-md'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                title="Voice Input (Speech-to-Text)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  language === 'te' 
                    ? "యూపీఐ సైబర్ భద్రత గురించి ఏదైనా అడగండి... ('+' నొక్కి టూల్స్ వాడండి)" 
                    : "Ask anything about UPI fraud, safety... (or click '+' to attach tools)"
                }
                className="flex-1 bg-transparent px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
                title={language === 'te' ? "పంపండి" : "Send"}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Micro Safety Disclaimer */}
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {language === 'te'
                ? "యూపీఐ సురక్ష మిత్ర AI • అత్యవసర ఆర్థిక మోసం జరిగితే వెంటనే నేషనల్ సైబర్ హెల్ప్‌లైన్ 1930 కి కాల్ చేయండి."
                : "UPI Suraksha Mitra AI • For emergency financial loss, dial National Cyber Crime Helpline 1930 immediately."}
            </p>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4 Tool Modals triggered from (+) Menu or Welcome Cards                    */}
      {/* ========================================================================= */}

      {/* 1. Scan / Upload Image Modal */}
      {activeToolModal === 'image' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <span>{language === 'te' ? "ఇమేజ్ స్కాన్ లేదా అప్‌లోడ్ చేయండి" : "Scan or Upload Payment Image"}</span>
              </h3>
              <button 
                onClick={() => {
                  stopAllCameras();
                  setActiveToolModal(null);
                }} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {imageCameraActive ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-700">
                  <video 
                    ref={imageVideoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={captureImageFromCamera}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{language === 'te' ? "ఫోటో తీయండి" : "Capture Photo"}</span>
                  </button>
                  <button
                    onClick={stopAllCameras}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                  >
                    {language === 'te' ? "కెమెరా మూసివేయి" : "Close Camera"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-900 relative">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert(language === 'te' ? "ఇమేజ్ సైజు 10MB కంటే తక్కువగా ఉండాలి" : "File size must be under 10MB");
                          return;
                        }
                        setToolImageFile(file);
                        const reader = new FileReader();
                        reader.onload = () => setToolImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {toolImagePreview ? (
                    <div className="space-y-2">
                      <img src={toolImagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{toolImageFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {language === 'te' ? "చెల్లింపు స్క్రీన్‌షాట్ లేదా రసీదును ఎంచుకోండి" : "Click or drag to upload receipt/screenshot"}
                      </p>
                      <p className="text-[11px] text-slate-400">PNG, JPG, WEBP (Max 10MB)</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-bold">OR</span>
                </div>

                <button
                  type="button"
                  onClick={startImageCamera}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-600"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>{language === 'te' ? "కెమెరాతో ప్రత్యక్ష ఫోటో తీయండి" : "Take Photo with Camera"}</span>
                </button>
              </div>
            )}

            {cameraPermissionError && (
              <p className="text-xs text-red-500 font-bold">{cameraPermissionError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  stopAllCameras();
                  setActiveToolModal(null);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                {language === 'te' ? "రద్దు చేయి" : "Cancel"}
              </button>
              <button
                onClick={handleAnalyzeImageSubmit}
                disabled={!toolImageFile || isLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md"
              >
                {language === 'te' ? "విశ్లేషించి చాట్‌లో జోడించు" : "Analyze & Add to Chat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Scan QR Code Modal */}
      {activeToolModal === 'qr' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>{language === 'te' ? "యూపీఐ క్యూఆర్ కోడ్ స్కాన్" : "Scan or Inspect QR Code"}</span>
              </h3>
              <button 
                onClick={() => {
                  stopAllCameras();
                  setActiveToolModal(null);
                }} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Tabs */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => {
                  setQrTab('camera');
                  if (!qrCameraActive) startQrCamera();
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  qrTab === 'camera' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {language === 'te' ? "కెమెరా స్కాన్" : "Live Camera"}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopAllCameras();
                  setQrTab('upload');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  qrTab === 'upload' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {language === 'te' ? "క్యూఆర్ ఇమేజ్" : "Upload Image"}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopAllCameras();
                  setQrTab('text');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  qrTab === 'text' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {language === 'te' ? "క్యూఆర్ లింక్" : "Paste UPI Text"}
              </button>
            </div>

            {/* Tab 1: Live Camera Scanner */}
            {qrTab === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-60 mx-auto border border-slate-700">
                  <video ref={qrVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-blue-500/60 rounded-2xl pointer-events-none m-6 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={captureQrSnapshot}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{language === 'te' ? "ఫ్రేమ్ క్యాప్చర్ చేయి" : "Capture QR Frame"}</span>
                  </button>
                  <button
                    onClick={stopAllCameras}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                  >
                    {language === 'te' ? "ఆపు" : "Stop"}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Upload QR Image */}
            {qrTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-900 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setQrImageFile(file);
                      const reader = new FileReader();
                      reader.onload = () => setQrImagePreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {qrImagePreview ? (
                  <div className="space-y-2">
                    <img src={qrImagePreview} alt="QR Preview" className="max-h-40 mx-auto rounded-xl object-contain" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{qrImageFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <QrCode className="w-8 h-8 text-blue-600 mx-auto" />
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'te' ? "క్యూఆర్ కోడ్ ఇమేజ్‌ను ఎంచుకోండి" : "Select or drag QR code screenshot"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Paste QR text */}
            {qrTab === 'text' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === 'te' ? "క్యూఆర్ లింక్ లేదా UPI స్ట్రింగ్ పేస్ట్ చేయండి:" : "Paste QR Payload or upi://pay URI:"}
                </label>
                <input
                  type="text"
                  value={toolQrInput}
                  onChange={(e) => setToolQrInput(e.target.value)}
                  placeholder="e.g. upi://pay?pa=merchant@bank&pn=Store&am=100"
                  className="w-full px-4 py-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {cameraPermissionError && (
              <p className="text-xs text-red-500 font-bold">{cameraPermissionError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  stopAllCameras();
                  setActiveToolModal(null);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                {language === 'te' ? "రద్దు చేయి" : "Cancel"}
              </button>
              <button
                onClick={handleAnalyzeQrSubmit}
                disabled={(!toolQrInput.trim() && !qrImageFile) || isLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md"
              >
                {language === 'te' ? "విశ్లేషించి చాట్‌లో జోడించు" : "Analyze & Add to Chat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Check Suspicious Link Modal */}
      {activeToolModal === 'link' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                <span>{language === 'te' ? "అనుమానాస్పద వెబ్‌సైట్ లింక్ తనిఖీ" : "Inspect Suspicious Payment Link"}</span>
              </h3>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === 'te' ? "తనిఖీ చేయవలసిన URL లింక్:" : "Enter Full Website or Shortener URL:"}
                </label>
                <input
                  type="url"
                  value={toolLinkInput}
                  onChange={(e) => setToolLinkInput(e.target.value)}
                  placeholder="https://sbi-reward-claim.xyz/login"
                  className="w-full px-4 py-3.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 font-bold">
                {language === 'te' 
                  ? "🛡️ సర్వర్-సైడ్ రక్షణ: అంతర్గత ప్రైవేట్ నెట్‌వర్క్‌లను హ్యాక్ చేయకుండా సురక్షిత SSRF తనిఖీ వ్యవస్థ అమర్చబడింది." 
                  : "🛡️ Safe Inspection: SSRF-protected analyzer inspects domain reputation without navigating to harmful pages."}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveToolModal(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                {language === 'te' ? "రద్దు చేయి" : "Cancel"}
              </button>
              <button
                onClick={handleAnalyzeLinkSubmit}
                disabled={!toolLinkInput.trim() || isLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md"
              >
                {language === 'te' ? "విశ్లేషించి చాట్‌లో జోడించు" : "Analyze & Add to Chat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Analyze SMS / Message Modal */}
      {activeToolModal === 'sms' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>{language === 'te' ? "అనుమానాస్పద మెసేజ్ / SMS విశ్లేషణ" : "Analyze Suspicious SMS / Message"}</span>
              </h3>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === 'te' ? "SMS లేదా వాట్సాప్ మెసేజ్ ఇక్కడ పేస్ట్ చేయండి:" : "Paste Suspicious SMS or WhatsApp Text:"}
                </label>
                <textarea
                  rows={4}
                  value={toolSmsInput}
                  onChange={(e) => setToolSmsInput(e.target.value)}
                  placeholder={
                    language === 'te' 
                      ? "ఉదాహరణ: మీ కరెంట్ బిల్లు చెల్లించలేదు. ఈ రాత్రి కరెంట్ కట్ అవుతుంది..." 
                      : "e.g. Electricity bill unpaid, connection will be disconnected tonight. Call 9876543210..."
                  }
                  className="w-full p-4 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Sample Quick-pick buttons for quick testing */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'te' ? "సాధారణ నకిలీ మెసేజ్ నమూనాలు (క్లిక్ చేయండి):" : "Sample Fraud Patterns (Click to Fill):"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setToolSmsInput(
                      language === 'te' 
                        ? "ప్రియమైన వినియోగదారుడా, మీ విద్యుత్ బిల్లు చెల్లించలేదు. ఈ రాత్రి 9:30 గంటలకు విద్యుత్ నిలిపివేయబడుతుంది. వెంటనే 9876543210 కి కాల్ చేయండి." 
                        : "Dear consumer, your electricity power bill is unpaid. Power will be disconnected tonight at 9:30 PM. Immediately call official officer at 9876543210."
                    )}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold hover:bg-blue-50 hover:text-blue-600"
                  >
                    ⚡ {language === 'te' ? "కరెంట్ బిల్లు" : "Power Bill"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolSmsInput(
                      language === 'te'
                        ? "అభినందనలు! మీరు KBC లక్కీ డ్రాలో 25 లక్షలు గెలుచుకున్నారు. నగదు పొందడానికి రిజిస్ట్రేషన్ ఫీజు రూ. 2500 చెల్లించండి."
                        : "Congratulations! Your mobile number won 25 Lakh in KBC Lucky Draw. To claim your reward money, deposit processing fee of Rs 2500."
                    )}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold hover:bg-blue-50 hover:text-blue-600"
                  >
                    🎁 {language === 'te' ? "లాటరీ బహుమతి" : "Lottery Prize"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolSmsInput(
                      language === 'te'
                        ? "హెచ్చరిక: మీ బ్యాంక్ ఖాతా కేవైసీ గడువు ముగిసింది. మీ ఖాతా బ్లాక్ కాకుండా ఉండటానికి వెంటనే లింక్ క్లిక్ చేసి ఓటీపీ నమోదు చేయండి."
                        : "Alert: Your SBI YONO bank account KYC is suspended. Update PAN immediately to avoid block. Call bank manager."
                    )}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold hover:bg-blue-50 hover:text-blue-600"
                  >
                    🏦 {language === 'te' ? "బ్యాంక్ కేవైసీ" : "Bank KYC"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveToolModal(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                {language === 'te' ? "రద్దు చేయి" : "Cancel"}
              </button>
              <button
                onClick={handleAnalyzeSmsSubmit}
                disabled={!toolSmsInput.trim() || isLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md"
              >
                {language === 'te' ? "విశ్లేషించి చాట్‌లో జోడించు" : "Analyze & Add to Chat"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AiAssistantPage;
