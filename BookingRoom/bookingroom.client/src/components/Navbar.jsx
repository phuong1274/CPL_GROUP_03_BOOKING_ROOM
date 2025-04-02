import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { token, logout, user, loginAsGuest, isGuest } = useAuth();

    const handleGuestLogin = () => {
        loginAsGuest();
    };

    return (
        <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/booking">Book a Room</Link>
            {token || isGuest ? (
                <>
                    <Link to="/profile" className="avatar">
                        {user?.username || 'Profile'}
                    </Link>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                    <button onClick={handleGuestLogin} className="guest-btn">Continue as Guest</button>
                </>
            )}
        </nav>
    );
}