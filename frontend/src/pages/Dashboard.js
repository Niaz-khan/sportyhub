import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { featureFlags } from '../config/features';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        forumTopics: 0,
        blogPosts: 0
    });
    const navigate = useNavigate();

    const fetchDashboardStats = useCallback(async () => {
        if (!user?.id) return;

        try {
            const products = await fetch('http://localhost:5000/api/products').then(res => res.json());
            const orders = featureFlags.orders
                ? await fetch(`http://localhost:5000/api/orders/${user.id}`).then(res => res.json())
                : [];
            const topics = featureFlags.forum
                ? await fetch('http://localhost:5000/api/forum/topics').then(res => res.json())
                : [];
            const blogs = featureFlags.blog
                ? await fetch('http://localhost:5000/api/blogs').then(res => res.json())
                : [];

            setStats({
                products: products.length,
                orders: orders.length,
                forumTopics: topics.length,
                blogPosts: blogs.length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            navigate('/login');
        } else {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchDashboardStats();
        }
    }, [user, fetchDashboardStats]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <h2>Loading Dashboard...</h2>
            </div>
        );
    }

    const menuItems = [
        { icon: 'Products', name: 'Products', path: '/products', description: 'Browse and shop sports equipment' },
        { icon: 'Cart', name: 'Cart', path: '/cart', description: 'View your shopping cart' },
        { icon: 'Pro', name: 'Expert Tips', path: '/expert', description: featureFlags.expertAdvice ? 'Advice from professionals' : 'Premium members only', locked: !featureFlags.expertAdvice },
        { icon: 'Forum', name: 'Forum', path: '/forum', description: featureFlags.forum ? 'Community discussions' : 'Premium members only', locked: !featureFlags.forum },
        { icon: 'Blog', name: 'Blog', path: '/blog', description: featureFlags.blog ? 'Latest sports articles' : 'Premium members only', locked: !featureFlags.blog },
        { icon: 'Orders', name: 'Orders', path: '/orders', description: featureFlags.orders ? 'Order history' : 'Premium members only', locked: !featureFlags.orders },
        { icon: 'AI', name: 'AI Assistant', path: '#', description: featureFlags.chatbot ? 'Chat with SportyBot' : 'Premium members only', locked: !featureFlags.chatbot }
    ];

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.logoContainer}>
                    <span style={styles.logoIcon}>SH</span>
                    <span style={styles.logoText}>Sporty<span style={{ color: '#ff9800' }}>Hub</span></span>
                </div>

                <div style={styles.userInfo}>
                    <div style={styles.userAvatar}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style={styles.userDetails}>
                        <h4 style={styles.userName}>Welcome, {user.name || user.email}</h4>
                        <p style={styles.userEmail}>{user.email}</p>
                        <span style={styles.userBadge}>Sports Enthusiast</span>
                    </div>
                </div>

                <nav style={styles.navMenu}>
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            style={styles.navItem}
                            onClick={() => item.path !== '#' ? navigate(item.path) : null}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            <div style={styles.navContent}>
                                <span style={styles.navName}>{item.name}</span>
                                <span style={styles.navDesc}>{item.description}</span>
                            </div>
                            {item.locked && <span style={styles.lockBadge}>Premium</span>}
                        </div>
                    ))}
                </nav>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <span>Exit</span>
                    <span>Logout</span>
                </button>
            </div>

            <div style={styles.mainContent}>
                <div style={styles.welcomeHeader}>
                    <div>
                        <h1 style={styles.welcomeTitle}>
                            Welcome to <span style={{ color: '#667eea' }}>SportyHub</span>
                        </h1>
                        <p style={styles.welcomeSubtitle}>Your complete sports equipment destination</p>
                    </div>
                    <div style={styles.dateTime}>
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: '#e3f2fd', color: '#1976d2' }}>P</div>
                        <div>
                            <h3 style={styles.statNumber}>{stats.products}</h3>
                            <p style={styles.statLabel}>Products Available</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: '#e8f5e9', color: '#388e3c' }}>O</div>
                        <div>
                            <h3 style={styles.statNumber}>{stats.orders}</h3>
                            <p style={styles.statLabel}>{featureFlags.orders ? 'Orders Completed' : 'Premium Orders Locked'}</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: '#fff3e0', color: '#f57c00' }}>F</div>
                        <div>
                            <h3 style={styles.statNumber}>{stats.forumTopics}</h3>
                            <p style={styles.statLabel}>{featureFlags.forum ? 'Forum Discussions' : 'Forum Locked'}</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: '#fce4ec', color: '#c2185b' }}>B</div>
                        <div>
                            <h3 style={styles.statNumber}>{stats.blogPosts}</h3>
                            <p style={styles.statLabel}>{featureFlags.blog ? 'Blog Articles' : 'Blog Locked'}</p>
                        </div>
                    </div>
                </div>

                <div style={styles.sectionTitle}>
                    <h2>Quick Actions</h2>
                    <p>Explore what SportyHub has to offer</p>
                </div>

                <div style={styles.quickActionsGrid}>
                    <div style={styles.actionCard} onClick={() => navigate('/products')}>
                        <span style={styles.actionIcon}>Shop</span>
                        <h3>Shop Now</h3>
                        <p>Browse our collection of sports equipment</p>
                    </div>
                    <div style={styles.actionCard} onClick={() => navigate('/expert')}>
                        <span style={styles.actionIcon}>Pro</span>
                        <h3>{featureFlags.expertAdvice ? 'Expert Advice' : 'Unlock Expert Advice'}</h3>
                        <p>{featureFlags.expertAdvice ? 'Get tips from professional athletes' : 'Premium upgrade required for athlete guidance'}</p>
                    </div>
                    <div style={styles.actionCard} onClick={() => navigate('/forum')}>
                        <span style={styles.actionIcon}>Talk</span>
                        <h3>{featureFlags.forum ? 'Join Forum' : 'Unlock Community Forum'}</h3>
                        <p>{featureFlags.forum ? 'Connect with fellow sports enthusiasts' : 'Premium upgrade required for discussions'}</p>
                    </div>
                    <div style={styles.actionCard} onClick={() => navigate('/blog')}>
                        <span style={styles.actionIcon}>Read</span>
                        <h3>{featureFlags.blog ? 'Read Blog' : 'Unlock Premium Blog'}</h3>
                        <p>{featureFlags.blog ? 'Latest sports news and articles' : 'Premium upgrade required for full articles'}</p>
                    </div>
                </div>

                <div style={styles.sectionTitle}>
                    <h2>Recent Activity</h2>
                    <p>Your latest interactions</p>
                </div>

                <div style={styles.activityCard}>
                    <div style={styles.activityItem}>
                        <span style={styles.activityIcon}>OK</span>
                        <div>
                            <p style={styles.activityText}>Welcome to SportyHub! Start exploring our products.</p>
                            <p style={styles.activityTime}>Just now</p>
                        </div>
                    </div>
                    <div style={styles.activityItem}>
                        <span style={styles.activityIcon}>New</span>
                        <div>
                            <p style={styles.activityText}>Discover our wide range of sports equipment</p>
                            <p style={styles.activityTime}>Today</p>
                        </div>
                    </div>
                    <div style={styles.activityItem}>
                        <span style={styles.activityIcon}>Pro</span>
                        <div>
                            <p style={styles.activityText}>
                                {featureFlags.expertAdvice
                                    ? 'Check out expert tips from professional athletes'
                                    : 'Premium features are currently locked for standard users'}
                            </p>
                            <p style={styles.activityTime}>Today</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        background: '#f0f2f5',
    },
    sidebar: {
        width: '300px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '25px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    logoIcon: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: '#ff9800',
        color: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    logoText: {
        fontSize: '24px',
        fontWeight: 'bold',
    },
    userInfo: {
        padding: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    userAvatar: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: '#667eea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        margin: 0,
        fontSize: '14px',
        fontWeight: 'normal',
    },
    userEmail: {
        margin: '5px 0',
        fontSize: '12px',
        opacity: 0.7,
    },
    userBadge: {
        fontSize: '10px',
        background: '#ff9800',
        padding: '2px 8px',
        borderRadius: '10px',
        display: 'inline-block',
    },
    navMenu: {
        flex: 1,
        padding: '20px 0',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '12px 25px',
        cursor: 'pointer',
        transition: 'background 0.3s',
    },
    navIcon: {
        minWidth: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    navContent: {
        flex: 1,
    },
    navName: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '4px',
    },
    navDesc: {
        fontSize: '11px',
        opacity: 0.6,
    },
    lockBadge: {
        fontSize: '10px',
        fontWeight: 'bold',
        background: '#ff9800',
        color: '#1a1a2e',
        padding: '4px 8px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
    },
    logoutBtn: {
        margin: '20px',
        padding: '12px',
        background: '#ff4757',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    mainContent: {
        flex: 1,
        marginLeft: '300px',
        padding: '30px',
    },
    welcomeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    welcomeTitle: {
        margin: 0,
        fontSize: '28px',
        color: '#1a1a2e',
    },
    welcomeSubtitle: {
        margin: '10px 0 0',
        color: '#666',
    },
    dateTime: {
        color: '#666',
        fontSize: '14px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
    },
    statCard: {
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    statNumber: {
        margin: 0,
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    statLabel: {
        margin: 0,
        fontSize: '13px',
        color: '#666',
    },
    sectionTitle: {
        marginBottom: '20px',
    },
    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
    },
    actionCard: {
        background: 'white',
        padding: '25px',
        borderRadius: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    actionIcon: {
        width: '58px',
        height: '58px',
        margin: '0 auto 15px',
        borderRadius: '16px',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 'bold',
    },
    activityCard: {
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
    },
    activityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px 0',
        borderBottom: '1px solid #eee',
    },
    activityIcon: {
        minWidth: '48px',
        height: '48px',
        borderRadius: '14px',
        background: '#eef2ff',
        color: '#1d4ed8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    activityText: {
        margin: 0,
        color: '#333',
    },
    activityTime: {
        margin: '5px 0 0',
        fontSize: '12px',
        color: '#999',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
    },
    loadingSpinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px',
    },
};

const styleElement = document.createElement('style');
styleElement.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleElement);

export default Dashboard;
