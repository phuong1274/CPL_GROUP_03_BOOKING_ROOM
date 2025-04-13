import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiMenu3Line } from 'react-icons/ri';
import './style/Header.css';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleNavigateUserProfile = () => {
        navigate('/update-profile');
    };

    return (
        <header className="header">
            <div className="header-menu">
                <RiMenu3Line
                    className="hamburger-icon"
                    onClick={toggleSidebar}
                    aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                />
                <h3 className="header-title">Hotel Booking</h3> {/* Add Hotel Booking title */}
            </div>
            {/*<div className="header-contact">*/}
            {/*    <span className="contact-item">*/}
            {/*        <i className="bi bi-telephone-fill"></i> + 84 234 567 889*/}
            {/*    </span>*/}
            {/*    <span className="contact-item">*/}
            {/*        <i className="bi bi-envelope-fill"></i> BookingRoomG3@gmail.com*/}
            {/*    </span>*/}
            {/*</div>*/}
            <div className="header-links">
                {user ? (
                    <span className="user-name" onClick={handleNavigateUserProfile}>
                        {user.fullName || user.username}
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