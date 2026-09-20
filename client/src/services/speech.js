/**
 * Voice-First Speech Recognition and Speech Synthesis Abstraction for fasalniti AI
 */

const LANG_CODE_MAP = {
  hi: 'hi-IN',
  en: 'en-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN'
};

// Check if browser supports Web Speech API
export const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Start listening
export const startVoiceRecognition = ({
  language = 'hi',
  onResult,
  onError,
  onEnd
}) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = LANG_CODE_MAP[language] || 'hi-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    if (onError) onError(err.message);
    return null;
  }
};

// Text to Speech playback
export const isSpeaking = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
};

export const speakText = (text, language = 'hi', callbacks = {}) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel(); // Stop ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_CODE_MAP[language] || 'hi-IN';
  utterance.rate = 0.95; // Slightly slower, clear cadence for rural farmers
  utterance.pitch = 1.0;

  if (callbacks.onStart) utterance.onstart = callbacks.onStart;
  if (callbacks.onEnd) utterance.onend = callbacks.onEnd;
  if (callbacks.onError) utterance.onerror = callbacks.onError;

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech playback error:', err);
    if (callbacks.onError) callbacks.onError(err);
  }

  return utterance;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
