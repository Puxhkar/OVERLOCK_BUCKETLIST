import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Clock, Package, Activity } from 'lucide-react';

import { API_BASE } from '../config';

const History = ({ token, onSelect }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (err) {
                console.error('Failed to fetch history:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchHistory();
    }, [token]);

    if (loading) return <div className="loader" style={{ margin: '4rem auto' }}></div>;

    return (
        <div className="animate-fade-in glass" style={{ padding: '3rem', maxWidth: '800px', margin: '2rem auto', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                    <HistoryIcon size={28} />
                </div>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Forecast History</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Review your past forecasting actions and queries on this dataset.</p>
                </div>
            </div>

            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                    <Activity size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No history found. Run a forecast to populate this view.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((record, idx) => (
                        <div key={idx} className="glass-panel hover-scale" onClick={() => onSelect(record.sku)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', background: 'var(--bg-dark)', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Package size={20} color="var(--accent-primary)" />
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{record.sku}</span>
                                <span style={{ fontSize: '0.85rem', background: 'white', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                                    {record.action}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Clock size={16} />
                                {new Date(record.timestamp + 'Z').toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
