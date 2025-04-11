import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

export default function Navbar() {
    const { token, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isCustomer = token && !isAdmin();
    const isAdminUser = token && isAdmin();

    return (
        <nav className="navbar">
            <div className="navbar-content">
                {token ? (
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                ) : (
                    <Link to="/login">Login</Link>
                )}
                <div className="menu-toggle" onClick={toggleMenu}>
                    <span className="hamburger-icon">☰</span> {/* Hamburger icon */}
                </div>
                {isMenuOpen && (
                    <div className="dropdown-menu">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        {isCustomer && (
                            <>
                                <Link to="/available-rooms" onClick={() => setIsMenuOpen(false)}>Available Rooms</Link>
                                <Link to="/my-booking" onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
                            </>
                        )}
                        {isAdminUser && (
                            <>
                                <Link to="/users" onClick={() => setIsMenuOpen(false)}>User List</Link>
                                <Link to="/rooms" onClick={() => setIsMenuOpen(false)}>Room List</Link>
                                <Link to="/room-types" onClick={() => setIsMenuOpen(false)}>Room Types</Link>
                                <Link to="/booking" onClick={() => setIsMenuOpen(false)}>Bookings</Link>
                                <Link to="/revenue-report" onClick={() => setIsMenuOpen(false)}>Revenue Report</Link>
                            </>
                        )}
                        {!token && (
                            <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}