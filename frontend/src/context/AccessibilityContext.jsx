import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const { language } = useLanguage();

  // Text size: 'normal' (18px base) | 'large' (20.5px) | 'xl' (23px)
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('upi_suraksha_text_size') || 'normal';
  });

  // High contrast mode for elderly / low vision users
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('upi_suraksha_high_contrast') === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState(null);

  // Apply text size to root document element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-text-size', textSize);
    localStorage.setItem('upi_suraksha_text_size', textSize);
  }, [textSize]);

  // Apply high contrast class
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('upi_suraksha_high_contrast', String(highContrast));
  }, [highContrast]);

  const cycleTextSize = useCallback(() => {
    setTextSize(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xl';
      return 'normal';
    });
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, []);

  // Global Speech Synthesis Read Aloud helper
  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSpeechText(null);
  }, []);

  const speakText = useCallback((rawText, customLang = null) => {
    if (!('speechSynthesis' in window)) {
      alert(language === 'te' ? "ఈ బ్రౌజర్‌లో వాయిస్ మద్దతు అందుబాటులో లేదు." : "Speech synthesis is not supported in this browser.");
      return;
    }

    if (isSpeaking && activeSpeechText === rawText) {
      stopSpeech();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown and technical punctuation
    const cleanText = String(rawText || '')
      .replace(/[*_#`[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = customLang || (language === 'te' ? 'te-IN' : 'en-IN');
    utterance.lang = targetLang;
    utterance.rate = 0.92; // Slightly slower, clearer rate for elderly comprehension

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechText(null);
    };

    setIsSpeaking(true);
    setActiveSpeechText(rawText);
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, activeSpeechText, language, stopSpeech]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        cycleTextSize,
        highContrast,
        toggleHighContrast,
        speakText,
        stopSpeech,
        isSpeaking,
        activeSpeechText
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
