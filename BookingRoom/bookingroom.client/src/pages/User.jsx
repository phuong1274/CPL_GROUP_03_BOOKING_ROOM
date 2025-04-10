import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './styles/User.css';

const User = () => {
    const { user, token, isGuest } = useAuth();

    return (
        <div className="user-page">
            <h2>Welcome, {user?.username}!</h2>
            <p>{isGuest ? 'You are logged in as a Guest.' : 'You are logged in with a token.'}</p>
            <div className="user-options">
                <Link to="/profile" className="user-link">User Profile</Link>
                <Link to="/view-my-booking" className="user-link">View My Booking</Link>
                <Link to="/view-revenu" className="user-link">View Revenue</Link>
            </div>
        </div>
    );
};

export default User;