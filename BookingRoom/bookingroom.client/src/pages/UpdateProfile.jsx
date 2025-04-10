import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

const UpdateProfile = () => {
    const { user, token, login, logout } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        phoneNumber: '',
        email: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Đồng bộ formData với user khi user thay đổi
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                email: user.email || '',
            });
        }
    }, [user]);

    // Kiểm tra token
    useEffect(() => {
        if (!token) {
            setError('You need to log in to edit your profile.');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await updateProfile(formData);
            const updatedUser = {
                ...user,
                username: response.user.username || formData.username,
                fullName: response.user.fullName || formData.fullName,
                phoneNumber: response.user.phoneNumber || formData.phoneNumber,
                email: response.user.email || formData.email,
            };
            login(token, updatedUser);

            setSuccess(response.message); // Lấy thông báo từ backend
            setTimeout(() => navigate('/'), 2000); // Chuyển về Home sau 2 giây
        } catch (err) {
            if (err.error === 'Unauthorized: Please log in again.') {
                setError('Session expired. Redirecting to login...');
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                setError(err.error || err.message || 'Failed to update profile');
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Edit Profile</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                        required
                    />
                </div>
                <div>
                    <label>Full Name:</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                        required
                    />
                </div>
                <div>
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', width: '100%' }}>
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px',
                        width: '100%',
                        marginTop: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'blue',
                        cursor: 'pointer',
                    }}
                >
                    Back to Home
                </button>
            </form>
        </div>
    );
};

export default UpdateProfile;