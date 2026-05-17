import React from 'react';

const Test = () => {
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Test Page Working!</h1>
            <p>If you see this, React is working correctly.</p>
            <button onClick={() => window.location.href = '/login'}>Go to Login</button>
        </div>
    );
};

export default Test;