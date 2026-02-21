import { useAuth } from '../context/AuthContext';
import {
    User,
    Mail,
    Calendar,
    MapPin,
    Settings,
    Award,
    History,
    Shield,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user } = useAuth();

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
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--secondary)' }}>Farmer Profile</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your account settings and view your farming milestones.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Left Column: Avatar & Basic Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div variants={item} className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 8px 16px rgba(46, 204, 113, 0.2)',
                            fontSize: '3rem',
                            fontWeight: 700
                        }}>
                            {user?.username?.[0]?.toUpperCase() || 'F'}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user?.username}</h2>
                        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginBottom: '1.5rem' }}>Level 5 Agri-Pro</p>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f1f5f9' }} title="Pest Specialist">
                                <Award size={20} color="var(--primary)" />
                            </div>
                            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f1f5f9' }} title="Consistent Scanner">
                                <Award size={20} color="var(--accent)" />
                            </div>
                            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f1f5f9' }} title="Early Adopter">
                                <Award size={20} color="#3b82f6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Settings size={18} /> Quick Settings
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn" style={{ justifyContent: 'space-between', border: '1px solid var(--border)', fontSize: '14px' }}>
                                Notification Preferences <ChevronRight size={16} />
                            </button>
                            <button className="btn" style={{ justifyContent: 'space-between', border: '1px solid var(--border)', fontSize: '14px' }}>
                                Privacy \u0026 Security <ChevronRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Detailed Stats \u0026 Preferences */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div variants={item} className="card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '2rem' }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#f8fafc', color: 'var(--text-muted)' }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Full Name</p>
                                    <p style={{ fontWeight: 600 }}>{user?.username}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#f8fafc', color: 'var(--text-muted)' }}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Email Address</p>
                                    <p style={{ fontWeight: 600 }}>{user?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#f8fafc', color: 'var(--text-muted)' }}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Primary Farm</p>
                                    <p style={{ fontWeight: 600 }}>Karnataka, IN</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#f8fafc', color: 'var(--text-muted)' }}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Member Since</p>
                                    <p style={{ fontWeight: 600 }}>Feb 2026</p>
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ marginTop: '2.5rem', width: '200px' }}>
                            Edit Profile
                        </button>
                    </motion.div>

                    <motion.div variants={item} className="card" style={{ backgroundColor: '#f8fafc', border: '1px dashed var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <History size={20} color="var(--primary)" /> Scanning Milestones
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Updated 2h ago</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Expert Diagnostician</span>
                                    <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 700 }}>80%</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '80%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    You've successfully diagnosed 40/50 plant conditions.
                                </p>
                            </div>

                            <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'linear-gradient(90deg, #334155 0%, #1e293b 100%)', color: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <Shield size={20} color="var(--accent)" />
                                    <span style={{ fontWeight: 700 }}>Secure Data Access</span>
                                </div>
                                <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '1.25rem' }}>
                                    Your farm data is encrypted and used only to improve our disease models.
                                </p>
                                <a href="#" style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    Privacy Policy <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
