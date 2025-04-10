import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import './style/ForgotPassword.css'; // Import CSS

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
        <div className="forgot-password-container">
            {/* Phần hình nền bên trái */}
            <div className="forgot-password-background"></div>

            {/* Phần form quên mật khẩu bên phải */}
            <div className="forgot-password-page">
                <h2>Forgot Password</h2>
                {error && <div ref={errorRef} className="error-message5">{error}</div>}
                {message && <div className="success-message5">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-groupp">
                        <label>Email or Phone Number:</label>
                        <input
                            type="text"
                            name="login"
                            value={input}
                            onChange={handleChange}
                            placeholder="Email or Phone Number"
                            required
                        />
                    </div>
                    <button type="submit" className="book-now-btn5">
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;