import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './style/Navbar.css';

const Navbar = () => {
    const { token, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide Navbar on login and register routes (including nested routes)
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isCustomer = token && !isAdmin();
    const isAdminUser = token && isAdmin();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h3>Hotel Booking</h3>
            </div>
            <div className="navbar-links">
                {/* Add Home button, visible to all users */}
                <button
                    onClick={() => navigate('/')}
                    className="nav-button"
                    aria-label="Navigate to Home"
                >
                    Home
                </button>

                {isCustomer && (
                    <>
                        <button
                            onClick={() => navigate('/available-rooms')}
                            className="nav-button"
                            aria-label="Navigate to Available Rooms"
                        >
                            Available Rooms
                        </button>
                        <button
                            onClick={() => navigate('/my-booking')}
                            className="nav-button"
                            aria-label="Navigate to My Bookings"
                        >
                            My Bookings
                        </button>
                    </>
                )}
                {isAdminUser && (
                    <>
                        <button
                            onClick={() => navigate('/users')}
                            className="nav-button"
                            aria-label="Navigate to User List"
                        >
                            User List
                        </button>
                        <button
                            onClick={() => navigate('/rooms')}
                            className="nav-button"
                            aria-label="Navigate to Room List"
                        >
                            Room List
                        </button>
                        <button
                            onClick={() => navigate('/room-types')}
                            className="nav-button"
                            aria-label="Navigate to Room Types"
                        >
                            Room Types
                        </button>
                        <button onClick={() => navigate('/booking')}
                            className="nav-button"
                            aria-label="Navigate to Bookings"
                        >
                            Bookings
                        </button>
                        <button
                            onClick={() => navigate('/revenue-report')}
                            className="nav-button"
                            aria-label="Navigate to Revenue Report"
                        >
                            Revenue Report
                        </button>
                    </>
                )}
                {token && (
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                        aria-label="Logout"
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;