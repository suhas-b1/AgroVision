import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation } from '../hooks/useLocation';
import { AlertTriangle, ShieldCheck, Zap, Info, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Alerts = () => {
    const { lat, lng } = useLocation();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (lat && lng) {
            fetchAlerts();
        } else {
            setLoading(false);
        }
    }, [lat, lng]);

    const fetchAlerts = async () => {
        try {
            const response = await api.get(`/alerts/nearby?lat=${lat}&lng=${lng}`);
            setAlerts(response.data);
        } catch (err) {
            console.error('Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Proactive Alerts 🚨</h1>
                <p style={{ color: 'var(--text-muted)' }}>Stay updated on disease outbreaks in your local area.</p>
            </div>

            {!lat && (
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#fff7ed' }}>
                    <MapPin size={48} color="#f97316" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>Location Permission Required</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Please allow location access to see outbreaks nearby.
                    </p>
                </div>
            )}

            {lat && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {alerts.length === 0 && !loading && (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <h3>All Clear!</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                No major disease outbreaks detected within 10km of your location.
                            </p>
                        </div>
                    )}

                    {alerts.map((alert, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card"
                            style={{ padding: '1.25rem', borderLeft: `5px solid ${alert.severity === 'High' ? '#ef4444' : '#f59e0b'}` }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        backgroundColor: alert.severity === 'High' ? '#fef2f2' : '#fffbeb',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <AlertTriangle size={20} color={alert.severity === 'High' ? '#ef4444' : '#f59e0b'} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '16px', marginBottom: '0.25rem' }}>{alert.disease} detected in {alert.plant}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            Reported {alert.distance} • {new Date(alert.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button className="btn" style={{ padding: '6px', backgroundColor: 'var(--bg)' }}>
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                                    <Zap size={14} /> Preventive Measures
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <Info size={14} /> Talk to Expert
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="card" style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <h4 style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Info size={18} /> How it works?
                </h4>
                <p style={{ fontSize: '13px', color: '#0c4a6e', lineHeight: 1.6 }}>
                    This system uses anonymous crowdsourced data from farmers in your region. When a disease is confirmed nearby, we notify you so you can apply preventive sprays or adjust your crop management.
                </p>
            </div>
        </div>
    );
};

export default Alerts;
