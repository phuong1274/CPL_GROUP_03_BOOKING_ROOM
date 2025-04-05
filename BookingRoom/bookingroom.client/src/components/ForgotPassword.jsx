import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/authService'; // Hàm mới trong authService

const ForgotPassword = () => {
    const [input, setInput] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const errorRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword({ login: input }); // Gửi email hoặc số điện thoại
            setMessage('A reset link has been sent to your email/phone.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
            setMessage(null);
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="forgot-password-page">
            <h2>Forgot Password</h2>
            {error && <div ref={errorRef} className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email or Phone Number:</label>
                    <input
                        type="text"
                        name="login"
                        value={input}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="book-now-btn">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;