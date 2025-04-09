import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

const Booking = () => {
    const { token } = useAuth();
    const location = useLocation();
    const { bookingData = {}, selectedRoom = {} } = location.state || {};

    const [formData, setFormData] = useState({
        checkIn: bookingData.checkIn || '',
        checkOut: bookingData.checkOut || '',
        roomNumber: bookingData.roomNumber || 1,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const today = new Date();
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);

        if (checkInDate < today.setHours(0, 0, 0, 0)) {
            return 'Check-in date cannot be in the past.';
        }

        if (checkOutDate <= checkInDate) {
            return 'Check-out date must be after check-in date.';
        }

        return null;
    };

    const handleSubmit = async (e, updatedFormData) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            return;
        }

        try {
            console.log('Booking Data:', { ...updatedFormData, token });
            setSuccess('Booking successful! We will contact you shortly.');
            setError(null);
            setFormData({
                checkIn: '',
                checkOut: '',
                roomNumber: 1,
            });
        } catch (err) {
            setError('Booking failed. Please try again.');
            setSuccess(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="booking-page-new">
            <div className="booking-container">
                <div className="booking-image">
                    <img src={selectedRoom.image || "https://landmark72.intercontinental.com/wp-content/uploads/2-1.jpg"} alt="Room" />
                </div>
                <div className="booking-details">
                    <h1>Book Your Stay</h1>
                    {selectedRoom.name && <h2>{selectedRoom.name}</h2>}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <BookingForm
                        formData={formData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        initialRoomNumber={formData.roomNumber}
                    />
                </div>
            </div>
        </div>
    );
};

export default Booking;