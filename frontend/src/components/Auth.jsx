import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Lock, User, ChevronRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';


const API_BASE = 'http://127.0.0.1:8000';
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_STUB.apps.googleusercontent.com";


const Auth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMockModal, setShowMockModal] = useState(false);
    const [mockEmail, setMockEmail] = useState('');


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

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE}/auth/google`, {
                credential: response.credential
            });
            onLoginSuccess(res.data.access_token);
        } catch (err) {
            setError(err.response?.data?.detail || 'Google Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Login was unsuccessful. Try again.');
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

                {/* Mock Google Modal */}
                {showMockModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="glass" style={{ background: 'white', padding: '2rem', width: '100%', maxWidth: '350px', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <svg width="24" height="24" viewBox="0 0 18 18" style={{ marginBottom: '10px' }}>
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288C4.672 5.161 6.656 3.58 9 3.58z" fill="#EA4335"/>
                                </svg>
                                <h3 style={{ margin: 0 }}>Sign in with Google</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose an email to continue to SmartStock AI</p>
                            </div>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={mockEmail}
                                onChange={(e) => setMockEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowMockModal(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                                    if (mockEmail) {
                                        handleGoogleSuccess({ credential: `dummy_token_${mockEmail}` });
                                        setShowMockModal(false);
                                    }
                                }}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}


                <form onSubmit={handleSubmit} className="glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--accent-primary)', textAlign: 'center' }}>
                        <strong>Demo:</strong> Link with <u>admin</u> / <u>password123</u>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Username</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                            <User size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g. janesmith"
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                        OR
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        {GOOGLE_CLIENT_ID.includes('STUB') ? (
                            <button
                                type="button"
                                onClick={() => setShowMockModal(true)}
                                className="hover-scale"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: 'white',
                                    border: '1px solid var(--border-subtle)',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '24px',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288C4.672 5.161 6.656 3.58 9 3.58z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                        ) : (
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess} 
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="continue_with"
                                shape="circle"
                            />
                        )}
                    </div>



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
