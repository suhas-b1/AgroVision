import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
    Camera,
    Mic,
    MicOff,
    X,
    MessageCircle,
    RotateCcw,
    Zap,
    Maximize,
    Volume2,
    VolumeX,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Vision = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const recognitionRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize Camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setIsStreaming(true);
            setError('');
        } catch (err) {
            setError('Camera access denied. Please enable camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            setIsStreaming(false);
        }
        setAnalysis(null);
        window.speechSynthesis.cancel();
    };

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-IN';

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                processVoiceCommand(transcript);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => {
                if (isListening) recognition.start();
            };

            recognitionRef.current = recognition;
        }

        return () => {
            stopCamera();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            // Turning on mic stops any current AI speech immediately
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

    // Text to Speech
    const speak = (text) => {
        if (!ttsEnabled) return;
        window.speechSynthesis.cancel();
        const cleanedText = cleanTextForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(cleanedText);

        // Prioritize a high-quality melody voice (Natural, Google US, or Microsoft Zira)
        const voices = window.speechSynthesis.getVoices();
        const melodyVoice = voices.find(v =>
            v.name.includes('Natural') ||
            v.name.includes('Google US English') ||
            v.name.includes('Microsoft Zira') ||
            v.name.toLowerCase().includes('female')
        );

        if (melodyVoice) {
            utterance.voice = melodyVoice;
        }

        utterance.pitch = 1.15; // Melodic and warm
        utterance.rate = 0.9;  // Thoughtful and clear
        utterance.lang = 'en-US';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    // Process Voice Command & Capture Frame
    const processVoiceCommand = async (transcript) => {
        if (!isStreaming) return;

        setLoading(true);
        const frame = await captureFrame();
        if (!frame) {
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', frame, 'frame.jpg');

            formData.append('message', `The user says: "${transcript}". Perform a detailed botanical analysis to identify the plant, its exact species, its health status, and suggest specific expert remedies if any disease is detected.`);

            const response = await api.post('/assistant', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const reply = response.data.reply;
            setAnalysis(reply);
            speak(reply);
        } catch (err) {
            setError('Failed to analyze frame');
        } finally {
            setLoading(false);
        }
    };

    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return null;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.8);
        });
    };

    const handleManualAnalyze = () => {
        processVoiceCommand("Identify this plant and its health status with remedies.");
    };

    const handleGalleryClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('message', "I analyzed this image from my gallery. Please identify the plant and any disease present, and suggest remedies.");

            const response = await api.post('/assistant', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const reply = response.data.reply;
            setAnalysis(reply);
            speak(reply);
        } catch (err) {
            setError('Failed to analyze gallery image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', height: 'calc(100vh - 100px)', overflow: 'hidden', borderRadius: '16px', background: '#000' }}>
            {/* Camera View */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Google Lens Scan Brackets */}
            {isStreaming && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '260px',
                    height: '260px',
                    pointerEvents: 'none',
                    zIndex: 5
                }}>
                    {/* Top Left */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '4px solid rgba(255,255,255,0.8)', borderLeft: '4px solid rgba(255,255,255,0.8)', borderRadius: '12px 0 0 0' }} />
                    {/* Top Right */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '4px solid rgba(255,255,255,0.8)', borderRight: '4px solid rgba(255,255,255,0.8)', borderRadius: '0 12px 0 0' }} />
                    {/* Bottom Left */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '4px solid rgba(255,255,255,0.8)', borderLeft: '4px solid rgba(255,255,255,0.8)', borderRadius: '0 0 0 12px' }} />
                    {/* Bottom Right */}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '4px solid rgba(255,255,255,0.8)', borderRight: '4px solid rgba(255,255,255,0.8)', borderRadius: '0 0 12px 0' }} />
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'white',
                    width: '90%',
                    background: 'rgba(231, 76, 60, 0.9)',
                    padding: '2rem',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    zIndex: 100
                }}>
                    <p style={{ marginBottom: '1.5rem', fontWeight: 600 }}>{error}</p>
                    <button className="btn btn-primary" onClick={startCamera} style={{ background: '#fff', color: '#e74c3c' }}>Grant Access</button>
                </div>
            )}

            {/* Top Controls */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                <button
                    onClick={() => {
                        const newTtsEnabled = !ttsEnabled;
                        setTtsEnabled(newTtsEnabled);
                        if (!newTtsEnabled) {
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                        }
                    }}
                    style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(10px)' }}
                >
                    {ttsEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
                {isStreaming && (
                    <button
                        onClick={stopCamera}
                        style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(10px)' }}
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* AI Response Subtitles (Google Style) */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            bottom: '160px',
                            left: '10px',
                            right: '10px',
                            textAlign: 'center',
                            zIndex: 60,
                            pointerEvents: 'none'
                        }}
                    >
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(12px)',
                            padding: '1rem 1.75rem',
                            borderRadius: '16px',
                            maxWidth: '90%',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            pointerEvents: 'auto',
                            position: 'relative'
                        }}>
                            <p style={{
                                color: '#fff',
                                fontSize: '15px',
                                fontWeight: 500,
                                lineHeight: 1.5,
                                margin: 0,
                                letterSpacing: '0.3px'
                            }}>
                                {analysis}
                            </p>
                            <button
                                onClick={() => {
                                    setAnalysis(null);
                                    window.speechSynthesis.cancel();
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    background: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '26px',
                                    height: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                                    color: '#000'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Google Lens Bottom Navigation Overhaul */}
            <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '140px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                paddingBottom: '20px',
                zIndex: 50
            }}>
                {isStreaming && (
                    <>
                        {/* Main Scan Button and Gallery */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                            {/* Gallery Button */}
                            <button
                                onClick={handleGalleryClick}
                                style={{
                                    width: '54px',
                                    height: '54px',
                                    borderRadius: '16px',
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Maximize size={24} color="#fff" style={{ opacity: 0.8 }} />
                            </button>

                            {/* Center Scan Button */}
                            <button
                                onClick={handleManualAnalyze}
                                disabled={loading}
                                style={{
                                    width: '74px',
                                    height: '74px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 0 6px rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s active'
                                }}
                            >
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    border: '2px solid #000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {loading ? <RotateCcw size={32} className="animate-spin" /> : <Search size={32} color="#000" />}
                                </div>
                            </button>

                            {/* Voice/Mic Button */}
                            <button
                                onClick={toggleListening}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: isListening ? '#e74c3c' : 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                            </button>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            padding: '8px 24px',
                            borderRadius: '30px',
                            display: 'flex',
                            gap: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#fff',
                                letterSpacing: '0.5px'
                            }}>
                                AgroVision Identification
                            </span>
                        </div>
                    </>
                )}

                {!isStreaming && (
                    <button
                        onClick={startCamera}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2.5rem', borderRadius: '40px', gap: '0.75rem', fontSize: '16px', fontWeight: 600, boxShadow: '0 8px 32px rgba(46, 204, 113, 0.4)' }}
                    >
                        <Camera size={24} /> Open Camera
                    </button>
                )}
            </div>
        </div>
    );
};

export default Vision;
