import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    BarChart3,
    Sprout,
    MessageSquare,
    Map as MapIcon,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    Clock,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        healthy: 0,
        diseased: 0,
        recentPredictions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/my-predictions?limit=5');
                const predictions = response.data;

                // In a real app, the backend would provide these stats. 
                // For now, we calculate them from the fetched history.
                const total = predictions.length;
                const healthy = predictions.filter(p => p.disease.toLowerCase() === 'healthy').length;

                setStats({
                    total: total > 0 ? total : 0,
                    healthy: healthy,
                    diseased: total - healthy,
                    recentPredictions: predictions
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--secondary)' }}>
                    Welcome back, {user?.username}! 🧑‍🌾
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Here's what's happening on your farm today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }} className="stats-grid">
                {[
                    { title: 'Total Scans', value: stats.total, icon: BarChart3, color: '#3b82f6' },
                    { title: 'Healthy Crops', value: stats.healthy, icon: ShieldCheck, color: 'var(--primary)' },
                    { title: 'Diseased Detected', value: stats.diseased, icon: AlertTriangle, color: 'var(--danger)' },
                    { title: 'Success Rate', value: stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) + '%' : '100%', icon: TrendingUp, color: 'var(--accent)' },
                ].map((stat, index) => (
                    <motion.div key={index} variants={item} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: `${stat.color}15`,
                            color: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.title}</p>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Recent Activity */}
                <motion.div variants={item} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} color="var(--primary)" /> Recent Activity
                        </h3>
                        <Link to="/my-predictions" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>View All</Link>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading records...</p>
                    ) : stats.recentPredictions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.recentPredictions.map((record) => (
                                <div key={record.id} className="activity-item" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--surface-alt)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: record.disease.toLowerCase() === 'healthy' ? '#dcfce7' : '#fee2e2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: record.disease.toLowerCase() === 'healthy' ? 'var(--primary)' : 'var(--danger)',
                                            flexShrink: 0
                                        }}>
                                            <Sprout size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{record.plant} — {record.disease}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(record.created_at).toLocaleDateString()} • {record.location}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }} className="hidden-mobile">
                                        <p style={{ fontWeight: 600, color: record.disease.toLowerCase() === 'healthy' ? 'var(--primary)' : 'var(--danger)', fontSize: '14px' }}>
                                            {record.confidence}%
                                        </p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confidence</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <Sprout size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No scans yet. Start by checking your first crop!</p>
                            <Link to="/predict" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Scan Now</Link>
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ backgroundColor: 'var(--secondary)', color: 'white' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>AI Advisor 🤖</h3>
                        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '1.25rem' }}>
                            Ask anything about soil health or pest control.
                        </p>
                        <Link to="/chat" className="btn" style={{ backgroundColor: 'white', color: 'var(--secondary)', width: '100%' }}>
                            Start Chat <MessageSquare size={18} />
                        </Link>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Community Insight</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <MapIcon size={24} color="var(--primary)" />
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>Regional Alert</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Late Blight spread detected nearby.</p>
                                </div>
                            </div>
                            <Link to="/heatmap" className="btn" style={{ border: '1px solid var(--border)', width: '100%', fontSize: '14px' }}>
                                View Heatmap <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .main-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default Dashboard;
