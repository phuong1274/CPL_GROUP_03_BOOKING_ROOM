// components/BookingForm.jsx
import React from 'react';
import './style/BookingForm.css';

const BookingForm = ({
    formData = {
        checkIn: '',
        checkOut: '',
        roomType: '',
        guests: '',
        fullName: '',
        email: '',
        phone: ''
    },
    handleChange = () => { },
    handleSubmit = () => { },
    isLoading = false
}) => {
    const roomOptions = [
        { value: 'junior-suite', label: 'Junior Suite' },
        { value: 'premier-suite', label: 'Premier Suite' },
        { value: 'ambassador-suite', label: 'Ambassador Suite' },
        { value: 'royal-suite', label: 'Royal Suite' },
    ];

    const guestOptions = [
        { value: '1', label: '1 Guest' },
        { value: '2', label: '2 Guests' },
        { value: '3', label: '3 Guests' },
        { value: '4', label: '4+ Guests' },
    ];

    return (
        <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-group3">
                <label>Check-In Date</label>
                <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group3">
                <label>Check-Out Date</label>
                <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group3">
                <label>Room Type</label>
                <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Room Type</option>
                    {roomOptions.map((room) => (
                        <option key={room.value} value={room.value}>
                            {room.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group3">
                <label>Number of Guests</label>
                <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select</option>
                    {guestOptions.map((guest) => (
                        <option key={guest.value} value={guest.value}>
                            {guest.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group3">
                <label>Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group3">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group3">
                <label>Phone Number</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit" className="book-now-btn3" disabled={isLoading}>
                {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
        </form>
    );
};

export default BookingForm;