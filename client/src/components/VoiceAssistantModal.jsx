import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Send,
  Minimize2,
  Maximize2,
  Share2,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Bot,
  AlertCircle,
  Headphones
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocationContext } from '../contexts/LocationContext';
import { startVoiceRecognition, speakText, stopSpeech, isSpeaking, isSpeechRecognitionSupported } from '../services/speech';
import api from '../services/api';
import FormattedChatMessage from './FormattedChatMessage';

const LOCALIZED_ASSISTANT_CONFIG = {
  en: {
    greeting: 'Hello! I am KisanMitra AI. You can speak or type in English — for example: "What is today\'s soybean price in Indore?", "Where should I sell my crop?", or "Tell me government schemes".',
    audioText: 'Hello! I am KisanMitra. Ask me about mandi prices, where to sell, or government schemes.',
    listening: 'Listening... Speak your question now',
    speakBtn: 'Tap & Speak (Voice)',
    listeningBtn: 'Listening... (Speak Now)',
    placeholder: 'Type your question in English or any Indian language...',
    listenAudio: 'Listen',
    stopAudio: 'Stop',
    copiedText: 'Copied to clipboard!',
    shareWhatsApp: 'Share on WhatsApp',
    clearChat: 'Clear Chat',
    tryLabel: 'Try asking:',
    suggestedPrompts: [
      "What is today's soybean price in Indore?",
      "Where should I sell wheat?",
      "Government schemes for farmers",
      "Will it rain today? Is spray safe?"
    ]
  },
  hi: {
    greeting: 'नमस्ते! मैं किसानमित्र AI हूँ। आप मुझसे अपनी भाषा में बोलकर या लिखकर पूछ सकते हैं — जैसे: "आज इंदौर में सोयाबीन का भाव क्या है?", "मेरी फसल कहाँ बेचूं?", या "सरकारी योजना बताओ"।',
    audioText: 'नमस्ते! मैं किसानमित्र हूँ। आप मुझसे मंडी भाव, फसल बिक्री और सरकारी योजनाओं के बारे में पूछ सकते हैं।',
    listening: 'सुन रहा हूँ... अपना सवाल बोलिए',
    speakBtn: 'बोलकर पूछें (Tap & Speak)',
    listeningBtn: 'सुन रहा हूँ... बोलिए',
    placeholder: 'यहाँ अपनी भाषा में सवाल लिखें...',
    listenAudio: 'सुनें',
    stopAudio: 'रोकें',
    copiedText: 'कॉपी हो गया!',
    shareWhatsApp: 'व्हाट्सएप पर शेयर करें',
    clearChat: 'नई बातचीत',
    tryLabel: 'पूछकर देखें:',
    suggestedPrompts: [
      "आज इंदौर में सोयाबीन का भाव क्या है?",
      "गेहूं कहाँ बेचूं?",
      "सरकारी योजनाएं बताएं",
      "क्या आज बारिश होगी? कीटनाशक छिड़कें?"
    ]
  },
  gu: {
    greeting: 'નમસ્તે! હું કિસાનમિત્ર AI છું. તમે તમારી ભાષામાં બોલીને કે લખીને પૂછી શકો છો — જેમ કે: "આજે રાજકોટમાં સોયાબીનનો ભાવ શું છે?", "મારો પાક ક્યાં વેચવો?", અથવા "સરકારી યોજનાઓ જણાવો".',
    audioText: 'નમસ્તે! હું કિસાનમિત્ર છું. તમે મને મંડી ભાવ અને પાક વેચાણ વિશે પૂછી શકો છો.',
    listening: 'સાંભળી રહ્યો છું... બોલો',
    speakBtn: 'બોલીને પૂછો (Tap & Speak)',
    listeningBtn: 'સાંભળી રહ્યો છું...',
    placeholder: 'અહીં તમારો પ્રશ્ન લખો...',
    listenAudio: 'સાંભળો',
    stopAudio: 'રોકો',
    copiedText: 'કોપી થયું!',
    shareWhatsApp: 'વોટ્સએપ પર શેર કરો',
    clearChat: 'નવી વાતચીત',
    tryLabel: 'પૂછી જુઓ:',
    suggestedPrompts: [
      "આજે સોયાબીનનો ભાવ શું છે?",
      "કપાસ ક્યાં વેચવો?",
      "સરકારી યોજનાઓ જણાવો"
    ]
  },
  mr: {
    greeting: 'नमस्कार! मी किसानमित्र AI आहे. आपण आपल्या भाषेत बोलून किंवा लिहून विचारू शकता — जसे: "आज नाशिकमध्ये कांद्याचा भाव काय आहे?", "माझा शेतमाल कुठे विकू?", किंवा "सरकारी योजना सांगा".',
    audioText: 'नमस्कार! मी किसानमित्र आहे. आपण मला बाजारभाव आणि शेतमाल विक्रीबद्दल विचारू शकता.',
    listening: 'ऐकत आहे... बोला',
    speakBtn: 'बोलून विचारा (Tap & Speak)',
    listeningBtn: 'ऐकत आहे... बोला',
    placeholder: 'येथे आपला शेतीविषयक प्रश्न लिहा...',
    listenAudio: 'ऐका',
    stopAudio: 'थांबवा',
    copiedText: 'कॉपी झाले!',
    shareWhatsApp: 'व्हॉट्सॲपवर शेअर करा',
    clearChat: 'नवीन संभाषण',
    tryLabel: 'विचारून पहा:',
    suggestedPrompts: [
      "आज सोयाबीनचा भाव काय आहे?",
      "गहू कुठे विकू?",
      "सरकारी योजना सांगा"
    ]
  },
  pa: {
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨਮਿੱਤਰ AI ਹਾਂ। ਤੁਸੀਂ ਆਪਣੀ ਬੋਲੀ ਵਿੱਚ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਪੁੱਛ ਸਕਦੇ ਹੋ — ਜਿਵੇਂ: "ਅੱਜ ਖੰਨਾ ਮੰਡੀ ਵਿੱਚ ਕਣਕ ਦਾ ਭਾਅ ਕੀ ਹੈ?", "ਮੈਂ ਆਪਣੀ ਫ਼ਸਲ ਕਿੱਥੇ ਵੇਚਾਂ?", ਜਾਂ "ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੱਸੋ"।',
    audioText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨਮਿੱਤਰ ਹਾਂ। ਤੁਸੀਂ ਮੇਰੇ ਤੋਂ ਮੰਡੀ ਭਾਅ ਅਤੇ ਫ਼ਸਲ ਵੇਚਣ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।',
    listening: 'ਸੁਣ ਰਿਹਾ ਹਾਂ... ਬੋਲੋ',
    speakBtn: 'ਬੋਲ ਕੇ ਪੁੱਛੋ (Tap & Speak)',
    listeningBtn: 'ਸੁਣ ਰਿਹਾ ਹਾਂ...',
    placeholder: 'ਇੱਥੇ ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ...',
    listenAudio: 'ਸੁਣੋ',
    stopAudio: 'ਰੋਕੋ',
    copiedText: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
    shareWhatsApp: 'ਵਟਸਐਪ ਤੇ ਸ਼ੇਅਰ ਕਰੋ',
    clearChat: 'ਨਵੀਂ ਗੱਲਬਾਤ',
    tryLabel: 'ਪੁੱਛ ਕੇ ਵੇਖੋ:',
    suggestedPrompts: [
      "ਅੱਜ ਕਣਕ ਦਾ ਭਾਅ ਕੀ ਹੈ?",
      "ਝੋਨਾ ਕਿੱਥੇ ਵੇਚਾਂ?",
      "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਦੱਸੋ"
    ]
  },
  bn: {
    greeting: 'নমস্কার! আমি কিষাণমিত্র AI। আপনি নিজের ভাষায় কথা বলে বা লিখে জিজ্ঞেস করতে পারেন — যেমন: "আজ সয়াবিনের দর কত?", "আমার ফসল কোথায় বিক্রি করব?", বা "সরকারি যোজনা জানান"।',
    audioText: 'নমস্কার! আমি কিষাণমিত্র। আপনি আমাকে মান্ডি দর ও ফসল বিক্রি সম্পর্কে জিজ্ঞাসা করতে পারেন।',
    listening: 'শুনছি... বলুন',
    speakBtn: 'বলে জিজ্ঞেস করুন (Tap & Speak)',
    listeningBtn: 'শুনছি... বলুন',
    placeholder: 'এখানে প্রশ্ন টাইপ করুন...',
    listenAudio: 'শুনুন',
    stopAudio: 'থামুন',
    copiedText: 'কপি করা হয়েছে!',
    shareWhatsApp: 'হোয়াটসঅ্যাপে শেয়ার করুন',
    clearChat: 'নতুন চ্যাট',
    tryLabel: 'চেষ্টা করে দেখুন:',
    suggestedPrompts: [
      "আজ সয়াবিনের দর কত?",
      "গম কোথায় বিক্রি করব?",
      "সরকারি যোজনা জানান"
    ]
  },
  ta: {
    greeting: 'வணக்கம்! நான் கிசான்மித்ரா AI. உங்கள் சொந்த மொழியில் பேசியோ அல்லது எழுதியோ கேட்கலாம் — உதாரணமாக: "இன்று சோயாபீன் விலை என்ன?", "எனது பயிரை எங்கு விற்பது?", அல்லது "அரசு திட்டங்களை கூறுங்கள்".',
    audioText: 'வணக்கம்! நான் கிசான்மித்ரா. மண்டி விலை மற்றும் பயிர் விற்பனை குறித்து என்னிடம் கேளுங்கள்.',
    listening: 'கேட்கிறேன்... பேசுங்கள்',
    speakBtn: 'பேசி கேளுங்கள் (Tap & Speak)',
    listeningBtn: 'கேட்கிறேன்...',
    placeholder: 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்க...',
    listenAudio: 'பதிலை கேளுங்கள்',
    stopAudio: 'நிறுத்துங்கள்',
    copiedText: 'நகலெடுக்கப்பட்டது!',
    shareWhatsApp: 'வாட்ஸ்அப்பில் பகிரவும்',
    clearChat: 'புதிய உரையாடல்',
    tryLabel: 'கேட்டுப்பாருங்கள்:',
    suggestedPrompts: [
      "இன்று சோயாபீன் விலை என்ன?",
      "கோதுமை எங்கு விற்பது?",
      "அரசு திட்டங்கள் கூறுங்கள்"
    ]
  },
  te: {
    greeting: 'నమస్కారం! నేను కిసాన్‌మిత్ర AI. మీరు మీ స్వంత భాషలో మాట్లాడి లేదా టైప్ చేసి అడగవచ్చు — ఉదాహరణకు: "ఈరోజు సోయాబీన్ ధర ఎంత?", "నా పంట ఎక్కడ అమ్మాలి?", లేదా "ప్రభుత్వ పథకాలు చెప్పండి".',
    audioText: 'నమస్కారం! నేను కిసాన్‌మిత్ర. మార్కెట్ ధరలు మరియు పంట విక్రయం గురించి నన్ను అడగండి.',
    listening: 'వింటున్నాను... మాట్లాడండి',
    speakBtn: 'మాట్లాడి అడగండి (Tap & Speak)',
    listeningBtn: 'వింటున్నాను...',
    placeholder: 'ఇక్కడ మీ ప్రశ్నను టైప్ చేయండి...',
    listenAudio: 'సమాధానం వినండి',
    stopAudio: 'ఆపండి',
    copiedText: 'కాపీ చేయబడింది!',
    shareWhatsApp: 'వాట్సాప్‌లో షేర్ చేయండి',
    clearChat: 'కొత్త సంభాషణ',
    tryLabel: 'అడిగి చూడండి:',
    suggestedPrompts: [
      "ఈరోజు సోయాబీన్ ధర ఎంత?",
      "గోధుమ ఎక్కడ అమ్మాలి?",
      "ప్రభుత్వ పథకాలు చెప్పండి"
    ]
  },
  kn: {
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ಕಿಸಾನ್‌ಮಿತ್ರ AI. ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಕೇಳಬಹುದು — ಉದಾಹರಣೆಗೆ: "ಇಂದು ಸೋಯಾಬೀನ್ ದರ ಎಷ್ಟು?", "ನನ್ನ ಬೆಳೆಯನ್ನು ಎಲ್ಲಿ ಮಾರಾಟ ಮಾಡಬೇಕು?", ಅಥವಾ "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಿಳಿಸಿ".',
    audioText: 'ನಮಸ್ಕಾರ! ನಾನು ಕಿಸಾನ್‌ಮಿತ್ರ. ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ಬೆಳೆ ಮಾರಾಟದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ',
    speakBtn: 'ಮಾತನಾಡಿ ಕೇಳಿ (Tap & Speak)',
    listeningBtn: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ...',
    placeholder: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...',
    listenAudio: 'ಉತ್ತರ ಆಲಿಸಿ',
    stopAudio: 'ನಿಲ್ಲಿಸಿ',
    copiedText: 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!',
    shareWhatsApp: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    clearChat: 'ಹೊಸ ಚಾಟ್',
    tryLabel: 'ಕೇಳಿ ನೋಡಿ:',
    suggestedPrompts: [
      "ಇಂದು ಸೋಯಾಬೀನ್ ದರ ಎಷ್ಟು?",
      "ಗೋಧಿ ಎಲ್ಲಿ ಮಾರಾಟ ಮಾಡಬೇಕು?",
      "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಿಳಿಸಿ"
    ]
  }
};

export default function VoiceAssistantModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();
  const { user } = useAuth();
  const { selectedState, selectedDistrict } = useLocationContext();
  const langConfig = LOCALIZED_ASSISTANT_CONFIG[currentLang] || LOCALIZED_ASSISTANT_CONFIG.en;

  // Assistant UI States
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [micError, setMicError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Persistent conversation session within browser tab
  const [conversation, setConversation] = useState(() => {
    return [
      {
        id: 'initial-greeting',
        sender: 'bot',
        text: langConfig.greeting,
        audioText: langConfig.audioText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, loading]);

  // Handle Speech Stop on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!isOpen) return null;

  // Clear Conversation history
  const handleClearChat = () => {
    stopSpeech();
    setActiveSpeakingIdx(null);
    setConversation([
      {
        id: `greeting-${Date.now()}`,
        sender: 'bot',
        text: langConfig.greeting,
        audioText: langConfig.audioText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Voice Recognition Handler
  const handleStartListening = () => {
    setMicError(null);
    stopSpeech();
    setActiveSpeakingIdx(null);

    if (!isSpeechRecognitionSupported()) {
      setMicError('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    // Check for Insecure Context (Browsers strictly block microphone on HTTP non-localhost IPs like 10.x.x.x or 192.168.x.x)
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setMicError('Browser Security Policy: Microphone is blocked on HTTP IP addresses. Please open http://localhost:5173 instead of the network IP, or enable HTTPS.');
      return;
    }

    setIsListening(true);
    setTranscript(langConfig.listening);

    startVoiceRecognition({
      language: currentLang,
      onResult: (text) => {
        setIsListening(false);
        setTranscript(text);
        sendQueryToAI(text);
      },
      onError: (err) => {
        setIsListening(false);
        setTranscript('');
        console.warn('Speech recognition warning:', err);
        if (err === 'not-allowed') {
          if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.isSecureContext) {
            setMicError('Browser blocked microphone: HTTP IP address is not a secure context. Please open http://localhost:5173 to use microphone.');
          } else {
            setMicError('Microphone permission blocked. Please click the settings icon in the address bar and allow Microphone.');
          }
        } else {
          setMicError('Could not catch your voice clearly. Please try again or type below.');
        }
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  // Submit Query to AI with Multi-turn Conversation History
  const sendQueryToAI = async (queryText) => {
    if (!queryText || queryText.trim() === '') return;
    setLoading(true);
    setMicError(null);
    stopSpeech();
    setActiveSpeakingIdx(null);

    const cleanQuery = queryText.trim();
    const userMsgId = `user-${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: cleanQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation with user query immediately
    setConversation(prev => [...prev, userMessage]);
    setInputText('');
    setTranscript('');

    const activeState = user?.state || selectedState || 'Madhya Pradesh';
    const activeDistrict = user?.district || selectedDistrict || 'Indore';

    // Prepare multi-turn history for context retention (last 6 turns)
    const historyPayload = conversation.slice(-6).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      const res = await api.post('/ai/chat', {
        query: cleanQuery,
        language: currentLang,
        history: historyPayload,
        farmerProfile: {
          name: user?.name || 'Farmer',
          role: user?.role || 'FARMER',
          state: activeState,
          district: activeDistrict,
          village: user?.village || '',
          preferredLanguage: currentLang,
          ...(user?.farmerDetails || {})
        }
      });

      if (res.data.success) {
        const botMsgIdx = conversation.length + 1;
        const botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.data.answer,
          audioText: res.data.audioText,
          suggestions: res.data.actionSuggestions,
          deepLink: res.data.deepLink,
          groundedData: res.data.groundedData,
          sourceEngine: res.data.sourceEngine,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversation(prev => [...prev, botReply]);

        // Auto-play audio response if not muted
        if (!soundMuted && res.data.audioText) {
          setActiveSpeakingIdx(botMsgIdx);
          speakText(res.data.audioText, currentLang, {
            onStart: () => setActiveSpeakingIdx(botMsgIdx),
            onEnd: () => setActiveSpeakingIdx(null),
            onError: () => setActiveSpeakingIdx(null)
          });
        }
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errorReply = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ क्षमा करें, वास्तविक डेटा प्राप्त करने में कुछ समस्या आई। कृपया पुनः प्रयास करें या सीधे मंडी ट्रैकर देखें।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  // Play / Pause TTS Audio for a specific message
  const handleToggleAudio = (msgIdx, audioText) => {
    if (activeSpeakingIdx === msgIdx) {
      stopSpeech();
      setActiveSpeakingIdx(null);
    } else {
      stopSpeech();
      setActiveSpeakingIdx(msgIdx);
      speakText(audioText, currentLang, {
        onStart: () => setActiveSpeakingIdx(msgIdx),
        onEnd: () => setActiveSpeakingIdx(null),
        onError: () => setActiveSpeakingIdx(null)
      });
    }
  };

  // Copy Message Text
  const handleCopyMessage = (idx, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (text) => {
    const cleanText = text.replace(/###\s*/g, '').replace(/\*\*/g, '');
    const shareMessage = `🌾 *KisanMitra AI Agricultural Advisory*:\n\n${cleanText}\n\n👉 Verified on KisanSetu AI Platform (https://kisansetu.gov.in)`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleDeepLinkClick = (path) => {
    if (path) {
      navigate(path);
      // Minimize on navigation so farmer sees the target page while keeping chat active
      setIsMinimized(true);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendQueryToAI(inputText);
    }
  };

  // MINIMIZED FLOATING PILL STATE
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-emerald-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white/80"
          title="Restore KisanMitra AI Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>किसानमित्र AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div className="text-[10px] text-emerald-200 font-medium">Click to resume conversation</div>
          </div>
          <Maximize2 className="w-4 h-4 text-emerald-200" />
        </button>
      </div>
    );
  }

  // DESKTOP DOCKABLE DRAWER + MOBILE BOTTOM SHEET
  return (
    <div 
      className={`fixed z-50 flex flex-col transition-all duration-300 ${
        isMaximized
          ? 'inset-2 sm:inset-6 rounded-3xl shadow-2xl bg-white border border-slate-200'
          : 'inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[460px] h-[88vh] sm:h-[650px] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl bg-white border border-slate-200/90'
      }`}
    >
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-3.5 sm:p-4 text-white rounded-t-3xl flex items-center justify-between shadow-md select-none shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner border border-white/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                KisanMitra AI Copilot
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-950/60 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Agmarknet Live
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-1.5">
              <span>किसानमित्र</span>
              <span className="text-xs font-normal text-emerald-100 opacity-90">
                • {selectedDistrict || 'Indore'}, {selectedState || 'MP'}
              </span>
            </h3>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1">
          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              if (!soundMuted) stopSpeech();
              setSoundMuted(!soundMuted);
            }}
            className={`p-2 rounded-xl transition-colors ${soundMuted ? 'text-rose-300 bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Clear History */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title={langConfig.clearChat}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => {
              stopSpeech();
              setIsMinimized(true);
            }}
            className="hidden sm:inline-flex p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize to floating pill"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          {/* Maximize / Normal Size Toggle */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="hidden sm:inline-flex p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title={isMaximized ? 'Restore Default Size' : 'Maximize Window'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Close Modal */}
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Speech Wave Indicator Banner (when TTS audio is currently speaking) */}
      {activeSpeakingIdx !== null && (
        <div className="bg-emerald-900 text-emerald-200 px-3.5 py-1.5 text-xs flex items-center justify-between border-b border-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Headphones className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span className="font-bold text-[11px]">KisanMitra is speaking in {currentLang.toUpperCase()}...</span>
            <div className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75"></span>
              <span className="w-1 h-2.5 bg-teal-300 rounded-full animate-pulse delay-150"></span>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              setActiveSpeakingIdx(null);
            }}
            className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer"
          >
            {langConfig.stopAudio}
          </button>
        </div>
      )}

      {/* Mic Error Banner */}
      {micError && (
        <div className="bg-rose-50 border-b border-rose-200 px-3.5 py-2 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{micError}</span>
          </div>
          <button 
            onClick={() => setMicError(null)} 
            className="text-rose-500 hover:text-rose-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Conversation Message Stream */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/70 to-slate-100/50"
      >
        {conversation.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold rounded-br-xs shadow-emerald-700/10'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-slate-200/50'
              }`}
            >
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <FormattedChatMessage content={msg.text} />
              )}

              {/* Action Toolbar for Bot Messages */}
              {msg.sender === 'bot' && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-slate-500">
                  <div className="flex items-center gap-2">
                    {/* Listen / Stop Audio */}
                    {msg.audioText && (
                      <button
                        onClick={() => handleToggleAudio(idx, msg.audioText)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                          activeSpeakingIdx === idx 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse' 
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                        title={activeSpeakingIdx === idx ? langConfig.stopAudio : langConfig.listenAudio}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{activeSpeakingIdx === idx ? langConfig.stopAudio : langConfig.listenAudio}</span>
                      </button>
                    )}

                    {/* Copy Response */}
                    <button
                      onClick={() => handleCopyMessage(idx, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                      title="Copy Answer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">{langConfig.copiedText}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Share on WhatsApp */}
                  <button
                    onClick={() => handleShareWhatsApp(msg.text)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    title={langConfig.shareWhatsApp}
                  >
                    <Share2 className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              )}

              {/* Interactive Platform Deep-Link Card */}
              {msg.deepLink && (
                <div className="mt-2.5 pt-2 border-t border-emerald-100">
                  <button
                    onClick={() => handleDeepLinkClick(msg.deepLink.path)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-all font-bold text-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{msg.deepLink.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Suggestions Chips */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                {msg.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => sendQueryToAI(sug)}
                    className="text-[11px] bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold px-2.5 py-1 rounded-full shadow-2xs hover:shadow-xs transition-all hover:scale-102 active:scale-95 text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-600 italic p-3 bg-white rounded-2xl border border-slate-200 w-fit shadow-xs animate-pulse">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>KisanMitra is analyzing live mandi rates, weather, and official MSP...</span>
          </div>
        )}
      </div>

      {/* Footer Controls Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col gap-2.5 shrink-0 rounded-b-3xl">
        
        {/* Live Audio Transcription preview */}
        {transcript && (
          <div className="text-xs text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center w-full truncate animate-in fade-in">
            {transcript}
          </div>
        )}

        {/* Text Input Row */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2 w-full">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={langConfig.placeholder}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white transition-all shadow-sm cursor-pointer"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Primary Voice Input Button */}
        <button
          onClick={handleStartListening}
          className={`w-full py-2.5 sm:py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-lg'
          }`}
        >
          <Mic className={`w-4 sm:w-5 h-4 sm:h-5 ${isListening ? 'animate-bounce' : ''}`} />
          <span>{isListening ? langConfig.listeningBtn : langConfig.speakBtn}</span>
        </button>

        {/* Quick Audio Prompts Chips */}
        <div className="flex flex-wrap justify-center items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
          <span className="font-bold text-slate-700">{langConfig.tryLabel}</span>
          {langConfig.suggestedPrompts.slice(0, 3).map((prompt, sIdx) => (
            <React.Fragment key={sIdx}>
              <button 
                onClick={() => sendQueryToAI(prompt)} 
                className="text-emerald-700 hover:text-emerald-900 hover:underline font-medium truncate max-w-[180px] cursor-pointer"
              >
                "{prompt}"
              </button>
              {sIdx < 2 && <span>•</span>}
            </React.Fragment>
          ))}
        </div>

      </div>

    </div>
  );
}
