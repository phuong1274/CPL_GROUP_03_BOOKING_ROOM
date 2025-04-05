import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserInfo } from '../services/authService'; // New function in authService
import './style/ChangeUserInfo.css'; // New CSS file for styling

const ChangeUserInfo = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
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
        try {
            // Filter out empty fields to only send updated values
            const updatedData = {};
            Object.keys(formData).forEach(key => {
                if (formData[key].trim() !== '') {
                    updatedData[key] = formData[key];
                }
            });

            if (Object.keys(updatedData).length === 0) {
                setError('Please provide at least one field to update');
                return;
            }

            await updateUserInfo(updatedData);
            setMessage('User information updated successfully! Redirecting to profile...');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to update user information');
            setMessage(null);
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="change-user-info-page">
            <h2>Change User Information</h2>
            {error && <div ref={errorRef} className="error-message1">{error}</div>}
            {message && <div className="success-message1">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group5">
                    <label>New Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current"
                    />
                </div>
                <div className="form-group5">
                    <label>New Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current"
                    />
                </div>
                <div className="form-group5">
                    <label>New Phone Number:</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current"
                    />
                </div>
                <button type="submit" className="change-user-info-link1">Update Information</button>
            </form>
        </div>
    );
};

export default ChangeUserInfo;