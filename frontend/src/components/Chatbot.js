import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Hello! 👋 I am SportyBot, your AI sports assistant. Ask me anything about sports equipment, training tips, rules, or fitness advice! 🏏⚽🏀', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check backend status on mount
    useEffect(() => {
        const checkBackend = async () => {
            try {
                await axios.get('http://localhost:5000/');
                setBackendStatus('online');
                console.log('✅ Backend connected');
            } catch (error) {
                setBackendStatus('offline');
                console.log('❌ Backend offline');
            }
        };
        checkBackend();
        // Check every 30 seconds
        const interval = setInterval(checkBackend, 30000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInput('');
        setLoading(true);

        try {
            // First check if backend is reachable
            const healthCheck = await axios.get('http://localhost:5000/');
            console.log('Backend health:', healthCheck.data);
            
            const response = await axios.post('http://localhost:5000/api/chatbot', { message: userMessage });
            setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
        } catch (error) {
            console.error('Chat error details:', error);
            
            let errorMessage = '';
            
            if (error.code === 'ERR_NETWORK') {
                errorMessage = '⚠️ Backend server is not running.\n\nPlease start the backend server:\n1. Open terminal\n2. cd backend\n3. node app.js';
                setBackendStatus('offline');
            } else if (error.response?.status === 500) {
                errorMessage = '⚠️ AI service error. Please check your Gemini API key in backend/app.js';
            } else if (error.response?.status === 404) {
                errorMessage = '⚠️ Chatbot API not found. Please make sure backend has the /api/chatbot route.';
            } else if (error.message) {
                errorMessage = `⚠️ Error: ${error.message}`;
            } else {
                errorMessage = '⚠️ Unable to connect. Please make sure both backend and frontend servers are running.';
            }
            
            setMessages(prev => [...prev, { text: errorMessage, sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const suggestedQuestions = [
        '🏏 Which cricket bat is best for beginners?',
        '⚽ How to improve my football shooting?',
        '🎾 What are the basic rules of tennis?',
        '💪 Best gym exercises for strength?',
        '👟 How to choose the right running shoes?',
        '🏀 How to improve basketball dribbling?'
    ];

    return (
        <>
            {/* Chat Button */}
            <button onClick={() => setIsOpen(!isOpen)} style={styles.chatButton}>
                {isOpen ? '✕' : '💬'}
                {backendStatus === 'offline' && !isOpen && <span style={styles.offlineDot}></span>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={styles.chatWindow}>
                    <div style={styles.chatHeader}>
                        <div style={styles.chatHeaderContent}>
                            <span style={styles.chatIcon}>🤖</span>
                            <div>
                                <h3 style={styles.chatTitle}>SportyBot</h3>
                                <p style={styles.chatSubtitle}>
                                    AI Sports Assistant • 
                                    <span style={backendStatus === 'online' ? styles.onlineText : styles.offlineText}>
                                        {backendStatus === 'online' ? ' Online' : ' Offline'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
                    </div>

                    <div style={styles.chatMessages}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
                                <div style={msg.sender === 'user' ? styles.userBubble : styles.botBubble}>
                                    {msg.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < msg.text.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={styles.botMessage}>
                                <div style={styles.botBubble}>
                                    <span style={styles.typing}>SportyBot is typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && backendStatus === 'online' && (
                        <div style={styles.suggestions}>
                            <p style={styles.suggestTitle}>💡 Suggested questions:</p>
                            <div style={styles.suggestGrid}>
                                {suggestedQuestions.map((q, idx) => (
                                    <button key={idx} onClick={() => setInput(q)} style={styles.suggestBtn}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {backendStatus === 'offline' && (
                        <div style={styles.offlineWarning}>
                            ⚠️ Backend is offline. Please start the server.
                        </div>
                    )}

                    <div style={styles.chatInput}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={backendStatus === 'online' ? "Ask me anything about sports..." : "Backend offline - can't chat"}
                            disabled={backendStatus === 'offline'}
                            style={{...styles.input, ...(backendStatus === 'offline' && styles.inputDisabled)}}
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={loading || backendStatus === 'offline'} 
                            style={{...styles.sendBtn, ...((loading || backendStatus === 'offline') && styles.sendBtnDisabled)}}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const styles = {
    chatButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 1000,
    },
    offlineDot: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#ff4757',
        border: '2px solid white',
    },
    chatWindow: {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '380px',
        height: '550px',
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 25px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif',
    },
    chatHeader: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatHeaderContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    chatIcon: {
        fontSize: '32px',
    },
    chatTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 'bold',
    },
    chatSubtitle: {
        margin: 0,
        fontSize: '11px',
        opacity: 0.8,
    },
    onlineText: {
        color: '#4ade80',
    },
    offlineText: {
        color: '#ff4757',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
    },
    chatMessages: {
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        background: '#f5f5f5',
    },
    userMessage: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '12px',
    },
    botMessage: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '12px',
    },
    userBubble: {
        maxWidth: '80%',
        padding: '10px 15px',
        background: '#667eea',
        color: 'white',
        borderRadius: '18px',
        fontSize: '14px',
        wordWrap: 'break-word',
    },
    botBubble: {
        maxWidth: '80%',
        padding: '10px 15px',
        background: 'white',
        color: '#333',
        borderRadius: '18px',
        fontSize: '14px',
        wordWrap: 'break-word',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        whiteSpace: 'pre-wrap',
    },
    typing: {
        color: '#666',
        fontStyle: 'italic',
    },
    suggestions: {
        padding: '12px',
        borderTop: '1px solid #eee',
        background: '#fafafa',
    },
    suggestTitle: {
        fontSize: '12px',
        color: '#666',
        margin: '0 0 8px 0',
    },
    suggestGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    suggestBtn: {
        padding: '6px 12px',
        background: '#e8e8e8',
        border: 'none',
        borderRadius: '15px',
        fontSize: '11px',
        cursor: 'pointer',
        color: '#333',
    },
    chatInput: {
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #eee',
        background: 'white',
    },
    input: {
        flex: 1,
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '25px',
        outline: 'none',
        fontSize: '14px',
    },
    inputDisabled: {
        background: '#f0f0f0',
        color: '#999',
    },
    sendBtn: {
        width: '42px',
        height: '42px',
        marginLeft: '10px',
        borderRadius: '21px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
    },
    sendBtnDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    offlineWarning: {
        background: '#ff4757',
        color: 'white',
        textAlign: 'center',
        padding: '8px',
        fontSize: '12px',
    },
};

export default Chatbot;