import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const { user } = useAuth();

    return (
        <div className="user-profile-page">
            <h2>User Profile</h2>
            <p>Username: {user?.username}</p>
            <p>Full Name: {user?.fullName}</p>
            <p>Email: {user?.email}</p>
            <p>Phone Number: {user?.phoneNumber}</p>
            <Link to="/change-password" className="book-link">Change Password</Link>
        </div>
    );
};

export default UserProfile;