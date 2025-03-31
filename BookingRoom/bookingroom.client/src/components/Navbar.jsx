// components/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/Navbar.css';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo">
                    <Link to="/" className="logo-link">
                        Hotel Name
                    </Link>
                </div>

                {/* Hamburger Menu */}
                <div className="hamburger" onClick={toggleMenu}>
                    ☰
                </div>

                {/* Navigation Links */}
                <div className={`nav-links ${isOpen ? 'open' : ''}`}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/rooms" className="nav-link">Rooms</Link>
                    <Link to="/booking" className="nav-link">Booking</Link>
                    <Link to="/login" className="nav-link">Login</Link>
                </div>

                {/* Book Now Button */}
                <div>
                    <Link to="/booking" className="book-now-btn">Book Now</Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;