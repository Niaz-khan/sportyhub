import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    const categories = ['All', 'Cricket', 'Football', 'Tennis', 'Badminton', 'Gym', 'Running'];

    const fetchBlogs = useCallback(async () => {
        try {
            const url = selectedCategory && selectedCategory !== 'All'
                ? `http://localhost:5000/api/blogs/category/${selectedCategory}`
                : 'http://localhost:5000/api/blogs';
            const response = await axios.get(url);
            setBlogs(response.data);
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
        fetchBlogs();
    }, [navigate, fetchBlogs]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading blogs...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Blog</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={() => navigate('/products')} style={styles.button}>Products</button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.blogHeader}>
                <h2>📝 Sports Blog & News</h2>
                <p>Latest articles, tips, and news from the world of sports</p>
            </div>

            <div style={styles.filterBar}>
                <label>Filter by Sport: </label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                {selectedCategory && <button onClick={() => setSelectedCategory('')} style={styles.clearBtn}>Clear</button>}
            </div>

            <div style={styles.blogsGrid}>
                {blogs.length === 0 ? (
                    <p>No blogs found. Run: curl -X POST http://localhost:5000/api/blogs/seed</p>
                ) : (
                    blogs.map(blog => (
                        <Link to={`/blog/${blog._id}`} key={blog._id} style={styles.blogLink}>
                            <div style={styles.blogCard}>
                                {blog.image && <img src={blog.image} alt={blog.title} style={styles.blogImage} />}
                                <div style={styles.blogContent}>
                                    <h3>{blog.title}</h3>
                                    <p style={styles.category}>🏷️ {blog.category}</p>
                                    <p style={styles.summary}>{blog.summary}</p>
                                    <div style={styles.blogFooter}>
                                        <span>✍️ {blog.authorName}</span>
                                        <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
                                        <span>👁️ {blog.views} views</span>
                                        <span>❤️ {blog.likes} likes</span>
                                    </div>
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
    blogHeader: { textAlign: 'center', marginBottom: '30px' },
    filterBar: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px', justifyContent: 'center' },
    select: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd', width: '150px' },
    clearBtn: { padding: '8px 15px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    blogsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' },
    blogLink: { textDecoration: 'none', color: 'inherit' },
    blogCard: { background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    blogImage: { width: '100%', height: '200px', objectFit: 'cover' },
    blogContent: { padding: '20px' },
    category: { color: '#667eea', fontSize: '14px', marginBottom: '10px' },
    summary: { color: '#666', marginBottom: '15px' },
    blogFooter: { display: 'flex', gap: '15px', fontSize: '12px', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px' },
    loading: { textAlign: 'center', padding: '50px' }
};

export default Blog;