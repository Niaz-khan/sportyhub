require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ========== USER SCHEMA ==========
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Hash password before saving - SIMPLE VERSION
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);

// ========== REGISTER API ==========
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        const user = new User({ name, email, password });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, 'mysecretkey12345', { expiresIn: '30d' });
        
        res.json({
            success: true,
            id: user._id,
            name: user.name,
            email: user.email,
            token: token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== LOGIN API ==========
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user._id }, 'mysecretkey12345', { expiresIn: '30d' });
        
        res.json({
            success: true,
            id: user._id,
            name: user.name,
            email: user.email,
            token: token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== TEST ROUTES ==========
app.get('/', (req, res) => {
    res.send('🏃‍♂️ Sporty Hub API is running!');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', success: true });
});

// ========== START SERVER ==========
mongoose.connect('mongodb://localhost:27017/sportyhub')
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(5000, () => {
            console.log('✅ Server running on http://localhost:5000');
        });
    })
    .catch(err => {
        console.error('❌ MongoDB error:', err);
    });