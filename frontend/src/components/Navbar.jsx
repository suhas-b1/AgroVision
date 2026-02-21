import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Bell, Search, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            height: '64px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onMenuClick}
                    className="btn hidden-desktop"
                    style={{
                        padding: '8px',
                        color: 'var(--text)',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Menu size={24} color="var(--text)" />
                </button>
                <div style={{ position: 'relative' }} className="search-container">
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input"
                        style={{ paddingLeft: '2.5rem', width: '200px', height: '36px', fontSize: '14px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn hidden-mobile" style={{ padding: '8px', color: 'var(--text-muted)' }}>
                    <Bell size={20} />
                </button>

                <div
                    onClick={() => navigate('/settings')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}
                >
                    <div style={{ textAlign: 'right' }} className="hidden-mobile">
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{user?.username || 'Farmer'}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Farmer Pro</p>
                    </div>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <UserIcon size={18} />
                    </div>
                </div>
                <button onClick={handleLogout} className="btn" style={{ padding: '8px', color: 'var(--danger)' }} title="Logout">
                    <LogOut size={20} />
                </button>
            </div>

            <style>{`
                @media (max-width: 480px) {
                    .search-container {
                        display: none;
                    }
                }
                @media (min-width: 769px) {
                    .search-container input {
                        width: 300px !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
