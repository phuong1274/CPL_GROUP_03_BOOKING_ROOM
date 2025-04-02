// components/NavBar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { token, logout } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/booking">Book a Room</Link>
            {token ? (
                <button onClick={logout} className="logout-btn">Logout</button>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}