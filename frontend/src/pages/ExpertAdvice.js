import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ExpertAdvice() {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    const categories = ['All', 'Cricket', 'Football', 'Tennis', 'Badminton', 'Gym'];

    // Wrap fetchTips in useCallback to prevent infinite loop
    const fetchTips = useCallback(async () => {
        try {
            const url = selectedCategory && selectedCategory !== 'All'
                ? `http://localhost:5000/api/expert/tips/category/${selectedCategory}`
                : 'http://localhost:5000/api/expert/tips';
            const response = await axios.get(url);
            setTips(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchTips();
    }, [navigate, fetchTips]);

    const handleLike = async (id) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/expert/tips/${id}/like`);
            setTips(tips.map(tip => 
                tip._id === id ? { ...tip, likes: response.data.likes } : tip
            ));
        } catch (error) {
            console.error('Error liking:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading expert advice...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Expert Advice</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={() => navigate('/products')} style={styles.button}>Products</button>
                    <button onClick={() => navigate('/forum')} style={styles.button}>Forum</button>
                    <button onClick={() => navigate('/cart')} style={{...styles.button, background: '#28a745'}}>Cart</button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.adviceHeader}>
                <h2>🎯 Expert Advice & Tips</h2>
                <p>Learn from the best! Professional athletes share their secrets.</p>
            </div>

            <div style={styles.filterBar}>
                <label>Filter by Sport: </label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                {selectedCategory && <button onClick={() => setSelectedCategory('')} style={styles.clearBtn}>Clear</button>}
            </div>

            <div style={styles.tipsGrid}>
                {tips.length === 0 ? (
                    <p>No tips found. Run seeding command: curl -X POST http://localhost:5000/api/expert/seed</p>
                ) : (
                    tips.map(tip => (
                        <div key={tip._id} style={styles.tipCard}>
                            <div style={styles.tipHeader}>
                                <div>
                                    <h3>{tip.title}</h3>
                                    <p style={styles.category}>🏷️ {tip.category}</p>
                                </div>
                                <div style={styles.expertInfo}>
                                    <strong>{tip.expertName}</strong>
                                    <p style={styles.expertTitle}>{tip.expertTitle}</p>
                                </div>
                            </div>
                            <p style={styles.content}>{tip.content}</p>
                            <div style={styles.tipFooter}>
                                <button onClick={() => handleLike(tip._id)} style={styles.likeBtn}>
                                    ❤️ {tip.likes} Likes
                                </button>
                                <span style={styles.date}>{new Date(tip.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial', background: '#f5f5f5', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
    button: { padding: '10px 20px', marginLeft: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    adviceHeader: { textAlign: 'center', marginBottom: '30px' },
    filterBar: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px', justifyContent: 'center' },
    select: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd', width: '150px' },
    clearBtn: { padding: '8px 15px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    tipCard: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    tipHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap' },
    category: { color: '#667eea', fontSize: '12px', marginTop: '5px' },
    expertInfo: { textAlign: 'right' },
    expertTitle: { color: '#666', fontSize: '12px' },
    content: { fontSize: '15px', lineHeight: '1.6', marginBottom: '15px' },
    tipFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' },
    likeBtn: { padding: '5px 15px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' },
    date: { color: '#999', fontSize: '12px' },
    loading: { textAlign: 'center', padding: '50px' }
};

export default ExpertAdvice;