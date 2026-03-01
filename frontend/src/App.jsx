import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Package, Activity, History as HistoryIcon, LayoutDashboard, Search, Bell, UploadCloud, Asterisk, Home, Shirt, ShoppingCart, Truck, Users, Settings } from 'lucide-react';

import LandingPage from './components/LandingPage';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import History from './components/History';

import { API_BASE } from './config';

function App() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [skus, setSkus] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');

  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [recommendData, setRecommendData] = useState(null);

  const [currentView, setCurrentView] = useState('landing');

  const fetchUserStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/me`);
      if (res.data.has_data) {
        setIsUploaded(true);
        setSkus(res.data.skus);
        if (res.data.skus.length > 0) {
          setSelectedSku(res.data.skus[0]);
        }
      } else {
        setIsUploaded(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

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
    setLoading(true);
    try {
      const forecastRes = await axios.get(`${API_BASE}/forecast?sku=${sku}&days=30`);
      setForecastData(forecastRes.data);

      const recommendRes = await axios.get(`${API_BASE}/recommend?sku=${sku}&lead_time=7`);
      setRecommendData(recommendRes.data);

      const insightsRes = await axios.get(`${API_BASE}/insights?sku=${sku}`);
      setInsightsData(insightsRes.data);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSku && currentView === 'dashboard') {
      fetchSkuData(selectedSku);
    }
  }, [selectedSku, currentView, fetchSkuData]);

  if (currentView === 'landing') {
    return (
      <div className="app-container" style={{ display: 'block' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border-subtle)', background: 'white' }}>
          <div className="logo hover-scale" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.2rem' }} onClick={() => setCurrentView('landing')}>
            <div style={{ background: '#181C32', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Asterisk size={22} color="white" />
            </div>
            <span style={{ color: 'var(--text-main)' }}>SmartStock AI</span>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'} onClick={() => document.getElementById('whyus')?.scrollIntoView({ behavior: 'smooth' })}>Why Use This</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'} onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}>Reviews</span>
          </div>

          <button className="btn btn-primary hover-scale" onClick={() => setCurrentView(isUploaded ? 'dashboard' : 'upload')}>
            {isUploaded ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </nav>
        <main>
          <LandingPage onGetStarted={() => setCurrentView(isUploaded ? 'dashboard' : 'upload')} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="top-navbar animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
          <div className="hover-scale" style={{ background: '#11111A', border: '1px solid rgba(255,255,255,0.05)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} onClick={() => setCurrentView('landing')}>
            <Asterisk size={20} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.2rem', letterSpacing: '0.5px' }}>SmartStock AI</span>
        </div>

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="navbar-icon" title="Settings" style={{ cursor: 'not-allowed', opacity: 0.4 }}>
            <Settings size={20} />
          </div>
          <div className="hover-scale" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, cursor: 'default', fontSize: '0.9rem' }}>
            D
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search..." className="hover-scale" style={{ background: 'white', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '0.6rem 1rem 0.6rem 2.2rem', color: 'var(--text-main)', fontSize: '0.85rem', width: '220px', outline: 'none' }} />
              </div>
              <button className="btn-ghost hover-scale" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'white', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={18} /></button>
            </div>
          </div>
        </header>

        <main className="animate-fade-in">
          {currentView === 'history' && <History onSelect={handleHistorySelect} />}
          {currentView === 'upload' && <UploadSection onUploadSuccess={handleUploadSuccess} />}
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
        </main>
      </div>
    </div>
  );
}

export default App;
