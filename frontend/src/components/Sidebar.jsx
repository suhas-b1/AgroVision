import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Sprout,
    MessageSquare,
    Eye,
    Map as MapIcon,
    UserCircle,
    HelpCircle,
    FlaskConical,
    Users,
    Banknote,
    ShoppingBag,
    Bell,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const menuItems = [
        { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { title: 'Detect Disease', path: '/predict', icon: Sprout },
        { title: 'AI Assistant', path: '/chat', icon: MessageSquare },
        { title: 'AI Vision', path: '/vision', icon: Eye },
        { title: 'Disease Map', path: '/heatmap', icon: MapIcon },
        { title: 'Settings & Profile', path: '/settings', icon: UserCircle },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998,
                    }}
                    className="hidden-desktop"
                />
            )}

            <aside
                style={{
                    width: '260px',
                    backgroundColor: 'var(--surface)',
                    borderRight: '1px solid var(--border)',
                    height: 'calc(100vh - 64px)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem 1rem',
                    position: 'fixed',
                    left: 0,
                    top: '64px',
                    zIndex: 999,
                    transition: 'transform 0.3s ease',
                }}
                className={`sidebar ${isOpen ? 'open' : ''}`}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="hidden-desktop">
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>AgroVision</span>
                    <button onClick={onClose} className="btn" style={{ padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1 }}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                marginBottom: '0.5rem',
                                color: isActive ? 'white' : 'var(--text)',
                                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                            })}
                        >
                            <item.icon size={20} />
                            {item.title}
                        </NavLink>
                    ))}
                </div>

                <div style={{
                    marginTop: 'auto',
                    padding: '1rem',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                        <HelpCircle size={18} />
                        <span>Need Help?</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Check our irrigation guides for better yield.
                    </p>
                </div>

                <style>{`
                    @media (max-width: 768px) {
                        .sidebar {
                            transform: translateX(-100%);
                            top: 0;
                            height: 100vh;
                        }
                        .sidebar.open {
                            transform: translateX(0);
                        }
                    }
                `}</style>
            </aside>
        </>
    );
};

export default Sidebar;
