import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import Forum from './pages/Forum';
import TopicDetails from './pages/TopicDetails';
import ExpertAdvice from './pages/ExpertAdvice';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Chatbot from './components/Chatbot';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                    <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
                    <Route path="/forum/topic/:id" element={<ProtectedRoute><TopicDetails /></ProtectedRoute>} />
                    <Route path="/expert" element={<ProtectedRoute><ExpertAdvice /></ProtectedRoute>} />
                    <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
                    <Route path="/blog/:id" element={<ProtectedRoute><BlogDetails /></ProtectedRoute>} />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
                <Chatbot />
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;
