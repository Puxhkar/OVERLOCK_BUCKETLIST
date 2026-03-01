import React from 'react';
import { ArrowRight, BarChart2, TrendingUp, Cpu, Users, Star, ArrowDownRight } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>

            {/* Hero Splitr-Style */}
            <section style={{ margin: '3rem auto 5rem', maxWidth: '950px', display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
                <div style={{
                    position: 'relative',
                    background: 'linear-gradient(180deg, #0a0b10 0%, #030407 100%)',
                    borderRadius: '40px',
                    width: '100%',
                    padding: '4rem 2rem 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                }}>

                    {/* Floating Pill */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '6px 16px', borderRadius: '100px', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                        The Ultimate Retail Engine
                    </div>

                    <h1 style={{ color: 'white', fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: '0.95', letterSpacing: '-0.04em', textAlign: 'center', fontWeight: 800, marginBottom: '1.5rem', maxWidth: '800px' }}>
                        Predict demand.<br />Maximize profits.
                    </h1>

                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', lineHeight: '1.6', textAlign: 'center', maxWidth: '500px', marginBottom: '2.5rem' }}>
                        The smartest, cleanest way to track seasonal trends and predict your inventory. Say goodbye to the guessing games.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', zIndex: 10 }}>
                        <button className="btn hover-scale" style={{ background: 'white', color: 'black', padding: '1rem 2rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none' }} onClick={onGetStarted}>
                            <div style={{ background: 'var(--accent-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={14} color="white" />
                            </div>
                            Start forecasting
                        </button>
                        <button className="btn hover-scale" style={{ background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            <div style={{ border: '1px solid rgba(255,255,255,0.3)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowRight size={14} color="white" />
                            </div>
                            How It Works
                        </button>
                    </div>

                    {/* Illustration Graphic */}
                    <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', bottom: '-20px' }}>
                        {/* We invert the black & white line art to show as glowing white outlines on the dark background */}
                        <img src="/assets/shopkeepers.png" alt="Business Owners" style={{ maxWidth: '480px', width: '100%', height: 'auto', filter: 'invert(1) opacity(0.85)' }} />
                    </div>

                </div>
            </section>

            {/* Why Use This Section */}
            <section id="whyus" style={{ margin: '0 auto 6rem', maxWidth: '1000px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Why choose <span className="text-gradient">InventraCloud?</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                    <div className="glass-panel hover-scale" style={{ background: 'white' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><TrendingUp size={20} /></div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Reduce Stockouts</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem' }}>We provide pinpoint accurate safety stock calculations so you never run out of your best sellers during peak demand.</p>
                    </div>
                    <div className="glass-panel hover-scale" style={{ background: 'white' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><ArrowDownRight size={20} /></div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Eliminate Overstock</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem' }}>Identify items that are taking up warehouse space and freezing your capital. We tell you exactly what to clear out.</p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" style={{ margin: '6rem auto', maxWidth: '1200px' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>How InventraCloud <span className="text-gradient-primary">Works</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    <div className="glass-panel hover-scale" style={{ background: 'white' }}>
                        <div style={{ background: 'rgba(124, 58, 237, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                            <Cpu size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Algorithmic Ingestion</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Upload your raw CSV payload. We clean, resample to daily frequencies, and isolate missing data automatically.</p>
                    </div>

                    <div className="glass-panel hover-scale" style={{ background: 'white' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Ensemble Processing</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>We train Moving Averages, Holt-Winters, and Prophet models concurrently. The one with the lowest RMSE wins.</p>
                    </div>

                    <div className="glass-panel hover-scale" style={{ background: 'white' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--warning)' }}>
                            <BarChart2 size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. Actionable Insights</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Receive a calculated Safety Stock bound, Reorder Points, and plain English AI business intelligence heuristics.</p>
                    </div>

                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" style={{ margin: '6rem auto', maxWidth: '1000px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Trusted by Supply Chain <span className="text-gradient">Leaders</span></h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>See how others have optimized their warehousing workflows using predictive analytics.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>

                    <div className="glass-panel" style={{ background: 'white' }}>
                        <div style={{ display: 'flex', gap: '4px', color: 'var(--warning)', marginBottom: '1rem' }}>
                            <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                        </div>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--text-main)' }}>"SmartStock caught our seasonal Q4 peak 6 weeks in advance. We managed to restructure our capital and order ahead, eliminating 95% of stockout risk."</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--border-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="var(--text-muted)" /></div>
                            <div>
                                <strong style={{ display: 'block', color: 'var(--text-main)' }}>Sarah Jenkins</strong>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>VP Logistics, RetailCo</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ background: 'white' }}>
                        <div style={{ display: 'flex', gap: '4px', color: 'var(--warning)', marginBottom: '1rem' }}>
                            <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                        </div>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--text-main)' }}>"I love that it keeps my past query history so I can track the models' accuracy over time. The UI is incredibly fast and completely robust."</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--border-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="var(--text-muted)" /></div>
                            <div>
                                <strong style={{ display: 'block', color: 'var(--text-main)' }}>David Chen</strong>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Warehouse Manager</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
};

export default LandingPage;
