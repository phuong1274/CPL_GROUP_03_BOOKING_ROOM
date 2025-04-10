// pages/Booking.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';

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
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const today = new Date();
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);

        // Validate check-in date (not in the past)
        if (checkInDate < today.setHours(0, 0, 0, 0)) {
            return 'Check-in date cannot be in the past.';
        }

        // Validate check-out date (must be after check-in)
        if (checkOutDate <= checkInDate) {
            return 'Check-out date must be after check-in date.';
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return 'Please enter a valid email address.';
        }

        // Validate phone number (basic validation for digits and length)
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(formData.phone)) {
            return 'Please enter a valid phone number (10-15 digits).';
        }

        return null; // No errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        //if (!token) {
        //    setError('Please log in to make a booking.');
        //    setIsLoading(false);
        //    return;
        //}

        // Validate form data
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            return;
        }

        try {
            // Simulate API call to book a room
            console.log('Booking Data:', { ...formData, token });
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="booking-page">
            <h1>Book Your Stay</h1>
            <p>Experience luxury at its finest. Fill in the details below to reserve your room.</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <BookingForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Booking;