import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Smartphone, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  X,
  User,
  Info,
  Check,
  RotateCcw,
  BookOpen,
  Bot,
  MessageSquareWarning,
  LayoutDashboard,
  Loader2,
  Sparkles
} from 'lucide-react';

export const PracticeUpiPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const p = t?.practiceUpi || {};

  // Flow Steps:
  // 1: Receiver Details
  // 2: Enter Amount
  // 3: Review Payment
  // 4: Enter Demo PIN
  // 5: Processing Animation
  // 6: Payment Success Receipt
  const [step, setStep] = useState(1);

  // Sample Demo Receivers
  const sampleReceivers = [
    { name: 'Kalyan Kumar (Verified Merchant)', identifier: '9876543210' },
    { name: 'Rampal Kirana Store', identifier: 'rampal.store@okaxis' },
    { name: 'Sita Farmers Cooperative', identifier: '9123456780' }
  ];

  // Form States
  const [receiverInput, setReceiverInput] = useState('9876543210');
  const [receiverName, setReceiverName] = useState(p.receiverName || 'Kalyan Kumar (Verified Merchant)');
  const [demoAmount, setDemoAmount] = useState('10'); // Default ₹10, user can type any amount!
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const handleSelectSample = (sample) => {
    setReceiverInput(sample.identifier);
    setReceiverName(sample.name);
  };

  // Quick Amount Helper Adders
  const handleAddAmount = (addVal) => {
    const current = Number(demoAmount) || 0;
    setDemoAmount((current + addVal).toString());
  };

  // Keypad Handlers
  const handleKeyClick = (val) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + val);
      setPinError('');
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const handleClearPin = () => {
    setEnteredPin('');
    setPinError('');
  };

  const handlePinSubmit = () => {
    if (enteredPin === '1234') {
      setStep(5); // Go to Processing loader
      setTimeout(() => {
        setStep(6); // Go to Success receipt after 1.2 seconds
      }, 1200);
    } else {
      setPinError(p.invalidPinMsg || "Incorrect Sample PIN! Please enter '1234' for this demo.");
    }
  };

  const resetFlow = () => {
    setStep(1);
    setReceiverInput('9876543210');
    setReceiverName(p.receiverName || 'Kalyan Kumar (Verified Merchant)');
    setDemoAmount('10');
    setEnteredPin('');
    setPinError('');
    setShowSafetyModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      {/* Educational Demo Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white py-2.5 px-4 shadow-md text-center text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2">
        <ShieldCheck className="w-5 h-5 shrink-0 text-sky-200" />
        <span>
          {p.demoDisclaimer || "Demo Payment — No real money transferred."}
        </span>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/safety-tools')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>{t?.toolPages?.backToHome || (language === 'te' ? "భద్రతా సాధనాలకు వెళ్లు" : "Back to Safety Tools")}</span>
          </button>

          <button
            onClick={resetFlow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 text-xs font-black border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'te' ? "డెమో రీసెట్ చేయి" : "Reset Demo"}</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-blue-700 to-sky-900 text-white rounded-[28px] shadow-2xl space-y-3 border border-blue-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 text-xs font-black uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-sky-300" />
            <span>{language === 'te' ? "యూపీఐ విద్యా సంబంధిత సిమ్యులేటర్" : "UPI Educational Simulator"}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {p.title || "Practice UPI Payment Simulator"}
          </h1>

          <p className="text-xs sm:text-base text-blue-100 font-semibold leading-relaxed">
            {p.subtitle || "Safe interactive demo environment to practice UPI payments, spot fraudulent collect requests, and test your cyber safety knowledge without real money."}
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400">
            <span className={step >= 1 ? 'text-blue-600 dark:text-sky-400' : ''}>1. {language === 'te' ? 'గ్రహీత' : 'Receiver'}</span>
            <span className={step >= 2 ? 'text-blue-600 dark:text-sky-400' : ''}>2. {language === 'te' ? 'మొత్తం' : 'Amount'}</span>
            <span className={step >= 3 ? 'text-blue-600 dark:text-sky-400' : ''}>3. {language === 'te' ? 'సమీక్ష' : 'Review'}</span>
            <span className={step >= 4 ? 'text-blue-600 dark:text-sky-400' : ''}>4. {language === 'te' ? 'డెమో పిన్' : 'Demo PIN'}</span>
            <span className={step >= 6 ? 'text-blue-600 dark:text-sky-400' : ''}>5. {language === 'te' ? 'రసీదు' : 'Receipt'}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* MAIN SIMULATOR CONTAINER */}
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          
          {/* Top UPI Header Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                BHIM
              </div>
              <span className="font-extrabold text-sm tracking-wide">UPI Suraksha Pay</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
              SAFE DEMO
            </span>
          </div>

          <div className="p-6 space-y-6">

            {/* STEP 1 — RECEIVER DETAILS */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {p.step1Title || "Receiver Details"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {p.step1Desc || "Enter or verify demo UPI ID, mobile number, or select a sample receiver"}
                  </p>
                </div>

                {/* Receiver Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {p.receiverLabel || "Receiver Mobile Number or UPI ID"}
                  </label>
                  <input
                    type="text"
                    value={receiverInput}
                    onChange={(e) => {
                      setReceiverInput(e.target.value);
                      if (e.target.value.includes('@')) {
                        setReceiverName(e.target.value.split('@')[0].toUpperCase() + ' (Merchant)');
                      } else {
                        setReceiverName('Kalyan Kumar (Verified Merchant)');
                      }
                    }}
                    placeholder={p.receiverPlaceholder || "e.g. 9876543210 or user@okaxis"}
                    className="w-full px-4 py-3.5 text-sm font-mono font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Quick Sample Receiver Chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {p.selectDemoMobileTitle || "Or Select Sample Receiver:"}
                  </label>
                  <div className="space-y-2">
                    {sampleReceivers.map((rec, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(rec)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          receiverInput === rec.identifier
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                            {rec.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{rec.name}</h4>
                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{rec.identifier}</p>
                          </div>
                        </div>
                        {receiverInput === rec.identifier && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Receiver Verified Card */}
                {receiverInput.length >= 3 && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3.5 animate-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        {p.selectDemoReceiver || "Verified Payee:"}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {receiverName}
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                        {receiverInput}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!receiverInput.trim()}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span>{p.nextAmountBtn || "Next: Enter Payment Amount"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2 — ENTER ARBITRARY AMOUNT (PRIMARY AMOUNT INPUT FIELD) */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {p.step2Title || "Enter Amount"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {p.payingTo || "Paying to:"} <span className="font-bold text-slate-900 dark:text-white">{receiverName}</span> ({receiverInput})
                  </p>
                </div>

                {/* Receiver Info Summary */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    {receiverName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{receiverName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{receiverInput}</p>
                  </div>
                </div>

                {/* PRIMARY CLEAN AMOUNT INPUT FIELD - ALLOWS ANY ARBITRARY AMOUNT (₹1, ₹10, ₹37, ₹125, ₹999, ₹1500, etc.) */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {p.enterAnyAmount || "Enter Any Amount (e.g. ₹1, ₹10, ₹37, ₹125, ₹999, ₹1,500)"}
                  </label>
                  
                  <div className="relative flex items-center justify-center">
                    <span className="text-3xl font-black text-blue-600 dark:text-sky-400 absolute left-5">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={demoAmount}
                      onChange={(e) => setDemoAmount(e.target.value)}
                      placeholder={p.amountPlaceholder || "37"}
                      className="w-full text-center text-4xl font-black py-4 pl-12 pr-6 rounded-2xl border-2 border-blue-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Optional Quick Add Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    {p.quickAddTitle || "Quick Add Chips:"}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { add: 10, label: '+₹10' },
                      { add: 50, label: '+₹50' },
                      { add: 100, label: '+₹100' },
                      { add: 500, label: '+₹500' }
                    ].map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddAmount(chip.add)}
                        className="py-2 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-600 transition-all"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Amount Confirmation Display */}
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                  <span className="text-xs font-bold text-blue-800 dark:text-sky-300 block">
                    {language === 'te' ? 'ఎంచుకున్న మొత్తం:' : 'Selected Amount:'} <span className="font-black text-blue-600 dark:text-sky-400 font-mono text-lg">₹{demoAmount || '0'}</span>
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs rounded-2xl"
                  >
                    {language === 'te' ? 'వెనుకకు' : 'Back'}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!demoAmount || Number(demoAmount) <= 0}
                    className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{p.nextReviewBtn || "Proceed to Payment Review"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — PAYMENT REVIEW */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {p.step3Title || "Review Payment"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    Please review your payment details carefully before entering PIN.
                  </p>
                </div>

                {/* UPI Confirmation Card */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                  
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      {p.payingTo || "Paying to:"}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {receiverName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      {p.mobileNum || "UPI / Mobile:"}
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {receiverInput}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      {p.totalAmount || "Total Amount:"}
                    </span>
                    <span className="text-3xl font-black text-blue-600 dark:text-sky-400 font-mono">
                      ₹{demoAmount}
                    </span>
                  </div>

                  {/* Clearly Displayed Demo Badge */}
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-center">
                    <span className="text-xs font-black text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{p.demoPaymentBadge || "Demo Payment — No real money transferred."}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="w-1/3 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs rounded-2xl"
                  >
                    {language === 'te' ? 'వెనుకకు' : 'Back'}
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{p.confirmPaymentBtn || "Proceed to Enter Demo PIN"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 — DEMO PIN SCREEN */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {p.step4Title || "Enter Demo PIN"}
                  </h2>
                  <p className="text-xs font-extrabold text-blue-600 dark:text-sky-400">
                    {p.samplePinNote || "Sample Demo PIN: 1234 (This is a simulation only)"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-center text-xs font-bold text-sky-900 dark:text-sky-200">
                  <span>{p.pinInstruction || "Enter 4-Digit Demo PIN (Sample PIN: 1234)"}</span>
                </div>

                {/* PIN Dots Display */}
                <div className="flex justify-center gap-4 py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        enteredPin.length > idx
                          ? 'bg-blue-600 border-blue-600 scale-110 shadow-md'
                          : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900'
                      }`}
                    />
                  ))}
                </div>

                {pinError && (
                  <p className="text-center text-xs font-black text-red-600 dark:text-red-400 animate-bounce">
                    {pinError}
                  </p>
                )}

                {/* Numerical Keypad */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeyClick(num.toString())}
                      className="py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:bg-blue-600 active:text-white text-slate-900 dark:text-white font-black text-lg rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm transition-all"
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={handleClearPin}
                    className="py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-xs rounded-2xl border border-slate-300 dark:border-slate-700"
                  >
                    CLEAR
                  </button>

                  <button
                    onClick={() => handleKeyClick('0')}
                    className="py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-black text-lg rounded-2xl border border-slate-200 dark:border-slate-600"
                  >
                    0
                  </button>

                  <button
                    onClick={handleBackspace}
                    className="py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center justify-center"
                  >
                    ⌫
                  </button>
                </div>

                <button
                  onClick={handlePinSubmit}
                  disabled={enteredPin.length !== 4}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <Check className="w-5 h-5" />
                  <span>{p.submitPinBtn || "Submit Demo PIN"}</span>
                </button>
              </div>
            )}

            {/* STEP 5 — PROCESSING ANIMATION */}
            {step === 5 && (
              <div className="py-12 space-y-4 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto shadow-lg animate-spin">
                  <Loader2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {p.processingTitle || "Processing Demo Payment..."}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {p.processingDesc || "Verifying demo PIN and contacting simulated bank network..."}
                </p>
              </div>
            )}

            {/* STEP 6 — SUCCESS RECEIPT SCREEN WITH CONNECTED JOURNEYS */}
            {step === 6 && (
              <div className="space-y-6 text-center animate-in zoom-in-95">
                
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-4 border-emerald-500 mx-auto flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ✓ {p.step5Title || "Payment Successful"}
                  </h2>
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-mono block mt-2">
                    ₹{demoAmount}
                  </span>
                </div>

                {/* Receipt Details Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase">{p.paidToLabel || "Paid to:"}</span>
                    <span className="font-black text-slate-900 dark:text-white">{receiverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase">{p.mobileNum || "UPI / Mobile:"}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{receiverInput}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase">{p.transactionIdLabel || "Transaction ID:"}</span>
                    <span className="font-mono font-black text-blue-600 dark:text-sky-400">DEMO-88492015</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-900 dark:text-sky-200">
                  {p.demoCompletedMsg || "Demo transaction completed successfully. No real money was transferred."}
                </div>

                {/* CONNECTED USER JOURNEY - NEXT RECOMMENDED ACTIONS */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-left space-y-3">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{p.nextActionsTitle || "Connected Next Actions:"}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => navigate('/quiz')}
                      className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-left space-y-1 transition-all group"
                    >
                      <BookOpen className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{p.takeQuizCTA || "Take Safety Quiz"}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{language === 'te' ? "మీ సర్టిఫికేట్ పొందండి" : "Earn safety badge"}</p>
                    </button>

                    <button
                      onClick={() => navigate('/ai-assistant')}
                      className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-left space-y-1 transition-all group"
                    >
                      <Bot className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{p.askAiCTA || "Try AI Scam Assistant"}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{language === 'te' ? "అనుమానాలు అడగండి" : "Analyze suspicious SMS"}</p>
                    </button>

                    <button
                      onClick={() => navigate('/report-scam')}
                      className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 text-left space-y-1 transition-all group"
                    >
                      <MessageSquareWarning className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{p.reportScamCTA || "Report Scam Number"}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{language === 'te' ? "కమ్యూనిటీని రక్షించండి" : "Protect your village"}</p>
                    </button>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 border border-slate-200 dark:border-slate-600 text-left space-y-1 transition-all group"
                    >
                      <LayoutDashboard className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{p.goDashboardCTA || "Go to Dashboard"}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{language === 'te' ? "డాష్‌బోర్డ్ చూడండి" : "View your status"}</p>
                    </button>
                  </div>
                </div>

                {/* Reset Action */}
                <div className="pt-2">
                  <button
                    onClick={resetFlow}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl transition-all shadow-lg"
                  >
                    {p.doneBtn || "Done / Practice Again"}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default PracticeUpiPage;
