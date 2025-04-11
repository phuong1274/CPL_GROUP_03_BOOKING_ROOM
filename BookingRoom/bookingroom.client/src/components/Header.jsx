import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust the path based on your project structure
import './style/Header.css'; // Adjust the path based on your project structure

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to home page after logout
    };

    return (
        <header className="header">
            <div className="header-contact">
                <span className="contact-item">
                    <i className="bi bi-telephone-fill"></i> + 84 234 567 889
                </span>
                <span className="contact-item">
                    <i className="bi bi-envelope-fill"></i> BookingRoomG3@gmail.com
                </span>
            </div>
            <div className="header-links">
                {user ? (
                    <span className="user-name" onClick={handleLogout}>
                        {user.fullName || user.username} {/* Display fullName if available, otherwise username */}
                    </span>
                ) : (
                    <>
                        <Link to="/login" className="header-link">Login</Link>
                        <span className="separator">|</span>
                        <Link to="/register" className="header-link">Sign Up</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;