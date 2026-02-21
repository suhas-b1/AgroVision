import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import api from '../services/api';
import { Map as MapIcon, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Heatmap = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const response = await api.get('/heatmap');
                setData(response.data);
            } catch (err) {
                console.error('Failed to fetch heatmap data');
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmapData();
    }, []);

    const indiaCenter = [22.9734, 78.6569];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--secondary)' }}>India Disease Heatmap</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Real-time visualization of crop disease outbreaks across the country.</p>
            </div>

            <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', minHeight: '500px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: '400px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f1f5f9' }}>
                            <p>Loading Map Data...</p>
                        </div>
                    ) : (
                        <MapContainer
                            center={indiaCenter}
                            zoom={5}
                            style={{ height: '400px', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {Object.keys(data).map((location, index) => {
                                const entry = data[location];
                                if (!entry.lat || !entry.lng) return null;

                                const isHighRisk = entry.count > 3;

                                return (
                                    <CircleMarker
                                        key={index}
                                        center={[entry.lat, entry.lng]}
                                        radius={10 + (entry.count * 2)}
                                        pathOptions={{
                                            fillColor: isHighRisk ? 'var(--danger)' : 'var(--primary)',
                                            color: isHighRisk ? 'var(--danger)' : 'var(--primary)',
                                            weight: 1,
                                            fillOpacity: 0.6
                                        }}
                                    >
                                        <Popup>
                                            <div style={{ padding: '0.5rem' }}>
                                                <h4 style={{ margin: '0 0 0.5rem', textTransform: 'capitalize' }}>{location}</h4>
                                                <p style={{ margin: '0', fontSize: '14px' }}>
                                                    <b>Total Cases:</b> {entry.count}
                                                </p>
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '12px', color: isHighRisk ? 'var(--danger)' : 'var(--primary)' }}>
                                                    {isHighRisk ? '⚠ High Alert Level' : '✓ Monitoring Stable'}
                                                </p>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                );
                            })}
                        </MapContainer>
                    )}

                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'white',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        border: '1px solid var(--border)',
                        fontSize: '11px'
                    }} className="risk-indicator">
                        <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Risk Indicator</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div>
                            <span>High Outbreak (&gt;3)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                            <span>Active Monitoring</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Info size={18} color="var(--primary)" /> Insights
                        </h3>
                        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                            Aggregated disease reports from farmers. Larger markers indicate higher concentration of outbreaks.
                        </p>
                    </div>

                    <div className="card" style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Regional Standings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {Object.keys(data).length > 0 ? (
                                Object.keys(data).sort((a, b) => data[b].count - data[a].count).slice(0, 5).map((loc, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{loc}</span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            backgroundColor: data[loc].count > 3 ? '#fee2e2' : '#dcfce7',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>{data[loc].count} cases</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                    Insufficient data to show standings.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .heatmap-grid {
                        grid-template-columns: 1fr !important;
                        height: auto !important;
                    }
                    .risk-indicator {
                        padding: 0.5rem !important;
                        font-size: 10px !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default Heatmap;
