import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const { addToCart, getTotalItems } = useContext(CartContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get('http://localhost:5000/api/products')
            .then(response => {
                setProducts(response.data);
                setFilteredProducts(response.data);
                const uniqueCategories = [...new Set(response.data.map(p => p.category))];
                setCategories(uniqueCategories);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, [navigate]);

    useEffect(() => {
        let result = [...products];

        if (searchTerm) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (sortBy === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating_desc') {
            result.sort((a, b) => b.rating - a.rating);
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, sortBy, products]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleAddToCart = (product, event) => {
        event.stopPropagation();
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSortBy('');
    };

    if (loading) {
        return <div style={styles.loading}>Loading products...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Products</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={() => navigate('/cart')} style={{...styles.button, background: '#28a745'}}>
                        Cart 🛒 ({getTotalItems()})
                    </button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="🔍 Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={styles.select}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={styles.select}
                >
                    <option value="">Sort by</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Highest Rated</option>
                </select>
                
                <button onClick={clearFilters} style={styles.clearBtn}>Clear Filters</button>
            </div>

            <h3>Found {filteredProducts.length} products</h3>

            <div style={styles.grid}>
                {filteredProducts.map(product => (
                    <div 
                        key={product._id} 
                        style={styles.card} 
                        onClick={() => handleProductClick(product._id)}
                    >
                        <h3>{product.name}</h3>
                        <p style={styles.category}>{product.category}</p>
                        <p style={styles.price}>₨ {product.price.toLocaleString()}</p>
                        <p>⭐ {product.rating} / 5</p>
                        <p style={styles.stock}>Stock: {product.stock} items</p>
                        <button 
                            onClick={(e) => handleAddToCart(product, e)}
                            style={styles.cartBtn}
                        >
                            Add to Cart 🛒
                        </button>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div style={styles.noResults}>
                    <p>No products found matching your criteria.</p>
                    <button onClick={clearFilters} style={styles.shopBtn}>Clear Filters</button>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #667eea', flexWrap: 'wrap' },
    button: { padding: '10px 20px', marginLeft: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    filters: { display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '10px' },
    searchInput: { flex: 1, minWidth: '200px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' },
    select: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' },
    clearBtn: { padding: '10px 20px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' },
    card: { 
        border: '1px solid #ddd', 
        padding: '15px', 
        borderRadius: '8px', 
        background: 'white', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
        cursor: 'pointer',
        transition: 'transform 0.2s'
    },
    category: { color: '#667eea', margin: '5px 0' },
    price: { fontSize: '22px', fontWeight: 'bold', color: '#28a745', margin: '10px 0' },
    stock: { color: '#666', margin: '5px 0' },
    cartBtn: { 
        width: '100%', 
        padding: '10px', 
        marginTop: '10px', 
        background: '#28a745', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer'
    },
    loading: { padding: '50px', textAlign: 'center' },
    noResults: { textAlign: 'center', padding: '50px' },
    shopBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }
};

export default Products;