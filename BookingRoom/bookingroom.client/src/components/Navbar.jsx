import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { token, logout, user } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/room-list">Room List</Link>
            {token ? (
                <>
                    <Link to="/profile" className="avatar">
                        {user?.username || 'Profile'}
                    </Link>
                    <Link to="/add-room">Add Room</Link>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}