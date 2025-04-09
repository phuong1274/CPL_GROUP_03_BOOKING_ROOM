// pages/AddRoom.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AddRoom = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const errorRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Giả lập gửi dữ liệu (thay bằng API thực tế sau)
            console.log('Adding room:', formData);
            setSuccess('Room added successfully! Redirecting to room list...');
            setTimeout(() => {
                navigate('/room-list');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to add room');
            setSuccess(null);
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="add-room-page">
            <h2>Add New Room</h2>
            {error && <div ref={errorRef} className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit} className="add-room-form">
                <div className="form-group">
                    <label>Room Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Image URL:</label>
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="book-now-btn">Add Room</button>
            </form>
        </div>
    );
};

export default AddRoom;