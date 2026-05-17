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
import PremiumAccess from './pages/PremiumAccess';
import { featureFlags, premiumFeatureContent } from './config/features';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
}

function FeatureRoute({ featureKey, children }) {
    if (featureFlags[featureKey]) {
        return children;
    }

    const content = premiumFeatureContent[featureKey] || {};
    return <PremiumAccess title={content.title} description={content.description} />;
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
                    <Route path="/checkout" element={<ProtectedRoute><FeatureRoute featureKey="checkout"><Checkout /></FeatureRoute></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><FeatureRoute featureKey="orders"><Orders /></FeatureRoute></ProtectedRoute>} />
                    <Route path="/forum" element={<ProtectedRoute><FeatureRoute featureKey="forum"><Forum /></FeatureRoute></ProtectedRoute>} />
                    <Route path="/forum/topic/:id" element={<ProtectedRoute><FeatureRoute featureKey="forum"><TopicDetails /></FeatureRoute></ProtectedRoute>} />
                    <Route path="/expert" element={<ProtectedRoute><FeatureRoute featureKey="expertAdvice"><ExpertAdvice /></FeatureRoute></ProtectedRoute>} />
                    <Route path="/blog" element={<ProtectedRoute><FeatureRoute featureKey="blog"><Blog /></FeatureRoute></ProtectedRoute>} />
                    <Route path="/blog/:id" element={<ProtectedRoute><FeatureRoute featureKey="blog"><BlogDetails /></FeatureRoute></ProtectedRoute>} />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
                {featureFlags.chatbot && <Chatbot />}
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;
