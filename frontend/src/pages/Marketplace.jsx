import { useState } from 'react';
import { ShoppingBag, MapPin, Store, Star, BadgeCheck, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Marketplace = () => {
    const [view, setView] = useState('products'); // 'products' or 'shops'

    const products = [
        { id: 1, name: 'VNR Seed (Cucumber)', price: '₹450', img: 'https://placehold.co/200x200?text=VNR+Seed', category: 'Seeds' },
        { id: 2, name: 'Urea 46% N', price: '₹266', img: 'https://placehold.co/200x200?text=Urea', category: 'Fertilizer' },
        { id: 3, name: 'Bayer FAME', price: '₹1,200', img: 'https://placehold.co/200x200?text=FAME', category: 'Pesticide' },
        { id: 4, name: 'Potassium Chloride', price: '₹850', img: 'https://placehold.co/200x200?text=Potash', category: 'Fertilizer' },
    ];

    const shops = [
        { id: 1, name: 'Patel Krishi Seva Kendra', distance: '9 km away', verified: true, rating: 4.8, img: 'https://placehold.co/100x100?text=Shop+1' },
        { id: 2, name: 'Sai Ram Agri Center', distance: '13 km away', verified: true, rating: 4.5, img: 'https://placehold.co/100x100?text=Shop+2' },
        { id: 3, name: 'Kumar Agri Shop', distance: '19 km away', verified: true, rating: 4.2, img: 'https://placehold.co/100x100?text=Shop+3' },
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Krishi Marketplace 🛒</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Buy quality seeds, fertilizers and find verified shops nearby.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setView('products')}
                    className={`btn ${view === 'products' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <ShoppingBag size={20} /> Browse Products
                </button>
                <button
                    onClick={() => setView('shops')}
                    className={`btn ${view === 'shops' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <Store size={20} /> Agri-Shops Nearby
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={20} />
                    <input className="input" placeholder="Search for products or shops..." style={{ paddingLeft: '40px' }} />
                </div>
                <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={20} /> Filter
                </button>
            </div>

            {view === 'products' ? (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {products.map(product => (
                        <motion.div key={product.id} whileHover={{ y: -5 }} className="card" style={{ padding: '1rem', overflow: 'hidden' }}>
                            <img src={product.img} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
                            <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{product.category}</p>
                            <h3 style={{ fontSize: '15px', marginBottom: '0.5rem' }}>{product.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{product.price}</span>
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>View</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={20} color="var(--primary)" /> Shops in your area
                    </h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {shops.map(shop => (
                            <motion.div key={shop.id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                <img src={shop.img} alt={shop.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <h4 style={{ fontSize: '15px' }}>{shop.name}</h4>
                                        {shop.verified && <BadgeCheck size={16} color="#3b82f6" />}
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{shop.distance}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '12px', color: '#f59e0b' }}>
                                        <Star size={14} fill="#f59e0b" /> {shop.rating} Rated
                                    </div>
                                </div>
                                <button className="btn" style={{ padding: '8px', fontSize: '11px', backgroundColor: 'var(--bg)' }}>Call</button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
