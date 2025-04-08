import React, { useEffect, useState } from 'react'; // Add React import
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setLogoutCallback } from './services/api';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import RoomList from './pages/RoomList';
import RoomType from './pages/RoomType';
import AddRoom from './pages/AddRoom';
import EditRoom from './pages/EditRoom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import BookingList from './pages/BookingList';
import './App.css';

// ErrorBoundary Component to catch rendering errors
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Rendering error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div className="error-message">Something went wrong. Please try again later.</div>;
        }
        return this.props.children;
    }
}

// 404 Page Component
function NotFound() {
    return (
        <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
}

// Navbar Component
function Navbar() {
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

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h3>Hotel Booking</h3>
            </div>
            <div className="navbar-links">
                {token && isAdmin() && (
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
                        <button
                            onClick={() => navigate('/booking')}
                            className="nav-button"
                            aria-label="Navigate to Bookings"
                        >
                            Bookings
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
}

// Home Component
function Home() {
    return (
        <div className="home">
            <h1>Welcome to the Home Page!</h1>
            <p>You have successfully logged in.</p>
        </div>
    );
}

// ProtectedRoute Component
function ProtectedRoute({ children, requireAdmin = false }) {
    const { token, isLoading, isAdmin } = useAuth();
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Set a timeout for loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                setLoadingTimeout(true);
            }
        }, 5000); // 5 seconds timeout

        return () => clearTimeout(timer);
    }, [isLoading]);

    if (isLoading && !loadingTimeout) {
        return <div className="loading">Loading...</div>;
    }

    if (loadingTimeout) {
        return <div className="error-message">Loading timed out. Please refresh the page.</div>;
    }

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" state={{ error: 'You do not have permission to access this page.' }} />;
    }

    return children;
}

function AppContent() {
    const { logout } = useAuth();
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState(null);

    // Handle error messages from redirects
    useEffect(() => {
        if (location.state?.error) {
            setErrorMessage(location.state.error);
            // Clear the state after displaying the message
            window.history.replaceState({}, document.title, location.pathname);
        }
    }, [location]);

    // Set logout callback for api.js
    useEffect(() => {
        setLogoutCallback(logout);
        return () => {
            setLogoutCallback(null); // Cleanup on unmount
        };
    }, [logout]);

    return (
        <div>
            <Navbar />
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                    <button onClick={() => setErrorMessage(null)} className="close-error">
                        Close
                    </button>
                </div>
            )}
            <div className="content">
                <ErrorBoundary>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <UserList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/booking"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <BookingList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/user/:id"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <UserDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/rooms"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <RoomList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/room-types"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <RoomType />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/add-room"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AddRoom />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/edit-room/:id"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <EditRoom />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </ErrorBoundary>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;