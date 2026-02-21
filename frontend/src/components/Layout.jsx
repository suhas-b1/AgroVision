import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar onMenuClick={toggleSidebar} />
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
                <main style={{
                    flex: 1,
                    // Remove fixed margin on mobile, use CSS for responsiveness
                    padding: '1.5rem',
                    backgroundColor: 'var(--bg)',
                    minHeight: 'calc(100vh - 64px)',
                    transition: 'margin-left 0.3s ease',
                }} className="main-content">
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <style>{`
                @media (min-width: 769px) {
                    .main-content {
                        margin-left: 260px;
                    }
                }
                @media (max-width: 768px) {
                    .main-content {
                        margin-left: 0;
                        padding: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
