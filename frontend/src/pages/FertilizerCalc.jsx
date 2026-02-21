import { useState } from 'react';
import api from '../services/api';
import { Calculator, Shovel, Droplets, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const FertilizerCalc = () => {
    const [crop, setCrop] = useState('Banana');
    const [acreage, setAcreage] = useState(1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/fertilizer-calc?crop=${crop}&acreage=${acreage}`);
            setResult(response.data);
        } catch (err) {
            console.error('Calculation failed');
        } finally {
            setLoading(false);
        }
    };

    const crops = ["Banana", "Rice", "Wheat", "Tomato", "Potato", "Maize"];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Fertilizer Calculator 🧪</h1>
                <p style={{ color: 'var(--text-muted)' }}>Calculate the exact N-P-K requirement for your plot size.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Plot Details</h3>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>Select Crop</label>
                        <select className="input" value={crop} onChange={(e) => setCrop(e.target.value)}>
                            {crops.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>Plot Size (Acres)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="btn" style={{ padding: '8px 12px' }} onClick={() => setAcreage(Math.max(0.1, acreage - 0.5))}>-</button>
                            <input type="number" className="input" style={{ textAlign: 'center' }} value={acreage} onChange={(e) => setAcreage(parseFloat(e.target.value) || 0)} />
                            <button className="btn" style={{ padding: '8px 12px' }} onClick={() => setAcreage(acreage + 0.5)}>+</button>
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCalculate} disabled={loading}>
                        {loading ? 'Calculating...' : 'Calculate Ratio'}
                    </button>
                </div>

                <div className="card" style={{ padding: '1.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                    {!result ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Calculator size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p>Enter details to see recommendations</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shovel size={20} color="var(--primary)" /> Recommendation for {crop}
                            </h3>

                            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700 }}>DAP</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{result.DAP} kg</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700 }}>MOP</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{result.MOP} kg</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '12px', color: '#f97316', fontWeight: 700 }}>UREA</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{result.Urea} kg</p>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Droplets size={16} color="var(--primary)" /> Application Timeline
                                </h4>
                                <ul style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>First Dose:</span> <b style={{ color: 'var(--text)' }}>{result.First_App}</b></li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Second Dose:</span> <b style={{ color: 'var(--text)' }}>{result.Second_App}</b></li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Third Dose:</span> <b style={{ color: 'var(--text)' }}>{result.Third_App}</b></li>
                                </ul>
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <Info size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    These are baseline values. For precise results, please conduct a soil health test annually.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FertilizerCalc;
