import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Forum() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showNewTopic, setShowNewTopic] = useState(false);
    const [newTopic, setNewTopic] = useState({ title: '', category: 'General', content: '' });
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const categories = ['General', 'Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball', 'Gym', 'Running'];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchTopics();
    }, [navigate, selectedCategory]);

    const fetchTopics = async () => {
        try {
            const url = selectedCategory 
                ? `http://localhost:5000/api/forum/category/${selectedCategory}`
                : 'http://localhost:5000/api/forum/topics';
            const response = await axios.get(url);
            setTopics(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/forum/topics', {
                title: newTopic.title,
                category: newTopic.category,
                content: newTopic.content,
                authorId: user.id,
                authorName: user.name || user.email
            });
            setTopics([response.data, ...topics]);
            setShowNewTopic(false);
            setNewTopic({ title: '', category: 'General', content: '' });
            alert('Topic created!');
        } catch (error) {
            alert('Failed to create topic');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading forum...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Forum</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={() => navigate('/products')} style={styles.button}>Products</button>
                    <button onClick={() => navigate('/cart')} style={{...styles.button, background: '#28a745'}}>Cart</button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.forumHeader}>
                <h2>💬 Community Forum</h2>
                <p>Discuss sports, share tips, and connect with fellow enthusiasts!</p>
            </div>

            <div style={styles.controls}>
                <div style={styles.filterSection}>
                    <label>Filter: </label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button onClick={() => setSelectedCategory('')} style={styles.clearBtn}>Clear</button>
                </div>
                <button onClick={() => setShowNewTopic(!showNewTopic)} style={styles.newTopicBtn}>+ New Topic</button>
            </div>

            {showNewTopic && (
                <div style={styles.newTopicForm}>
                    <h3>Create New Topic</h3>
                    <form onSubmit={handleCreateTopic}>
                        <input type="text" placeholder="Title" value={newTopic.title} onChange={(e) => setNewTopic({...newTopic, title: e.target.value})} style={styles.input} required />
                        <select value={newTopic.category} onChange={(e) => setNewTopic({...newTopic, category: e.target.value})} style={styles.select} required>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <textarea placeholder="Content" value={newTopic.content} onChange={(e) => setNewTopic({...newTopic, content: e.target.value})} style={styles.textarea} required />
                        <button type="submit" style={styles.submitBtn}>Post Topic</button>
                        <button type="button" onClick={() => setShowNewTopic(false)} style={styles.cancelBtn}>Cancel</button>
                    </form>
                </div>
            )}

            <div style={styles.topicsList}>
                {topics.length === 0 ? (
                    <p>No topics yet. Start a discussion!</p>
                ) : (
                    topics.map(topic => (
                        <Link to={`/forum/topic/${topic._id}`} key={topic._id} style={styles.topicLink}>
                            <div style={styles.topicCard}>
                                <div>
                                    <h3>{topic.title}</h3>
                                    <p>📁 {topic.category} | by {topic.authorName} | 📅 {new Date(topic.createdAt).toLocaleDateString()}</p>
                                    <p>{topic.content.substring(0, 100)}...</p>
                                </div>
                                <div style={styles.stats}>
                                    <span>💬 {topic.replies} replies</span>
                                    <span>👁️ {topic.views} views</span>
                                </div>
                            </div>
                        </Link>
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
    forumHeader: { textAlign: 'center', marginBottom: '30px' },
    controls: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap' },
    filterSection: { display: 'flex', gap: '10px', alignItems: 'center' },
    select: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd' },
    clearBtn: { padding: '8px 15px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    newTopicBtn: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    newTopicForm: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' },
    textarea: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '100px' },
    submitBtn: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' },
    cancelBtn: { padding: '10px 20px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    topicsList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    topicLink: { textDecoration: 'none', color: 'inherit' },
    topicCard: { background: 'white', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
    stats: { textAlign: 'right' },
    loading: { textAlign: 'center', padding: '50px' }
};

export default Forum;