import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Lock, User, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Auth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please fill in both fields.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
                onLoginSuccess(res.data.access_token);
            } else {
                await axios.post(`${API_BASE}/auth/register`, { username, password });
                // Auto login after register
                const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
                onLoginSuccess(res.data.access_token);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh'
        }}>
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-primary)', padding: '15px', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <Activity size={32} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isLogin ? 'Authenticate to access your inventory models.' : 'Sign up to build your optimized forecasting engines.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Username</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                            <User size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', fontFamily: 'var(--font-body)' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Password</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', fontFamily: 'var(--font-body)' }}
                            />
                        </div>
                    </div>

                    {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary hover-scale"
                        disabled={loading}
                        style={{ padding: '1rem', display: 'flex', justifyContent: 'center', marginTop: '0.5rem', borderRadius: '12px' }}
                    >
                        {loading ? <div className="loader"></div> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); setUsername(''); setPassword(''); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        className="hover-scale"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'} <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
