import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const PortfolioOverview = ({ onSelectSku }) => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await axios.get(`${API_BASE}/portfolio`);
                setPortfolio(res.data.portfolio);
            } catch (err) {
                setError('Failed to load portfolio overview.');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ padding: '2rem' }}>
                <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '20px' }}></div>
                <div className="glass" style={{ height: '400px', width: '100%' }}></div>
            </div>
        );
    }

    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={24} /> Multi-SKU Control Tower
            </h2>

            <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>SKU</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>ABC Class</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Total Sales Vol.</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Current Stock</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.map((item, idx) => (
                            <tr key={idx} className="hover-scale-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.sku}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                                        background: item.abc_class === 'A' ? 'rgba(0,0,0,0.8)' : item.abc_class === 'B' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                                        color: item.abc_class === 'A' ? 'white' : 'var(--text-main)'
                                    }}>
                                        Class {item.abc_class}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{item.total_sales.toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>{item.current_stock.toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    {item.status === 'Stockout' && <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}><AlertCircle size={16} /> Stockout</span>}
                                    {item.status === 'Low Stock' && <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}><AlertCircle size={16} /> Low Stock</span>}
                                    {item.status === 'Healthy' && <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={16} /> Healthy</span>}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button className="btn btn-outline hover-scale" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => onSelectSku(item.sku)}>
                                        Analyze <TrendingUp size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PortfolioOverview;
