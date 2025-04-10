import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './styles/UserProfile.css';

const UserProfile = () => {
    const { user } = useAuth();

    return (
        <div className="user-profile-page">
            <h2>User Profile</h2>
            <p>Username: {user?.username}</p>
            <p>Full Name: {user?.fullName}</p>
            <p>Email: {user?.email}</p>
            <p>Phone Number: {user?.phoneNumber}</p>
            <div className="profile-links">
                <Link to="/change-user-info" className="change-user-info-link">Change user profile?</Link>
                <Link to="/change-password" className="book-link1">Change Password</Link>
            </div>
        </div>
    );
};

export default UserProfile;