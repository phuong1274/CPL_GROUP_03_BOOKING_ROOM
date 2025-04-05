import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService';
import './style/ChangePassword.css'// Hàm mới trong authService
//import api from '../services/api'; // Sử dụng Axios instance có token

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const errorRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }
        try {
            await changePassword(formData);
            setMessage('Password changed successfully! Redirecting to profile...');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to change password');
            setMessage(null);
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="change-password-page">
            <h2>Change Password</h2>
            {error && <div ref={errorRef} className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group4">
                    <label>Old Password:</label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group4">
                    <label>New Password:</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group4">
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="book-now-btn2">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePassword;