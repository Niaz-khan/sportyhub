import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51TXdv58hYvuX6nboEUgq0P7XhyDXRWkWBmDS4OIMqrjVBU7jM0Bp1zQZx1dCxQHfd2HOhxX72EF4yrRUFw5QlV44002YL709Mf');

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        if (!stripe || !elements) {
            setError('Stripe not loaded');
            setLoading(false);
            return;
        }

        if (!postalCode) {
            setError('Please enter your postal code');
            setLoading(false);
            return;
        }

        try {
            const amount = getTotalPrice();
            const response = await axios.post('http://localhost:5000/api/create-payment-intent', { amount });
            const clientSecret = response.data.clientSecret;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: user.name || user.email,
                        email: user.email,
                        address: {
                            postal_code: postalCode
                        }
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    await axios.post('http://localhost:5000/api/save-order', {
                        userId: user.id,
                        userName: user.name || user.email,
                        userEmail: user.email,
                        items: cartItems.map(item => ({
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            total: item.price * item.quantity
                        })),
                        totalAmount: amount,
                        paymentIntentId: result.paymentIntent.id
                    });
                    
                    alert('Payment successful! Order placed successfully.');
                    clearCart();
                    navigate('/orders');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.cardElement}>
                <CardElement options={{ 
                    style: { 
                        base: { fontSize: '16px', color: '#424770' } 
                    }
                }} />
            </div>
            <div style={styles.postalField}>
                <label style={styles.label}>Postal Code / ZIP Code:</label>
                <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g., 54000, 75300, etc."
                    style={styles.postalInput}
                    required
                />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={!stripe || loading} style={styles.payButton}>
                {loading ? 'Processing...' : `Pay ₨ ${getTotalPrice().toLocaleString()}`}
            </button>
        </form>
    );
}

function Checkout() {
    const { cartItems, getTotalItems, getTotalPrice } = useContext(CartContext);
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div style={styles.emptyCart}>
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/products')} style={styles.shopBtn}>Continue Shopping</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🏃‍♂️ Sporty Hub - Checkout (PKR)</h1>
                <button onClick={() => navigate('/cart')} style={styles.backBtn}>← Back to Cart</button>
            </div>
            <div style={styles.checkoutContainer}>
                <div style={styles.orderSummary}>
                    <h2>Order Summary</h2>
                    <p>Total Items: {getTotalItems()}</p>
                    {cartItems.map(item => (
                        <div key={item._id} style={styles.orderItem}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>₨ {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                    <div style={styles.total}>Total: ₨ {getTotalPrice().toLocaleString()}</div>
                </div>
                <div style={styles.paymentSection}>
                    <h2>Payment Details</h2>
                    <Elements stripe={stripePromise}>
                        <CheckoutForm />
                    </Elements>
                    <p style={styles.testCard}>💳 Test Card: 4242 4242 4242 4242</p>
                    <p style={styles.testCard}>📅 Any future date | 🔒 Any CVC | 📍 Any postal code</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', fontFamily: 'Arial', background: '#f5f5f5', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
    backBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    checkoutContainer: { display: 'flex', gap: '30px', maxWidth: '1000px', margin: '0 auto', flexWrap: 'wrap' },
    orderSummary: { flex: 1, background: 'white', padding: '20px', borderRadius: '10px' },
    orderItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
    total: { marginTop: '20px', fontSize: '20px', fontWeight: 'bold', textAlign: 'right' },
    paymentSection: { flex: 1, background: 'white', padding: '20px', borderRadius: '10px' },
    form: { marginTop: '10px' },
    cardElement: { border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '15px' },
    postalField: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' },
    postalInput: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' },
    payButton: { width: '100%', padding: '15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer' },
    error: { color: 'red', textAlign: 'center', marginBottom: '10px' },
    testCard: { textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '12px' },
    emptyCart: { textAlign: 'center', padding: '50px' },
    shopBtn: { padding: '15px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Checkout;