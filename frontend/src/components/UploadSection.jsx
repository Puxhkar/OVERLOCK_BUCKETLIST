import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const UploadSection = ({ onUploadSuccess, token }) => {
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
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            onUploadSuccess(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '4rem auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* Hero Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
                        Inventory.<br /><span className="text-gradient">Optimized.</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Upload your historical sales data. Let our proprietary ensemble forecasting engine analyze trends, detect seasonality, and provide actionable restocking recommendations to minimize stockout overhead.
                    </p>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                    <img
                        src="/inventory.png"
                        alt="Minimalist Inventory"
                        style={{ width: '100%', borderRadius: '8px', filter: 'brightness(0.95)', objectFit: 'cover' }}
                    />
                </div>
            </div>

            <div className="glass" style={{ padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: '600' }}>Import Data Interface</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2.5rem' }}>
                    Schema: Date | SKU | Sales_Quantity | Current_Stock
                </p>

                <div
                    className="upload-area"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{ padding: '4rem 2rem', border: '2px dashed var(--border-subtle)', borderRadius: '12px', background: 'var(--bg-dark)', textAlign: 'center' }}
                >
                    <UploadCloud size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                    <h3 style={{ fontWeight: '600', marginTop: '1rem', fontSize: '1.2rem' }}>Drag & drop CSV payload</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 2rem' }}>or select file directly from your local machine</p>
                    <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                        Browse Files
                        <input type="file" accept=".csv" onChange={handleChange} hidden />
                    </label>
                </div>

                {file && (
                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                        <FileText size={24} color="var(--accent-primary)" />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600' }}>{file.name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={loading}
                        >
                            {loading ? <div className="loader"></div> : 'Initialize Engine'}
                        </button>
                    </div>
                )}

                {error && <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', marginTop: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
            </div>
        </div>
    );
};

export default UploadSection;
