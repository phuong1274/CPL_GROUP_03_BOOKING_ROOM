import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './style/ViewMyBooking.css';

const ViewMyBooking = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const storedBookings = JSON.parse(localStorage.getItem(`bookings_${user?.username}`)) || [];
        setBookings(storedBookings);
    }, [user]);

    return (
        <div className="view-my-booking-page">
            <h2>View My Booking</h2>
            <p>Username: {user?.username}</p>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <ul className="booking-list">
                    {bookings.map((booking) => (
                        <li key={booking.id} className="booking-item">
                            <p>Service: {booking.service}</p>
                            <p>Date: {booking.date}</p>
                            <p>Time: {booking.time}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewMyBooking;