import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Database, Zap } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const UploadSection = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.csv')) {
            setFile(droppedFile);
            setError('');
        } else {
            setError('Please upload a valid CSV file.');
        }
    };

    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile?.name.endsWith('.csv')) {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please upload a valid CSV file.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploadSuccess(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadDemo = async () => {
        setLoading(true);
        try {
            const response = await fetch('/demo.csv');
            const blob = await response.blob();
            const demoFile = new File([blob], 'demo.csv', { type: 'text/csv' });

            const formData = new FormData();
            formData.append('file', demoFile);

            const res = await axios.post(`${API_BASE}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploadSuccess(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load demo CSV. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Background decorative elements */}
                <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--accent-primary)', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '250px', height: '250px', background: 'var(--accent-secondary)', opacity: 0.05, borderRadius: '50%', filter: 'blur(50px)' }}></div>

                <div style={{ background: 'var(--bg-dark)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: 'var(--shadow-card)' }}>
                    <UploadCloud size={40} color="var(--accent-primary)" />
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>Upload Sales Data</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
                    Provide your historical sales records in CSV format to generate AI-powered forecasts and restocking recommendations.
                </p>

                <div
                    className="upload-area hover-scale"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                        padding: '4rem 2rem',
                        border: '2px dashed var(--border-highlight)',
                        borderRadius: '16px',
                        background: 'rgba(124, 58, 237, 0.02)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 10
                    }}
                >
                    <FileText size={48} color="var(--accent-primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                    <h3 style={{ fontWeight: '600', fontSize: '1.25rem', color: 'var(--text-main)' }}>Drag & drop your CSV here</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 2rem' }}>or click below to browse your files</p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <label className="btn btn-primary shadow-glow hover-scale" style={{ cursor: 'pointer', padding: '0.8rem 1.5rem', boxShadow: 'var(--shadow-glow)' }}>
                            Browse Local Files
                            <input type="file" accept=".csv" onChange={handleChange} hidden />
                        </label>
                        <button
                            className="btn btn-outline hover-scale"
                            style={{ padding: '0.8rem 1.5rem', background: 'white' }}
                            onClick={handleLoadDemo}
                            disabled={loading}
                        >
                            {loading ? 'Loading Demo...' : 'Load Demo CSV'}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Required Schema:</span> Date | SKU | Sales_Quantity | Current_Stock
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    * Load Demo CSV to test the platform with sample data.
                </div>

                {file && (
                    <div className="animate-fade-in" style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', padding: '1.5rem', borderRadius: '16px', textAlign: 'left', position: 'relative', zIndex: 10 }}>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '12px', boxShadow: 'var(--shadow-card)' }}>
                            <FileText size={32} color="var(--accent-primary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-main)' }}>{file.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB • Ready to process</div>
                        </div>
                        <button
                            className="btn btn-primary hover-scale"
                            onClick={handleUpload}
                            disabled={loading}
                            style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-glow)' }}
                        >
                            {loading ? <div className="loader" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div> : 'Initialize Engine'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="animate-fade-in" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', marginTop: '1.5rem', borderRadius: '8px', position: 'relative', zIndex: 10 }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadSection;
