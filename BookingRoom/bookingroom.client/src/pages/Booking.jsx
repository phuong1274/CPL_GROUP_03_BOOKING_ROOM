import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './styles/Booking.css';

const Booking = () => {
    const { token } = useAuth(); // Check if user is logged in
    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        roomType: '',
        guests: '',
        fullName: '',
        email: '',
        phone: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError('Please log in to make a booking.');
            return;
        }

        try {
            // Simulate API call to book a room
            console.log('Booking Data:', formData);
            setSuccess('Booking successful! We will contact you shortly.');
            setError(null);
            setFormData({
                checkIn: '',
                checkOut: '',
                roomType: '',
                guests: '',
                fullName: '',
                email: '',
                phone: '',
            });
        } catch (err) {
            setError('Booking failed. Please try again.');
            setSuccess(null);
        }
    };

    return (
        <div className="booking-page">
            <h1>Book Your Stay</h1>
            <p>Experience luxury at its finest. Fill in the details below to reserve your room.</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form className="booking-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Check-In Date</label>
                    <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Check-Out Date</label>
                    <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Room Type</label>
                    <select
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Room Type</option>
                        <option value="junior-suite">Junior Suite</option>
                        <option value="premier-suite">Premier Suite</option>
                        <option value="ambassador-suite">Ambassador Suite</option>
                        <option value="royal-suite">Royal Suite</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Number of Guests</label>
                    <select
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select</option>
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4+ Guests</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="book-now-btn">Confirm Booking</button>
            </form>
        </div>
    );
};

export default Booking;