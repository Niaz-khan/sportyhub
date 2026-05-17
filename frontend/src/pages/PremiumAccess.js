import React from 'react';
import { useNavigate } from 'react-router-dom';

function PremiumAccess({ title = 'Premium Feature', description = 'This feature is available on a premium plan.' }) {
    const navigate = useNavigate();

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.badge}>Premium</div>
                <h1 style={styles.title}>{title}</h1>
                <p style={styles.description}>{description}</p>
                <div style={styles.actions}>
                    <button onClick={() => navigate('/dashboard')} style={styles.primaryBtn}>
                        Back to Dashboard
                    </button>
                    <button onClick={() => navigate('/products')} style={styles.secondaryBtn}>
                        Browse Products
                    </button>
                </div>
                <p style={styles.note}>Re-enable this feature later by updating the frontend feature flags.</p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #eef4ff 0%, #fff7ec 100%)',
        fontFamily: 'Arial, sans-serif',
    },
    card: {
        width: '100%',
        maxWidth: '640px',
        background: '#fff',
        borderRadius: '18px',
        padding: '40px',
        boxShadow: '0 18px 50px rgba(17, 24, 39, 0.12)',
        textAlign: 'center',
    },
    badge: {
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: '999px',
        background: '#111827',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '18px',
    },
    title: {
        margin: '0 0 12px',
        fontSize: '34px',
        color: '#182033',
    },
    description: {
        margin: '0 auto 28px',
        maxWidth: '480px',
        fontSize: '16px',
        lineHeight: 1.6,
        color: '#4b5563',
    },
    actions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '18px',
    },
    primaryBtn: {
        padding: '12px 22px',
        borderRadius: '10px',
        border: 'none',
        background: '#1d4ed8',
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    secondaryBtn: {
        padding: '12px 22px',
        borderRadius: '10px',
        border: '1px solid #d1d5db',
        background: '#fff',
        color: '#182033',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    note: {
        margin: 0,
        fontSize: '13px',
        color: '#6b7280',
    },
};

export default PremiumAccess;
