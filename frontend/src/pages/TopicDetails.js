import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TopicDetails() {
    const { id } = useParams();
    const [topic, setTopic] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchTopic();
    }, [id, navigate]);

    const fetchTopic = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/forum/topics/${id}`);
            setTopic(response.data.topic);
            setReplies(response.data.replies);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        
        try {
            const response = await axios.post('http://localhost:5000/api/forum/replies', {
                topicId: id,
                content: replyContent,
                authorId: user.id,
                authorName: user.name || user.email
            });
            setReplies([...replies, response.data]);
            setReplyContent('');
            // Update reply count
            setTopic({ ...topic, replies: topic.replies + 1 });
        } catch (error) {
            alert('Failed to post reply');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (!topic) return <div style={styles.loading}>Topic not found</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Topic</h1>
                <div>
                    <button onClick={() => navigate('/forum')} style={styles.button}>← Back to Forum</button>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.topicCard}>
                <h2>{topic.title}</h2>
                <p style={styles.meta}>📁 {topic.category} | by {topic.authorName} | 📅 {new Date(topic.createdAt).toLocaleDateString()} | 👁️ {topic.views} views</p>
                <p style={styles.content}>{topic.content}</p>
            </div>

            <div style={styles.repliesSection}>
                <h3>Replies ({replies.length})</h3>
                
                <form onSubmit={handleReply} style={styles.replyForm}>
                    <textarea
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        style={styles.textarea}
                        required
                    />
                    <button type="submit" style={styles.replyBtn}>Post Reply</button>
                </form>

                <div style={styles.repliesList}>
                    {replies.length === 0 ? (
                        <p>No replies yet. Be the first to respond!</p>
                    ) : (
                        replies.map(reply => (
                            <div key={reply._id} style={styles.replyCard}>
                                <div style={styles.replyHeader}>
                                    <strong>{reply.authorName}</strong>
                                    <small>{new Date(reply.createdAt).toLocaleString()}</small>
                                </div>
                                <p>{reply.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial', background: '#f5f5f5', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
    button: { padding: '10px 20px', marginLeft: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    topicCard: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px' },
    meta: { color: '#666', fontSize: '14px', marginBottom: '20px' },
    content: { fontSize: '16px', lineHeight: '1.6' },
    repliesSection: { background: 'white', padding: '20px', borderRadius: '10px' },
    replyForm: { marginBottom: '30px' },
    textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '100px', marginBottom: '10px' },
    replyBtn: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    repliesList: { maxHeight: '500px', overflowY: 'auto' },
    replyCard: { borderBottom: '1px solid #eee', padding: '15px 0' },
    replyHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    loading: { textAlign: 'center', padding: '50px' }
};

export default TopicDetails;