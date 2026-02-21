import { useState } from 'react';
import api from '../services/api';
import {
    Upload,
    Image as ImageIcon,
    Search,
    Sprout,
    AlertTriangle,
    ShieldCheck,
    Info,
    MapPin,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Predict = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please upload an image first.');

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/predict?location=${encodeURIComponent(location || 'Unknown')}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.error) {
                setError(response.data.error);
            } else {
                setResult(response.data);
            }
        } catch (err) {
            setError('Could not connect to the backend. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError('');
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--secondary)' }}>Detect Plant Disease</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Upload a photo of the affected leaf for instant AI analysis.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Upload Section */}
                {!result && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card"
                    >
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                                    <MapPin size={18} color="var(--primary)" /> Your Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ballari, Karnataka"
                                    className="input"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Upload Leaf Image</label>
                                <div
                                    style={{
                                        border: '2px dashed var(--border)',
                                        borderRadius: '12px',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        backgroundColor: preview ? 'transparent' : '#f8fafc',
                                        overflow: 'hidden',
                                        height: '240px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    {preview ? (
                                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '50%',
                                                backgroundColor: '#e8f5e9',
                                                color: 'var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '1rem'
                                            }}>
                                                <Upload size={28} />
                                            </div>
                                            <p style={{ fontWeight: 600, color: 'var(--secondary)' }}>Click to upload or drag and drop</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PNG, JPG or JPEG up to 10MB</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        id="fileInput"
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={16} /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                            <RefreshCw size={18} />
                                        </motion.div>
                                        Analyzing Leaf...
                                    </>
                                ) : (
                                    <>
                                        Run AI Diagnosis <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <img src={preview} alt="Result" style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover' }} />
                                </div>

                                <div className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Diagnosis Result</h2>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            backgroundColor: result.disease.toLowerCase() === 'healthy' ? '#dcfce7' : '#fee2e2',
                                            color: result.disease.toLowerCase() === 'healthy' ? 'var(--primary-dark)' : 'var(--danger)',
                                            fontSize: '14px',
                                            fontWeight: 700
                                        }}>
                                            {result.severity} Severity
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ color: 'var(--primary)' }}><Sprout size={24} /></div>
                                            <div>
                                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Detected Plant</p>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{result.plant} ({result.plant_confidence}%)</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
                                            <div>
                                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Condition</p>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{result.disease} ({result.confidence}%)</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ color: 'var(--accent)' }}><Info size={24} /></div>
                                            <div>
                                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Advisory</p>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--secondary)' }}>{result.advice}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={reset}
                                        className="btn"
                                        style={{ marginTop: '2rem', border: '1px solid var(--border)', width: '100%' }}
                                    >
                                        Start New Scan <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="card"
                                style={{ borderLeft: '6px solid var(--primary)' }}
                            >
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    AI Deep Insights 🤖
                                </h3>
                                <p style={{ lineHeight: 1.7, color: 'var(--secondary)' }}>
                                    {result.ai_explanation}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Predict;
