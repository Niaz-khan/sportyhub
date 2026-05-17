import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/orders/${user.id}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading orders...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - My Orders</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={() => navigate('/products')} style={styles.button}>Products</button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div style={styles.noOrders}>
                    <p>No orders yet. Start shopping!</p>
                    <button onClick={() => navigate('/products')} style={styles.shopBtn}>Shop Now</button>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order._id} style={styles.orderCard}>
                        <div style={styles.orderHeader}>
                            <span>Order ID: {order._id.slice(-8)}</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span style={styles.status}>✅ {order.status}</span>
                        </div>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={styles.orderItem}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.total.toLocaleString()}</span>
                            </div>
                        ))}
                        <div style={styles.orderTotal}>Total: ₹{order.totalAmount.toLocaleString()}</div>
                    </div>
                ))
            )}
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial', background: '#f5f5f5', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
    button: { padding: '10px 20px', marginLeft: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    orderCard: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' },
    status: { color: '#28a745' },
    orderItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' },
    orderTotal: { marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' },
    noOrders: { textAlign: 'center', padding: '50px' },
    shopBtn: { padding: '15px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' },
    loading: { textAlign: 'center', padding: '50px' }
};

export default Orders;