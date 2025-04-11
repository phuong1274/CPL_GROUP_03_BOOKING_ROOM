<<<<<<< HEAD
﻿import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BookingForm = ({ formData, handleChange, handleSubmit, isLoading, initialRoomNumber }) => {
    const { user, token } = useAuth();
    const [roomNumber, setRoomNumber] = useState(initialRoomNumber || 1);
    const [guestData, setGuestData] = useState(
        Array.from({ length: initialRoomNumber || 1 }, () => ({ adults: 0, children: 0 }))
    );
    const [contactData, setContactData] = useState({
        name: token ? user?.fullName || '' : '',
        email: token ? user?.email || '' : '',
        phoneNumber: token ? user?.phoneNumber || '' : '',
    });

    const handleRoomNumberChange = (delta) => {
        const newRoomNumber = Math.max(1, roomNumber + delta);
        setRoomNumber(newRoomNumber);
        setGuestData((prev) => {
            const newGuestData = [...prev];
            if (newRoomNumber > prev.length) {
                for (let i = prev.length; i < newRoomNumber; i++) {
                    newGuestData.push({ adults: 0, children: 0 });
                }
            } else {
                newGuestData.length = newRoomNumber;
            }
            return newGuestData;
        });
    };

    const handleGuestChange = (index, type, value) => {
        setGuestData((prev) => {
            const newGuestData = [...prev];
            // Đảm bảo giá trị không âm
            newGuestData[index][type] = Math.max(0, parseInt(value) || 0);
            return newGuestData;
        });
    };

    const handleContactChange = (e) => {
        setContactData({ ...contactData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const updatedFormData = {
            ...formData,
            roomNumber,
            guests: guestData,
            ...(!token && { contact: contactData }),
        };
        handleSubmit(e, updatedFormData);
    };

    return (
        <form className="booking-form-new" onSubmit={handleFormSubmit}>
            <div className="form-group">
=======
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
>>>>>>> origin/Manh_Hai
                <label>Check-In Date</label>
                <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                />
            </div>
<<<<<<< HEAD
            <div className="form-group">
=======

            <div className="form-group3">
>>>>>>> origin/Manh_Hai
                <label>Check-Out Date</label>
                <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                />
            </div>
<<<<<<< HEAD
            <div className="form-group room-number-group">
                <label>Room</label>
                <div className="room-number-selector">
                    <span>{roomNumber}</span>
                    <div className="room-number-controls">
                        <button type="button" onClick={() => handleRoomNumberChange(-1)}>-</button>
                        <button type="button" onClick={() => handleRoomNumberChange(1)}>+</button>
                    </div>
                </div>
            </div>
            {Array.from({ length: roomNumber }, (_, index) => (
                <div key={index} className="form-group guest-group">
                    <label>{roomNumber === 1 ? 'Guests' : `Room ${index + 1}: Guests`}</label>
                    <div className="guest-inputs">
                        <div className="guest-control">
                            <span>Adults</span>
                            <input
                                type="number"
                                min="0"
                                value={guestData[index].adults}
                                onChange={(e) => handleGuestChange(index, 'adults', e.target.value)}
                            />
                        </div>
                        <div className="guest-control">
                            <span>Children</span>
                            <input
                                type="number"
                                min="0"
                                value={guestData[index].children}
                                onChange={(e) => handleGuestChange(index, 'children', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}
            {!token && (
                <>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={contactData.name}
                            onChange={handleContactChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={contactData.email}
                            onChange={handleContactChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={contactData.phoneNumber}
                            onChange={handleContactChange}
                            required
                        />
                    </div>
                </>
            )}
            <button type="submit" className="book-now-btn-new" disabled={isLoading}>
                {isLoading ? 'Booking...' : 'Book Now'}
=======

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
>>>>>>> origin/Manh_Hai
            </button>
        </form>
    );
};

export default BookingForm;