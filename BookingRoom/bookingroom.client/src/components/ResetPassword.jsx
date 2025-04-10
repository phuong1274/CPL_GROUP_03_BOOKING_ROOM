import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../services/authService'; // Hàm mới trong authService

const ResetPassword = () => {
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const errorRef = useRef(null);
    const navigate = useNavigate();
    const { token } = useParams(); // Lấy token từ URL

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await resetPassword({ token, password: formData.newPassword });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
            setMessage(null);
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="reset-password-page">
            <h2>Create New Password</h2>
            {error && <div ref={errorRef} className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>New Password:</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="book-now-btn">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;