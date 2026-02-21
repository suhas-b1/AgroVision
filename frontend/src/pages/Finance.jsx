import { useState, useEffect } from 'react';
import api from '../services/api';
import { Wallet, TrendingUp, TrendingDown, Plus, Tag, DollarSign, Calendar } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Finance = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        crop: 'Banana',
        amount: '',
        entry_type: 'income',
        description: ''
    });

    useEffect(() => {
        fetchFinance();
    }, []);

    const fetchFinance = async () => {
        try {
            const response = await api.get('/finance');
            setEntries(response.data);
        } catch (err) {
            console.error('Failed to fetch finance records');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async () => {
        if (!newEntry.amount || !newEntry.crop) return;
        try {
            await api.post('/finance', newEntry);
            setNewEntry({ crop: 'Banana', amount: '', entry_type: 'income', description: '' });
            setShowForm(false);
            fetchFinance();
        } catch (err) {
            console.error('Failed to add entry');
        }
    };

    const calculateStats = () => {
        const income = entries.filter(e => e.entry_type === 'income').reduce((sum, e) => sum + e.amount, 0);
        const expense = entries.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        return { income, expense, profit: income - expense };
    };

    const stats = calculateStats();

    const chartData = {
        labels: [...new Set(entries.map(e => e.crop))],
        datasets: [
            {
                label: 'Income',
                data: [...new Set(entries.map(e => e.crop))].map(crop =>
                    entries.filter(e => e.crop === crop && e.entry_type === 'income').reduce((sum, e) => sum + e.amount, 0)
                ),
                backgroundColor: '#22c55e',
            },
            {
                label: 'Expense',
                data: [...new Set(entries.map(e => e.crop))].map(crop =>
                    entries.filter(e => e.crop === crop && e.entry_type === 'expense').reduce((sum, e) => sum + e.amount, 0)
                ),
                backgroundColor: '#ef4444',
            }
        ]
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Financial Overview 💰</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track your farm expenses and calculate total profit.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Add Entry
                </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #22c55e' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={16} color="#22c55e" /> Total Income
                    </p>
                    <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>₹{stats.income.toLocaleString()}</h2>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingDown size={16} color="#ef4444" /> Total Expense
                    </p>
                    <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>₹{stats.expense.toLocaleString()}</h2>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: stats.profit >= 0 ? '4px solid var(--primary)' : '4px solid #f97316' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wallet size={16} color="var(--primary)" /> Net Profit
                    </p>
                    <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', color: stats.profit >= 0 ? 'var(--text)' : '#ef4444' }}>
                        ₹{stats.profit.toLocaleString()}
                    </h2>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '2px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Log New Transaction</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>Crop</label>
                            <input className="input" placeholder="e.g. Banana" value={newEntry.crop} onChange={(e) => setNewEntry({ ...newEntry, crop: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>Amount (₹)</label>
                            <input className="input" type="number" placeholder="Enter amount" value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || '' })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>Transaction Type</label>
                            <select className="input" value={newEntry.entry_type} onChange={(e) => setNewEntry({ ...newEntry, entry_type: e.target.value })}>
                                <option value="income">Income (Sale)</option>
                                <option value="expense">Expense (Seed, Fertilizer, Labor)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>Description (Optional)</label>
                            <input className="input" placeholder="e.g. Sold 5 tons of Banana" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddEntry}>Save Transaction</button>
                    </div>
                </div>
            )}

            <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Analysis by Crop</h3>
                    {entries.length > 0 ? (
                        <Bar options={{ responsive: true, plugins: { legend: { position: 'top' } } }} data={chartData} />
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            No data available for analysis.
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {entries.slice(0, 5).map(entry => (
                            <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Tag size={14} color="var(--primary)" />
                                        <span style={{ fontWeight: 600 }}>{entry.crop}</span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{entry.description || entry.entry_type}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: 700, color: entry.entry_type === 'income' ? '#22c55e' : '#ef4444' }}>
                                        {entry.entry_type === 'income' ? '+' : '-'} ₹{entry.amount.toLocaleString()}
                                    </p>
                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(entry.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {entries.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No history found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
