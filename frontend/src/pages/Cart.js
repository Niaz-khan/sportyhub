import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

function Cart() {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (cartItems.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1>🏃‍♂️ Sporty Hub - Cart</h1>
                    <div>
                        <button onClick={() => navigate('/products')} style={styles.button}>Products</button>
                        <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                        <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                    </div>
                </div>
                <div style={styles.emptyCart}>
                    <h2>Your cart is empty 🛒</h2>
                    <button onClick={() => navigate('/products')} style={styles.shopBtn}>Continue Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Cart</h1>
                <div>
                    <button onClick={() => navigate('/products')} style={styles.button}>Products</button>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>Dashboard</button>
                    <button onClick={handleLogout} style={{...styles.button, background: '#ff4757'}}>Logout</button>
                </div>
            </div>

            <div style={styles.cartContent}>
                <div style={styles.cartItems}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item._id}>
                                    <td>{item.name}</td>
                                    <td>₨{item.price.toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={styles.qtyBtn}>-</button>
                                        <span style={styles.qty}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                                    </td>
                                    <td>₨{(item.price * item.quantity).toLocaleString()}</td>
                                    <td><button onClick={() => removeFromCart(item._id)} style={styles.removeBtn}>Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={styles.summary}>
                    <h3>Order Summary</h3>
                    <p>Total Items: {cartItems.reduce((t, i) => t + i.quantity, 0)}</p>
                    <p style={styles.totalPrice}>Total: ₹{getTotalPrice().toLocaleString()}</p>
                    <button onClick={clearCart} style={styles.clearBtn}>Clear Cart</button>
                    <button onClick={() => navigate('/checkout')} style={styles.checkoutBtn}>Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial', minHeight: '100vh', background: '#f5f5f5' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #667eea', flexWrap: 'wrap' },
    button: { padding: '10px 20px', marginLeft: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    cartContent: { display: 'flex', gap: '30px', flexWrap: 'wrap' },
    cartItems: { flex: 2, overflowX: 'auto' },
    summary: { flex: 1, background: 'white', padding: '20px', borderRadius: '10px', height: 'fit-content' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden' },
    emptyCart: { textAlign: 'center', padding: '50px' },
    shopBtn: { padding: '15px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' },
    qtyBtn: { padding: '5px 10px', margin: '0 5px', cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '3px' },
    qty: { margin: '0 10px' },
    removeBtn: { padding: '5px 10px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
    totalPrice: { fontSize: '24px', fontWeight: 'bold', color: '#28a745' },
    clearBtn: { width: '100%', padding: '10px', marginTop: '10px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    checkoutBtn: { width: '100%', padding: '10px', marginTop: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Cart;