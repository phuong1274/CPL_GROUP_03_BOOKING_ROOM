import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    RiHomeLine,
    RiHotelLine,
    RiCalendarCheckLine,
    RiUserLine,
    RiDoorOpenLine,
    RiListSettingsLine,
    RiFileChartLine,
    RiLogoutBoxLine,
    RiMenu3Line,
} from 'react-icons/ri';
import './style/Navbar.css';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
    const { token, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide Navbar on specific routes
    if (
        location.pathname.startsWith('/login') ||
        location.pathname.startsWith('/register') ||
        location.pathname.startsWith('/forgot-password') ||
        location.pathname.startsWith('/reset-password')
    ) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
        toggleSidebar(); // Close sidebar after logout
    };

    const handleNavigation = (path) => {
        navigate(path);
        toggleSidebar(); // Close sidebar on mobile after navigation
    };

    const isCustomer = token && !isAdmin();
    const isAdminUser = token && isAdmin();

    return (
        <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <div className="sidebar-brand">
                <RiMenu3Line
                    className="sidebar-hamburger-icon"
                    onClick={toggleSidebar}
                    aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                />
                <h3>Hotel Booking</h3>
            </div>
            <div className="sidebar-links">
                {isCustomer && (
                    <>
                        <button
                            onClick={() => handleNavigation('/')}
                            className="sidebar-button"
                            aria-label="Navigate to Home"
                        >
                            <RiHomeLine className="sidebar-icon" />
                            <span>Home</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/available-rooms')}
                            className="sidebar-button"
                            aria-label="Navigate to Available Rooms"
                        >
                            <RiHotelLine className="sidebar-icon" />
                            <span>Available Rooms</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/my-booking')}
                            className="sidebar-button"
                            aria-label="Navigate to My Bookings"
                        >
                            <RiCalendarCheckLine className="sidebar-icon" />
                            <span>My Bookings</span>
                        </button>

                        <button
                            onClick={() => navigate('/update-profile')}
                            className="sidebar-button"
                            aria-label="Navigate to User Profile"
                        >
                            <RiUserLine className="sidebar-icon" />
                            <span>UserProfile</span>
                        </button>
                    </>
                )}
                {isAdminUser && (
                    <>
                        <button
                            onClick={() => handleNavigation('/users')}
                            className="sidebar-button"
                            aria-label="Navigate to User List"
                        >
                            <RiUserLine className="sidebar-icon" />
                            <span>User List</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/rooms')}
                            className="sidebar-button"
                            aria-label="Navigate to Room List"
                        >
                            <RiDoorOpenLine className="sidebar-icon" />
                            <span>Room List</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/room-types')}
                            className="sidebar-button"
                            aria-label="Navigate to Room Types"
                        >
                            <RiListSettingsLine className="sidebar-icon" />
                            <span>Room Types</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/booking')}
                            className="sidebar-button"
                            aria-label="Navigate to Bookings"
                        >
                            <RiCalendarCheckLine className="sidebar-icon" />
                            <span>Bookings</span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/revenue-report')}
                            className="sidebar-button"
                            aria-label="Navigate to Revenue Report"
                        >
                            <RiFileChartLine className="sidebar-icon" />
                            <span>Revenue Report</span>
                        </button>
                    </>
                )}
                {token && (
                    <button
                        onClick={handleLogout}
                        className="sidebar-button logout-button"
                        aria-label="Logout"
                    >
                        <RiLogoutBoxLine className="sidebar-icon" />
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;