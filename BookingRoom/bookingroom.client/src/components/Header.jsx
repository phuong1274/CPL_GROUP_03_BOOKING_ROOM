import React from 'react';
import { Link } from 'react-router-dom';
import './style/Header.css'; // Adjust the path based on your project structure

const Header = () => {
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
                <Link to="/login" className="header-link">Login</Link>
                <span className="separator">|</span>
                <Link to="/register" className="header-link">Sign Up</Link>
            </div>
        </header>
    );
};

export default Header;