import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { addToCart, getTotalItems } = useContext(CartContext);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`http://localhost:5000/api/products/${id}`)
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });

        axios.get(`http://localhost:5000/api/reviews/${id}`)
            .then(response => {
                setReviews(response.data);
            })
            .catch(error => {
                console.error('Error fetching reviews:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleAddToCart = () => {
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/reviews', {
                productId: id,
                userId: user.id,
                userName: user.name || user.email,
                rating: parseInt(rating),
                comment: reviewText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setReviews([response.data, ...reviews]);
            setReviewText('');
            setRating(5);
            
            const allReviews = [...reviews, response.data];
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            setProduct({ ...product, rating: avgRating });
            
            alert('Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading product details...</div>;
    }

    if (!product) {
        return <div style={styles.loading}>Product not found</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={() => navigate('/products')} style={styles.button}>Products</button>
                    <button onClick={() => navigate('/cart')} style={{...styles.button, background: '#28a745'}}>
                        Cart 🛒 ({getTotalItems()})
                    </button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.detailsContainer}>
                <div style={styles.imageSection}>
                    <img 
                        src={product.image} 
                        alt={product.name}
                        style={styles.image}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Sporty+Hub'; }}
                    />
                </div>
                
                <div style={styles.infoSection}>
                    <h1 style={styles.productName}>{product.name}</h1>
                    <p style={styles.category}>{product.category}</p>
                    <p style={styles.price}>₹{product.price.toLocaleString()}</p>
                    <p style={styles.rating}>⭐ {product.rating.toFixed(1)} / 5 ({reviews.length} reviews)</p>
                    <p style={styles.stock}>In Stock: {product.stock} items</p>
                    <p style={styles.description}>{product.description}</p>
                    
                    <button onClick={handleAddToCart} style={styles.addToCartBtn}>
                        Add to Cart 🛒
                    </button>
                    
                    <button onClick={() => navigate('/products')} style={styles.continueBtn}>
                        Continue Shopping
                    </button>
                </div>
            </div>

            <div style={styles.reviewsSection}>
                <h2>Customer Reviews</h2>
                
                <div style={styles.reviewForm}>
                    <h3>Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                        <div style={styles.ratingInput}>
                            <label>Rating: </label>
                            <select value={rating} onChange={(e) => setRating(e.target.value)} style={styles.select}>
                                <option value="5">⭐⭐⭐⭐⭐ 5</option>
                                <option value="4">⭐⭐⭐⭐ 4</option>
                                <option value="3">⭐⭐⭐ 3</option>
                                <option value="2">⭐⭐ 2</option>
                                <option value="1">⭐ 1</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="Write your review here..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            style={styles.textarea}
                            required
                        />
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>

                <div style={styles.reviewsList}>
                    {reviews.length === 0 ? (
                        <p>No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map(review => (
                            <div key={review._id} style={styles.reviewCard}>
                                <div style={styles.reviewHeader}>
                                    <strong>{review.userName}</strong>
                                    <span style={styles.reviewRating}>⭐ {review.rating}/5</span>
                                </div>
                                <p style={styles.reviewComment}>{review.comment}</p>
                                <small style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</small>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial', minHeight: '100vh', background: '#f5f5f5' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '10px', borderBottom: '2px solid #667eea', flexWrap: 'wrap' },
    button: { padding: '10px 20px', marginLeft: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    detailsContainer: { display: 'flex', gap: '40px', flexWrap: 'wrap', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
    imageSection: { flex: 1, minWidth: '300px' },
    image: { width: '100%', maxWidth: '400px', borderRadius: '10px' },
    infoSection: { flex: 1, minWidth: '300px' },
    productName: { margin: '0 0 10px 0', fontSize: '32px' },
    category: { color: '#667eea', fontSize: '18px', marginBottom: '10px' },
    price: { fontSize: '36px', fontWeight: 'bold', color: '#28a745', margin: '20px 0' },
    rating: { fontSize: '18px', color: '#ff9800', marginBottom: '10px' },
    stock: { color: '#666', marginBottom: '20px' },
    description: { lineHeight: '1.6', color: '#333', marginBottom: '30px' },
    addToCartBtn: { padding: '15px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', marginRight: '10px' },
    continueBtn: { padding: '15px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
    reviewsSection: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    reviewForm: { marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '10px' },
    ratingInput: { marginBottom: '15px' },
    select: { padding: '8px', marginLeft: '10px', borderRadius: '5px' },
    textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '100px', marginBottom: '15px' },
    submitBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    reviewsList: { maxHeight: '400px', overflowY: 'auto' },
    reviewCard: { borderBottom: '1px solid #eee', padding: '15px 0' },
    reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    reviewRating: { color: '#ff9800' },
    reviewComment: { color: '#333', marginBottom: '5px' },
    reviewDate: { color: '#999', fontSize: '12px' },
    loading: { padding: '50px', textAlign: 'center', fontSize: '18px' }
};

export default ProductDetails;