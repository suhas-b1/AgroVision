import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    User,
    Globe,
    Bell,
    Thermometer,
    Shield,
    FileText,
    Info,
    Moon,
    Sun,
    Camera,
    ChevronRight,
    Lock,
    Mail,
    Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
    const { user, setUser } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'general', 'notifications', 'others'

    // Mock settings state based on image reference
    const [settings, setSettings] = useState({
        language: 'English',
        country: 'India',
        notifications: {
            cropInfo: true,
            popularPosts: true,
            answerToPost: true,
            upvoteToPost: true,
            newFollower: true,
            postFromFollow: true,
            commentFromFollow: false
        },
        weatherUnit: 'Celsius',
        analytics: true,
        crashReporting: true
    });

    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        newPassword: ''
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/user/profile', profileForm);
            setUser(response.data);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Update failed');
        }
    };

    const SectionHeader = ({ icon: Icon, title }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--primary)', fontWeight: 700 }}>
            <Icon size={20} />
            <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        </div>
    );

    const ToggleRow = ({ label, sublabel, active, onToggle }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
                <p style={{ fontWeight: 500, fontSize: '15px' }}>{label}</p>
                {sublabel && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sublabel}</p>}
            </div>
            <div
                onClick={onToggle}
                style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: active ? 'var(--primary)' : '#e2e8f0',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{
                    width: '18px',
                    height: '18px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '3px',
                    left: active ? '23px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }} />
            </div>
        </div>
    );

    const SelectRow = ({ label, value, options }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontWeight: 500, fontSize: '15px' }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '14px' }}>{value}</span>
                <ChevronRight size={16} />
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Settings ⚙️</h1>
                <p style={{ color: 'var(--text-muted)' }}>Update your preferences and manage your account.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                {/* Sidebar Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { id: 'profile', label: 'My Profile', icon: User },
                        { id: 'general', label: 'General Settings', icon: Globe },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'others', label: 'Other Settings', icon: Info },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="btn"
                            style={{
                                justifyContent: 'flex-start',
                                gap: '1rem',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text)',
                                backgroundColor: activeTab === tab.id ? 'rgba(46, 204, 113, 0.1)' : 'transparent',
                                border: 'none',
                                fontWeight: activeTab === tab.id ? 700 : 500
                            }}
                        >
                            <tab.icon size={20} /> {tab.label}
                        </button>
                    ))}

                    <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                        <ToggleRow
                            label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            active={theme === 'dark'}
                            onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="card" style={{ padding: '2rem' }}>
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <SectionHeader icon={User} title="Edit Profile" />

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <User size={50} />
                                    </div>
                                    <button style={{ position: 'absolute', bottom: 0, right: 0, padding: '8px', backgroundColor: 'var(--secondary)', color: 'white', borderRadius: '50%', border: '2px solid white' }}>
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <h3 style={{ marginTop: '1rem' }}>{user?.username}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Premium Member since 2024</p>
                            </div>

                            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name</label>
                                    <input className="input" value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address</label>
                                    <input className="input" type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                                </div>
                                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <SectionHeader icon={Lock} title="Change Password" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input className="input" type="password" placeholder="Current Password" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} />
                                        <input className="input" type="password" placeholder="New Password" value={profileForm.newPassword} onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })} />
                                    </div>
                                </div>
                                <button className="btn btn-primary" type="submit" style={{ marginTop: '1rem' }}>Save Changes</button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'general' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <SectionHeader icon={Globe} title="General" />
                            <SelectRow label="Select your Plantix language" value={settings.language} />
                            <SelectRow label="App country" value={settings.country} />

                            <div style={{ marginTop: '2rem' }}>
                                <SectionHeader icon={Thermometer} title="Weather" />
                                <SelectRow label="Weather temperature units" value={settings.weatherUnit} />
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Current is {settings.weatherUnit}</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <SectionHeader icon={Bell} title="Notifications" />
                            <ToggleRow label="Information about my crops" sublabel="Receive Push Notification" active={settings.notifications.cropInfo} onToggle={() => handleToggle('cropInfo')} />
                            <ToggleRow label="Popular Posts" sublabel="Receive Push Notification" active={settings.notifications.popularPosts} onToggle={() => handleToggle('popularPosts')} />
                            <ToggleRow label="Answer to your post" sublabel="Receive Push Notification" active={settings.notifications.answerToPost} onToggle={() => handleToggle('answerToPost')} />
                            <ToggleRow label="Upvote to your post" sublabel="Receive Push Notification" active={settings.notifications.upvoteToPost} onToggle={() => handleToggle('upvoteToPost')} />
                            <ToggleRow label="New Follower!" sublabel="Receive Push Notification" active={settings.notifications.newFollower} onToggle={() => handleToggle('newFollower')} />
                            <ToggleRow label="Post from someone you follow" sublabel="Receive Push Notification" active={settings.notifications.postFromFollow} onToggle={() => handleToggle('postFromFollow')} />
                            <ToggleRow label="Comment from someone you follow" sublabel="Receive Push Notification" active={settings.notifications.commentFromFollow} onToggle={() => handleToggle('commentFromFollow')} />
                        </motion.div>
                    )}

                    {activeTab === 'others' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <SectionHeader icon={Shield} title="Other" />
                            <ToggleRow
                                label="No Google Analytics"
                                sublabel="Deactivate the registration of anonymous data via Google Analytics"
                                active={!settings.analytics}
                                onToggle={() => setSettings({ ...settings, analytics: !settings.analytics })}
                            />
                            <ToggleRow
                                label="No Crash Reporting"
                                sublabel="Deactivate the reporting of anonymous crash reports."
                                active={!settings.crashReporting}
                                onToggle={() => setSettings({ ...settings, crashReporting: !settings.crashReporting })}
                            />

                            <div style={{ marginTop: '2rem' }}>
                                <SectionHeader icon={FileText} title="App Licenses" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                                    <p style={{ fontWeight: 500 }}>Open source licenses</p>
                                    <ChevronRight size={16} />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--surface-alt)', borderRadius: '12px' }}>
                                <SectionHeader icon={Info} title="Application" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '13px' }}>
                                    <p style={{ color: 'var(--text)' }}>Version: <b>5.1.1, 386-R PRO</b></p>
                                    <p style={{ color: 'var(--text-muted)' }}>UID: 82175b4c-e322-4077-97f0-a4dc3e6c1470</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
