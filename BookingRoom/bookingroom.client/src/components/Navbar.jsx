import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './style/NavBar.css'; // Sửa đường dẫn CSS

const NavBar = () => {
    const { token, logout, user, loginAsGuest, isGuest } = useAuth();
    const navigate = useNavigate();

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/'); // Chuyển đến trang User sau khi đăng nhập guest
    };

    const handleLogout = () => {
        logout();
        navigate('/home'); // Chuyển đến trang Home sau khi đăng xuất
    };

    return (
        <nav className="navbar">

            <Link to="/home">Home</Link>
            <Link to="/booking">Book a Room</Link>

            {(token || isGuest) ? (
                <>
                    <Link to="/">Dashboard</Link>
                    <Link to="/profile" className="avatar">
                        {user?.username || 'Profile'} {isGuest && '(Guest)'}
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link to="/register">Register</Link>
                    <Link to="/login">Login</Link>
                    <button onClick={handleGuestLogin} className="guest-btn">
                        Continue as Guest
                    </button>
                </>
            )}

        </nav>
    );
};

export default NavBar;
