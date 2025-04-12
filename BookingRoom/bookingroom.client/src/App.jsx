import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setLogoutCallback } from './services/authService';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Home from './pages/HomePage/Home';
import UserList from './pages/AdminPages/UserList/UserList';
import UserDetail from './pages/AdminPages/UserDetail/UserDetail';
import RoomList from './pages/AdminPages/RoomList/RoomList';
import RoomType from './pages/AdminPages/RoomType/RoomType';
import AddRoom from './pages/AddRoom';
import EditRoom from './pages/EditRoom';
import Login from './pages/UserPages/Login/Login';
import Register from './pages/UserPages/Register/Register';
import BookingList from './pages/BookingList';
import MyBooking from './pages/MyBooking';
import AvailableRooms from './pages/AvailableRooms';
import RevenueReport from './pages/Revenue_Report/RevenueReport';
import './App.css';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import UpdateProfile from './pages/UpdateProfile/UpdateProfile';

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

// ProtectedRoute Component
function ProtectedRoute({ children, requireAdmin = false, requireCustomer = false, allowUnauthenticated = false }) {
    const { token, isLoading, isAdmin } = useAuth();
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const location = useLocation();

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

    // Cho phép truy cập nếu allowUnauthenticated là true (dành cho trang Home)
    if (allowUnauthenticated && !token) {
        return children;
    }

    // Nếu không có token và không được phép truy cập không cần đăng nhập, chuyển hướng về /login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" state={{ error: 'You do not have permission to access this page.' }} />;
    }

    if (requireCustomer && isAdmin()) {
        return <Navigate to="/" state={{ error: 'You do not have permission to access this page.' }} />;
    }

    // Redirect based on role for the root path
    if (location.pathname === '/') {
        if (isAdmin()) {
            return <Navigate to="/revenue-report" />;
        }
        return children; // Customers see the Home page
    }

    return children;
}

function AppContent() {
    const { logout } = useAuth();
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar is closed by default

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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

    // Kiểm tra nếu đang ở trang login hoặc register thì không hiển thị Header và Navbar
    const hideHeaderAndNavbar = ['/login', '/register'].includes(location.pathname);

    return (
        <div className="app-container">
            {/* Chỉ hiển thị Header và Navbar nếu không phải trang login hoặc register */}
            {!hideHeaderAndNavbar && (
                <>
                    <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                    <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                </>
            )}
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                    <button onClick={() => setErrorMessage(null)} className="close-error">
                        Close
                    </button>
                </div>
            )}
            <div className={`content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <ErrorBoundary>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/" element={<ResetPassword />} />

                        <Route
                            path="/"
                            element={
                                <ProtectedRoute allowUnauthenticated={true}>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/change-password"
                            element={
                                <ProtectedRoute>
                                    <ChangePassword />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/update-profile"
                            element={
                                <ProtectedRoute>
                                    <UpdateProfile />
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
                            path="/my-booking"
                            element={
                                <ProtectedRoute requireCustomer={true}>
                                    <MyBooking />
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
                        <Route
                            path="/available-rooms"
                            element={
                                <ProtectedRoute requireCustomer={true}>
                                    <AvailableRooms />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/revenue-report"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <RevenueReport />
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