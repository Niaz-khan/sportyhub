import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BlogDetails() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBlog = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
            setBlog(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchBlog();
    }, [navigate, fetchBlog]);

    const handleLike = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/blogs/${id}/like`);
            setBlog({ ...blog, likes: response.data.likes });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (!blog) return <div style={styles.loading}>Blog not found</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Blog</h1>
                <div>
                    <button onClick={() => navigate('/blog')} style={styles.button}>← Back</button>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.blogContainer}>
                <h1>{blog.title}</h1>
                <div style={styles.meta}>
                    <span>🏷️ {blog.category}</span>
                    <span>✍️ {blog.authorName}</span>
                    <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span>👁️ {blog.views} views</span>
                </div>
                {blog.image && <img src={blog.image} alt={blog.title} style={styles.image} />}
                <div style={styles.content}>
                    {blog.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <button onClick={handleLike} style={styles.likeBtn}>❤️ {blog.likes} Likes</button>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial', background: '#f5f5f5', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
    button: { padding: '10px 20px', marginLeft: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    blogContainer: { background: 'white', padding: '30px', borderRadius: '10px', maxWidth: '800px', margin: '0 auto' },
    meta: { display: 'flex', gap: '20px', marginBottom: '20px', color: '#666', fontSize: '14px', flexWrap: 'wrap' },
    image: { width: '100%', borderRadius: '10px', marginBottom: '20px' },
    content: { fontSize: '16px', lineHeight: '1.8', marginBottom: '30px' },
    likeBtn: { padding: '10px 20px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    loading: { textAlign: 'center', padding: '50px' }
};

export default BlogDetails;