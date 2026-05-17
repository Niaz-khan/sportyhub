require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { products, expertTips, blogArticles } = require('./data/seedData');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;
const prisma = new PrismaClient();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

app.use(cors());
app.use(express.json());

const toMongoShape = (record) => {
    if (!record) return record;

    if (Array.isArray(record)) {
        return record.map(toMongoShape);
    }

    if (typeof record !== 'object') {
        return record;
    }

    const result = {};

    for (const [key, value] of Object.entries(record)) {
        result[key] = Array.isArray(value) || (value && typeof value === 'object' && !(value instanceof Date))
            ? toMongoShape(value)
            : value;
    }

    if (record.id && !record._id) {
        result._id = record.id;
    }

    return result;
};

const signToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });

// ========== AUTH ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        res.json({
            success: true,
            token: signToken(user.id),
            email: user.email,
            name: user.name,
            id: user.id,
            _id: user.id,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            success: true,
            token: signToken(user.id),
            email: user.email,
            name: user.name,
            id: user.id,
            _id: user.id,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== PRODUCT ROUTES ==========
app.get('/api/products', async (req, res) => {
    try {
        const allProducts = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(allProducts));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(toMongoShape(product));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products/seed', async (req, res) => {
    try {
        await prisma.review.deleteMany();
        await prisma.product.deleteMany();
        await prisma.product.createMany({ data: products });

        res.json({
            message: 'Products seeded with PKR prices!',
            count: products.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== REVIEW ROUTES ==========
app.get('/api/reviews/:productId', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId: req.params.productId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(reviews));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const review = await prisma.review.create({
            data: {
                productId,
                userId,
                userName,
                rating: Number(rating),
                comment,
            },
        });

        const aggregates = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
        });

        await prisma.product.update({
            where: { id: productId },
            data: { rating: aggregates._avg.rating || 0 },
        });

        res.status(201).json(toMongoShape(review));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== FORUM ROUTES ==========
app.get('/api/forum/topics', async (req, res) => {
    try {
        const topics = await prisma.topic.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(topics));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/forum/topics/:id', async (req, res) => {
    try {
        const existingTopic = await prisma.topic.findUnique({
            where: { id: req.params.id },
        });

        if (!existingTopic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const topic = await prisma.topic.update({
            where: { id: req.params.id },
            data: { views: { increment: 1 } },
        });

        const replies = await prisma.reply.findMany({
            where: { topicId: req.params.id },
            orderBy: { createdAt: 'asc' },
        });

        res.json({
            topic: toMongoShape(topic),
            replies: toMongoShape(replies),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/forum/topics', async (req, res) => {
    try {
        const { title, category, content, authorId, authorName } = req.body;

        const topic = await prisma.topic.create({
            data: {
                title,
                category,
                content,
                authorId: authorId || null,
                authorName,
            },
        });

        res.status(201).json(toMongoShape(topic));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/forum/replies', async (req, res) => {
    try {
        const { topicId, content, authorId, authorName } = req.body;

        const topic = await prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const reply = await prisma.reply.create({
            data: {
                topicId,
                content,
                authorId: authorId || null,
                authorName,
            },
        });

        await prisma.topic.update({
            where: { id: topicId },
            data: { replies: { increment: 1 } },
        });

        res.status(201).json(toMongoShape(reply));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/forum/category/:category', async (req, res) => {
    try {
        const topics = await prisma.topic.findMany({
            where: { category: req.params.category },
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(topics));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== EXPERT ADVICE ROUTES ==========
app.get('/api/expert/tips', async (req, res) => {
    try {
        const tips = await prisma.expertTip.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(tips));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/expert/tips/category/:category', async (req, res) => {
    try {
        const tips = await prisma.expertTip.findMany({
            where: { category: req.params.category },
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(tips));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/expert/tips/:id/like', async (req, res) => {
    try {
        const existingTip = await prisma.expertTip.findUnique({
            where: { id: req.params.id },
        });

        if (!existingTip) {
            return res.status(404).json({ error: 'Tip not found' });
        }

        const tip = await prisma.expertTip.update({
            where: { id: req.params.id },
            data: { likes: { increment: 1 } },
        });

        res.json({ likes: tip.likes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/expert/seed', async (req, res) => {
    try {
        await prisma.expertTip.deleteMany();
        await prisma.expertTip.createMany({ data: expertTips });

        res.json({
            message: `${expertTips.length} expert tips seeded successfully!`,
            count: expertTips.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== BLOG ROUTES ==========
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(blogs));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/blogs/:id', async (req, res) => {
    try {
        const existingBlog = await prisma.blog.findUnique({
            where: { id: req.params.id },
        });

        if (!existingBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const blog = await prisma.blog.update({
            where: { id: req.params.id },
            data: { views: { increment: 1 } },
        });

        res.json(toMongoShape(blog));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/blogs/category/:category', async (req, res) => {
    try {
        const blogs = await prisma.blog.findMany({
            where: { category: req.params.category },
            orderBy: { createdAt: 'desc' },
        });
        res.json(toMongoShape(blogs));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/blogs/:id/like', async (req, res) => {
    try {
        const existingBlog = await prisma.blog.findUnique({
            where: { id: req.params.id },
        });

        if (!existingBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const blog = await prisma.blog.update({
            where: { id: req.params.id },
            data: { likes: { increment: 1 } },
        });

        res.json({ likes: blog.likes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/blogs/seed', async (req, res) => {
    try {
        await prisma.blog.deleteMany();
        await prisma.blog.createMany({ data: blogArticles });

        res.json({
            message: `${blogArticles.length} blog articles seeded successfully!`,
            count: blogArticles.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== PAYMENT ROUTES ==========
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env.' });
        }

        const { amount, currency = 'pkr' } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'A valid amount is required' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100),
            currency,
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/save-order', async (req, res) => {
    try {
        const { userId, userName, userEmail, items, totalAmount, paymentIntentId } = req.body;

        const order = await prisma.order.create({
            data: {
                userId: userId || null,
                userName,
                userEmail,
                items,
                totalAmount: Number(totalAmount),
                paymentIntentId,
                status: 'completed',
            },
        });

        res.json({ success: true, orderId: order.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders/:userId', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.params.userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(toMongoShape(orders));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== PROFESSIONAL SPORTS CHATBOT ==========
app.post('/api/chatbot', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.json({ reply: 'Hello! I am SportyBot. Ask me about sports equipment, training tips, or rules!' });
    }

    const msg = message.toLowerCase();

    if (msg.includes('cricket') || msg.includes('bat')) {
        if (msg.includes('batting') || msg.includes('how to bat')) {
            return res.json({ reply: 'To improve cricket batting:\n\n• Keep your head still and eyes on the ball\n• Maintain a solid base with feet shoulder-width apart\n• Practice your forward defense and drive shots\n• Watch the ball until it hits the bat\n• Our Professional Cricket Bat (₨7,999) is perfect for practice!\n\nNeed more batting tips?' });
        }
        if (msg.includes('bowling') || msg.includes('how to bowl')) {
            return res.json({ reply: 'Cricket Bowling Tips:\n\n• Maintain a smooth run-up\n• Keep your non-bowling arm high\n• Release the ball at the highest point\n• Practice line and length consistently\n• Try our practice balls to improve accuracy!\n\nWant specific bowling techniques?' });
        }
        if (msg.includes('best') || msg.includes('recommend')) {
            return res.json({ reply: 'Best Cricket Equipment:\n\n• Bat: Kashmir Willow - ₨7,999\n• Helmet: Premium Steel Grill - ₨2,499\n• Pads: Professional Grade - ₨1,999\n• Gloves: Premium Leather - ₨1,299\n\nAll available at SportyHub! Need more details?' });
        }
        return res.json({ reply: 'Cricket Equipment at SportyHub:\n\n• Cricket Bat: ₨7,999\n• Cricket Helmet: ₨2,499\n• Batting Pads: ₨1,999\n• Gloves: ₨1,299\n\nWould you like training tips or product details?' });
    }

    if (msg.includes('football') || msg.includes('soccer')) {
        if (msg.includes('shooting') || msg.includes('how to shoot')) {
            return res.json({ reply: 'Football Shooting Tips:\n\n• Place non-kicking foot beside the ball\n• Strike the center of the ball with your laces\n• Follow through towards your target\n• Keep your body over the ball\n• Our Size 5 Match Football (₨2,499) is great for practice!\n\nWant more shooting drills?' });
        }
        if (msg.includes('dribbling') || msg.includes('how to dribble')) {
            return res.json({ reply: 'Dribbling Tips:\n\n• Use the outside of your foot\n• Keep the ball close to your feet\n• Look up to see the field\n• Practice cone drills regularly\n• Try our training cones set!\n\nNeed advanced dribbling techniques?' });
        }
        if (msg.includes('best')) {
            return res.json({ reply: 'Best Football Gear:\n\n• Match Ball: Size 5 - ₨2,499\n• Training Ball: Size 5 - ₨1,499\n• Shin Guards: ₨799\n• Cleats: Starting from ₨3,999\n\nShop now at SportyHub!' });
        }
        return res.json({ reply: 'Football at SportyHub:\n\n• Match Football: ₨2,499\n• Training Ball: ₨1,499\n• Shin Guards: ₨799\n• Cleats: ₨3,999+\n\nAsk me about shooting, dribbling, or passing techniques!' });
    }

    if (msg.includes('basketball')) {
        if (msg.includes('dribbling') || msg.includes('how to dribble')) {
            return res.json({ reply: 'Basketball Dribbling Tips:\n\n• Keep your head up to see the court\n• Use your fingertips, not palm\n• Keep the ball low (waist height)\n• Practice crossover and between-legs drills\n• Our Official Basketball (₨2,799) is perfect for training!\n\nWant advanced moves?' });
        }
        if (msg.includes('shooting') || msg.includes('how to shoot')) {
            return res.json({ reply: 'Shooting Tips:\n\n• Keep your elbow aligned with the basket\n• Use your legs for power\n• Follow through with your wrist (swan neck)\n• Practice free throws regularly\n• Need a basketball hoop? Contact us for quotes!' });
        }
        return res.json({ reply: 'Basketball at SportyHub:\n\n• Official Size 7 Ball: ₨2,799\n• Training Ball: ₨1,999\n• Hoop Systems: Available on request\n\nAsk me about dribbling, shooting, or defense tips!' });
    }

    if (msg.includes('tennis')) {
        if (msg.includes('racket') || msg.includes('racquet')) {
            return res.json({ reply: 'Tennis Racket Guide:\n\n• Beginner: Carbon Fiber - ₨5,499\n• Intermediate: Graphite - ₨7,999\n• Advanced: Pro Series - ₨12,999\n\nWe also have tennis balls (₨299/3 balls) and grip tape (₨199). Need help choosing?' });
        }
        if (msg.includes('serve') || msg.includes('how to serve')) {
            return res.json({ reply: 'Serve Tips:\n\n• Toss the ball consistently at 12 o\'clock\n• Bend your knees for power\n• Snap your wrist at contact\n• Practice your ball toss first\n• Our training balls are great for serve practice!\n\nNeed more serving techniques?' });
        }
        return res.json({ reply: 'Tennis Equipment:\n\n• Racket: ₨5,499 - ₨12,999\n• Tennis Balls (3 pack): ₨299\n• Grip Tape: ₨199\n• Bag: ₨1,499\n\nAsk about serving, forehand, or backhand techniques!' });
    }

    if (msg.includes('badminton')) {
        if (msg.includes('smash') || msg.includes('how to smash')) {
            return res.json({ reply: 'Smash Tips:\n\n• Get behind the shuttle early\n• Use a full arm swing\n• Snap your wrist at contact\n• Aim for the corners\n• Our Badminton Set (₨2,999) is perfect for practice!\n\nNeed more techniques?' });
        }
        return res.json({ reply: 'Badminton at SportyHub:\n\n• Complete Set (2 rackets + shuttlecocks): ₨2,999\n• Professional Racket: ₨1,999\n• Shuttlecocks (6 pack): ₨399\n\nAsk about smash, drop shot, or net play tips!' });
    }

    if (msg.includes('gym') || msg.includes('workout') || msg.includes('fitness')) {
        if (msg.includes('beginner') || msg.includes('start')) {
            return res.json({ reply: 'Beginner Gym Guide:\n\n• Start with compound exercises (squats, pushups, rows)\n• Focus on form over weight\n• Rest 48 hours between muscle groups\n• Stay hydrated\n• Our Gym Gloves (₨999) protect your hands\n\nNeed a beginner workout plan?' });
        }
        if (msg.includes('gloves')) {
            return res.json({ reply: 'Gym Gloves - ₨999\n\nFeatures:\n• Premium leather material\n• Wrist support strap\n• Breathable mesh back\n• Non-slip palm grip\n• Available in S/M/L/XL\n\nPerfect for weightlifting and cross-training!' });
        }
        return res.json({ reply: 'Gym Equipment:\n\n• Gym Gloves: ₨999\n• Yoga Mat: ₨1,499\n• Resistance Bands: ₨499\n• Water Bottle: ₨299\n\nAsk for workout tips or product details!' });
    }

    if (msg.includes('running') || msg.includes('run') || msg.includes('shoes')) {
        if (msg.includes('shoes')) {
            return res.json({ reply: 'Running Shoes - ₨6,999\n\nFeatures:\n• Lightweight breathable mesh\n• Cushioned sole for impact protection\n• Anti-slip rubber outsole\n• Available sizes: 6-12\n\nPerfect for daily running and marathons!' });
        }
        return res.json({ reply: 'Running Tips:\n\n• Invest in proper running shoes (₨6,999 at SportyHub)\n• Start with run-walk method\n• Increase mileage by 10% weekly\n• Stay hydrated\n• Need a 5K or 10K training plan?' });
    }

    if (msg.includes('yoga')) {
        return res.json({ reply: 'Yoga Mat - ₨1,499\n\nFeatures:\n• Eco-friendly non-slip material\n• 6mm thickness for joint protection\n• 72" x 24" size\n• Easy to clean\n\nPerfect for yoga, pilates, and floor exercises!\n\nNeed beginner yoga poses?' });
    }

    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
        return res.json({ reply: 'SportyHub Price List:\n\n🏏 Cricket Bat: ₨7,999\n⚽ Football: ₨2,499\n🎾 Tennis Racket: ₨5,499\n🏸 Badminton Set: ₨2,999\n🏀 Basketball: ₨2,799\n💪 Gym Gloves: ₨999\n👟 Running Shoes: ₨6,999\n🧘 Yoga Mat: ₨1,499\n\nWhich product interests you?' });
    }

    if (msg.includes('order') || msg.includes('delivery') || msg.includes('shipping')) {
        return res.json({ reply: 'Order & Delivery:\n\n• Add items to cart and checkout\n• Secure payment with credit card\n• Delivery within 3-5 business days\n• Free shipping on orders over ₨5,000\n• Track orders in "My Orders" section\n\nNeed help with an existing order?' });
    }

    if (msg.includes('payment') || msg.includes('pay') || msg.includes('card')) {
        return res.json({ reply: 'Payment Information:\n\n• We accept all major credit cards\n• Secure Stripe payment gateway\n• Test Card: 4242 4242 4242 4242\n• Any future expiry date\n• Any 3-digit CVV\n\nYour payment information is secure with us!' });
    }

    if (msg.includes('forum') || msg.includes('community')) {
        return res.json({ reply: 'SportyHub Community Forum:\n\n• Ask questions about sports\n• Share training tips\n• Discuss matches and tournaments\n• Connect with other sports enthusiasts\n\nClick "Forum" in the sidebar to join the discussion!' });
    }

    if (msg.includes('expert') || msg.includes('pro')) {
        return res.json({ reply: 'Expert Tips Available:\n\n• Sachin Tendulkar on cricket batting\n• Cristiano Ronaldo on football shooting\n• Roger Federer on tennis serve\n• Lin Dan on badminton smash\n• And many more!\n\nVisit the "Expert Tips" section for complete advice from legends!' });
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('help')) {
        return res.json({ reply: 'Hello! I am SportyBot, your sports assistant. I can help you with:\n\n• Product recommendations & prices\n• Training tips & techniques\n• Sports rules & regulations\n• Expert advice\n• Community forum\n\nWhat would you like to know today?' });
    }

    return res.json({ reply: 'I can help you with cricket, football, tennis, badminton, basketball, gym, running, and yoga!\n\nAsk me about:\n• Products & prices\n• Training tips\n• Sports rules\n• Equipment recommendations\n\nWhat sport interests you today?' });
});

// ========== HOME ==========
app.get('/', (req, res) => {
    res.send('Sporty Hub API is running on PostgreSQL!');
});

const startServer = async () => {
    try {
        await prisma.$connect();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log('PostgreSQL connected through Prisma');
        });
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

startServer();
