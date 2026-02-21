import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useLocation } from '../hooks/useLocation';
import {
    Send,
    Mic,
    MicOff,
    Image as ImageIcon,
    User,
    Bot,
    X,
    Languages,
    Loader2,
    Volume2,
    VolumeX,
    Cloud,
    Thermometer,
    Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en');
    const [attachedImage, setAttachedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [weather, setWeather] = useState(null);

    const { lat, lng, requestLocation } = useLocation();
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        requestLocation();
        const fetchHistory = async () => {
            try {
                const response = await api.get('/chat-history?limit=20');
                setMessages(response.data.map(m => ({
                    id: m.id,
                    text: m.message,
                    sender: m.role === 'user' ? 'user' : 'bot',
                    timestamp: m.created_at
                })));
            } catch (err) {
                console.error('Failed to fetch chat history');
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        if (lat && lng) {
            const fetchWeather = async () => {
                try {
                    const response = await api.get(`/weather?lat=${lat}&lng=${lng}`);
                    setWeather(response.data);
                } catch (err) {
                    console.error('Failed to fetch weather');
                }
            };
            fetchWeather();
        }
    }, [lat, lng]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-IN';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                sendMessage(transcript);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // Clean text for speech (strip markdown symbols)
    const cleanTextForSpeech = (text) => {
        return text
            .replace(/[*#_~`>]/g, '') // Remove basic markdown
            .replace(/\[.*\]\(.*\)/g, '') // Remove links
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .trim();
    };

    const speak = (text) => {
        if (!ttsEnabled) return;
        window.speechSynthesis.cancel();
        const cleanedText = cleanTextForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'en-US';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const sendMessage = async (overrideText = null) => {
        const messageText = overrideText || input;
        if (!messageText.trim() && !attachedImage) return;

        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
            timestamp: new Date().toISOString(),
            image: imagePreview
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setAttachedImage(null);
        setImagePreview(null);
        setLoading(true);

        try {
            let response;
            if (attachedImage) {
                const formData = new FormData();
                formData.append('message', messageText || 'What plant is this?');
                formData.append('file', attachedImage);
                if (lat && lng) {
                    formData.append('lat', lat);
                    formData.append('lng', lng);
                }
                response = await api.post('/assistant', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/ai-chat', {
                    message: messageText,
                    language,
                    lat,
                    lng
                });
            }

            const botMessage = {
                id: Date.now() + 1,
                text: response.data.reply,
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, botMessage]);
            speak(botMessage.text);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to my brain. Please try again later.",
                sender: 'bot',
                timestamp: new Date().toISOString(),
                error: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>AI Agri-Assistant 🤖</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Ask questions in your preferred language.</p>
                        {weather && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                                    <Thermometer size={14} /> {weather.temp}°C
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    <Cloud size={14} /> {weather.condition}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    <Wind size={14} /> {weather.wind} km/h
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn" style={{ padding: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }} onClick={() => setTtsEnabled(!ttsEnabled)}>
                        {ttsEnabled ? <Volume2 size={20} color="var(--primary)" /> : <VolumeX size={20} color="var(--text-muted)" />}
                    </button>
                </div>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {messages.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
                            <Bot size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p>Namaste! I am your AgroVision AI Assistant.</p>
                            <p style={{ fontSize: '14px' }}>How can I help you today? Try asking about pests or soil health.</p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div key={m.id} initial={{ opacity: 0, x: m.sender === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem' }}>
                                {m.sender === 'bot' && (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Bot size={18} style={{ margin: 'auto' }} />
                                    </div>
                                )}
                                <div style={{ maxWidth: '70%', width: '100%' }}>
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        borderTopRightRadius: m.sender === 'user' ? '4px' : '16px',
                                        borderTopLeftRadius: m.sender === 'bot' ? '4px' : '16px',
                                        backgroundColor: m.sender === 'user' ? 'var(--primary)' : '#f8fafc',
                                        color: m.sender === 'user' ? 'white' : '#1e293b',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        {m.image && <img src={m.image} alt="User upload" style={{ width: '100%', borderRadius: '8px', marginBottom: '0.75rem' }} />}
                                        <p style={{ fontSize: '15px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {m.sender === 'user' && (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={18} style={{ margin: 'auto' }} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={18} style={{ margin: 'auto' }} />
                            </div>
                            <div style={{ padding: '1rem', borderRadius: '16px', borderTopLeftRadius: '4px', backgroundColor: '#f1f5f9' }}>
                                <Loader2 size={18} className="animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    {imagePreview && (
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                            <img src={imagePreview} alt="Attached" style={{ height: '80px', borderRadius: '8px' }} />
                            <button onClick={() => { setAttachedImage(null); setImagePreview(null); }} style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}>
                                <X size={12} />
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                        <button className="btn" style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '12px' }} onClick={() => document.getElementById('chatImage').click()}>
                            <ImageIcon size={22} color="var(--text-muted)" />
                            <input type="file" id="chatImage" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
                        </button>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <textarea
                                className="input"
                                placeholder="Type your question..."
                                style={{ paddingRight: '3rem', resize: 'none', height: '44px', padding: '10px 15px', color: '#1e293b', backgroundColor: '#fff' }}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            />
                            <button className="btn" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '6px', backgroundColor: isListening ? 'var(--danger)' : isSpeaking ? 'var(--accent)' : 'transparent', color: isListening || isSpeaking ? 'white' : 'var(--primary)', borderRadius: '8px' }} onClick={toggleListening}>
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        </div>
                        <button className="btn btn-primary" style={{ height: '44px', width: '44px', padding: 0, borderRadius: '12px' }} onClick={() => sendMessage()} disabled={loading}>
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
