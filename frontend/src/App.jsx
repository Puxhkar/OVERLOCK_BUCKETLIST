import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Package, Activity, LogOut, History as HistoryIcon, LayoutDashboard, Search, Bell, User, UploadCloud, Asterisk, Home, Shirt, ShoppingCart, Truck, Users, Settings } from 'lucide-react';

import LandingPage from './components/LandingPage';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import History from './components/History';

import { API_BASE } from './config';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState('');

  const [isUploaded, setIsUploaded] = useState(false);
  const [skus, setSkus] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');

  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [recommendData, setRecommendData] = useState(null);

  const [currentView, setCurrentView] = useState('landing');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUsername('');
    setIsUploaded(false);
    setSkus([]);
    setSelectedSku('');
    setForecastData(null);
    setCurrentView('landing');
  }, []);

  const fetchUserStatus = useCallback(async (jwtToken) => {
    try {
      const res = await axios.get(`${API_BASE}/user/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setUsername(res.data.username);

      if (res.data.has_data) {
        setIsUploaded(true);
        setSkus(res.data.skus);
        if (res.data.skus.length > 0) {
          setSelectedSku(res.data.skus[0]);
        }
        setCurrentView('dashboard');
      } else {
        setIsUploaded(false);
        setCurrentView('upload');
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  }, [setUsername, setIsUploaded, setSkus, setSelectedSku, setCurrentView, handleLogout]);

  useEffect(() => {
    if (token) {
      fetchUserStatus(token);
    } else {
      setCurrentView('landing');
    }
  }, [token, fetchUserStatus]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleUploadSuccess = (data) => {
    setIsUploaded(true);
    setSkus(data.skus);
    if (data.skus.length > 0) {
      setSelectedSku(data.skus[0]);
    }
    setCurrentView('dashboard');
  };

  const handleHistorySelect = (sku) => {
    setSelectedSku(sku);
    setCurrentView('dashboard');
  };

  const fetchSkuData = useCallback(async (sku) => {
    if (!token) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const forecastRes = await axios.get(`${API_BASE}/forecast?sku=${sku}&days=30`, { headers });
      setForecastData(forecastRes.data);

      const recommendRes = await axios.get(`${API_BASE}/recommend?sku=${sku}&lead_time=7`, { headers });
      setRecommendData(recommendRes.data);

      const insightsRes = await axios.get(`${API_BASE}/insights?sku=${sku}`, { headers });
      setInsightsData(insightsRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        console.error('API Error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, setForecastData, setRecommendData, setInsightsData, handleLogout]);

  useEffect(() => {
    if (selectedSku && token && currentView === 'dashboard') {
      fetchSkuData(selectedSku);
    }
  }, [selectedSku, currentView, token, fetchSkuData]);

  if (!token || currentView === 'landing') {
    return (
      <div className="app-container" style={{ display: 'block' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border-subtle)', background: 'white' }}>
          <div className="logo hover-scale" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.2rem' }} onClick={() => setCurrentView('landing')}>
            <div style={{ background: '#181C32', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Asterisk size={22} color="white" />
            </div>
            <span style={{ color: 'var(--text-main)' }}>SmartStock AI</span>
          </div>

          {currentView === 'landing' && (
            <div style={{ display: 'none' }} className="landing-desktop-nav"></div> /* Optional: We can just use an inline flex if we want it always visible */
          )}
          {currentView === 'landing' && (
            <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'} onClick={() => document.getElementById('whyus')?.scrollIntoView({ behavior: 'smooth' })}>Why Use This</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'} onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}>Reviews</span>
            </div>
          )}

          {currentView === 'landing' ? (
            token ? (
              <button className="btn btn-primary hover-scale" onClick={() => setCurrentView('dashboard')}>Go to Dashboard</button>
            ) : (
              <button className="btn btn-primary hover-scale" onClick={() => setCurrentView('auth')}>Sign In</button>
            )
          ) : (
            <button className="btn btn-outline hover-scale" onClick={() => setCurrentView('landing')}>Back to Home</button>
          )}
        </nav>
        <main>
          {currentView === 'landing' && <LandingPage onGetStarted={() => token ? setCurrentView('dashboard') : setCurrentView('auth')} />}
          {currentView === 'auth' && <Auth onLoginSuccess={handleLoginSuccess} />}
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="top-navbar animate-fade-in">
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
          <div className="hover-scale" style={{ background: '#11111A', border: '1px solid rgba(255,255,255,0.05)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} onClick={() => setCurrentView('landing')}>
            <Asterisk size={20} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.2rem', letterSpacing: '0.5px' }}>SmartStock AI</span>
        </div>

        {/* Center Nav Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className={`navbar-icon ${currentView === 'landing' ? 'active' : ''}`} title="Home" onClick={() => setCurrentView('landing')}>
            <Home size={20} />
          </div>
          <div className={`navbar-icon ${currentView === 'dashboard' ? 'active' : ''}`} title="Overview" onClick={() => setCurrentView('dashboard')}>
            <LayoutDashboard size={20} />
          </div>
          <div className={`navbar-icon ${currentView === 'upload' ? 'active' : ''}`} title="Import Inventory" onClick={() => setCurrentView('upload')}>
            <UploadCloud size={20} />
          </div>
          <div className="navbar-icon" title="Apparel Catalogue (Demo)" style={{ cursor: 'not-allowed', opacity: 0.4 }}>
            <Shirt size={20} />
          </div>
          <div className="navbar-icon" title="Orders (Demo)" style={{ cursor: 'not-allowed', opacity: 0.4 }}>
            <ShoppingCart size={20} />
          </div>
          <div className="navbar-icon" title="Logistics (Demo)" style={{ cursor: 'not-allowed', opacity: 0.4 }}>
            <Truck size={20} />
          </div>
          <div className={`navbar-icon ${currentView === 'history' ? 'active' : ''}`} title="Search History" onClick={() => setCurrentView('history')}>
            <HistoryIcon size={20} />
          </div>
          <div className="navbar-icon" title="Customers (Demo)" style={{ cursor: 'not-allowed', opacity: 0.4 }}>
            <Users size={20} />
          </div>
        </div>

        {/* Right Side Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="navbar-icon" title="Settings" style={{ cursor: 'not-allowed', opacity: 0.4 }}>
            <Settings size={20} />
          </div>
          <div className="navbar-icon" title="Sign Out" onClick={handleLogout} style={{ color: '#EF4444' }}>
            <LogOut size={20} />
          </div>
        </div>
      </nav>

      {/* Main Area */}
      <div className="main-content">
        <header className="top-bar animate-fade-in">
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>{currentView === 'history' ? 'History' : currentView === 'upload' ? 'Import Data' : 'Overview'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Detailed supply chain information</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentView === 'dashboard' && isUploaded && skus.length > 0 && (
              <div className="glass-panel" style={{ padding: '0.4rem 1rem', display: 'flex', gap: '8px', alignItems: 'center', background: 'white' }}>
                <Package size={16} color="var(--text-muted)" />
                <select
                  className="input-field"
                  style={{ fontSize: '0.85rem', padding: '0', border: 'none' }}
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {skus.map(sku => (
                    <option key={sku} value={sku}>{sku}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '1rem' }}>
              {/* Actual Search Bar for header */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search..." className="hover-scale" style={{ background: 'white', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '0.6rem 1rem 0.6rem 2.2rem', color: 'var(--text-main)', fontSize: '0.85rem', width: '220px', outline: 'none' }} />
              </div>

              <button className="btn-ghost hover-scale" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'white', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={18} /></button>
              <div className="hover-scale" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="animate-fade-in">
          {currentView === 'history' && <History token={token} onSelect={handleHistorySelect} />}
          {currentView === 'upload' && <UploadSection onUploadSuccess={handleUploadSuccess} token={token} />}
          {currentView === 'dashboard' && (
            !isUploaded ? (
              <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <Package size={48} color="var(--border-subtle)" style={{ marginBottom: '1rem' }} />
                <h3>No Data Available</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Please import a CSV to view your analytics dashboard.</p>
                <button className="btn btn-primary" onClick={() => setCurrentView('upload')}>Go to Import</button>
              </div>
            ) : (
              <Dashboard
                loading={loading}
                forecastData={forecastData}
                insightsData={insightsData}
                recommendData={recommendData}
              />
            )
          )}
          {currentView === 'auth' && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <h3>Authenticating...</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
