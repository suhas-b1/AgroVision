import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Chat from './pages/Chat';
import Heatmap from './pages/Heatmap';
import Vision from './pages/Vision';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Remaining Page placeholders
const Placeholder = ({ title }) => (
    <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)' }}>This section is currently being cultivated. Check back soon for the full feature!</p>
        <div style={{ marginTop: '2rem', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            🌱 Feature Growth in Progress
        </div>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Dashboard Layout */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/predict" element={<Predict />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/vision" element={<Vision />} />
                            <Route path="/heatmap" element={<Heatmap />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
