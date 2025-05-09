﻿import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AddRoom from './pages/AdminPages/AddRoom/AddRoom';
import EditRoom from './pages/AdminPages/EditRoom/EditRoom';
import Login from './pages/UserPages/Login/Login';
import Register from './pages/UserPages/Register/Register';
import MyBooking from './pages/UserPages/MyBooking/MyBooking';
import AvailableRooms from './pages/UserPages/AvailableRooms/AvailableRooms';
import BookingList from './pages/AdminPages/BookingList/BookingList';
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

function NotFound() {
    return (
        <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
}

function ProtectedRoute({ children, requireAdmin = false, requireCustomer = false, allowUnauthenticated = false }) {
    const { token, isLoading, isAdmin } = useAuth();
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                setLoadingTimeout(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [isLoading]);

    if (isLoading && !loadingTimeout) {
        return <div className="loading">Loading...</div>;
    }

    if (loadingTimeout) {
        return <div className="error-message">Loading timed out. Please refresh the page.</div>;
    }

    if (allowUnauthenticated && !token) {
        return children;
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" state={{ error: 'You do not have permission to access this page.' }} />;
    }

    if (requireCustomer && isAdmin()) {
        return <Navigate to="/" state={{ error: 'You do not have permission to access this page.' }} />;
    }

    if (location.pathname === '/') {
        if (isAdmin()) {
            return <Navigate to="/revenue-report" />;
        }
        return children;
    }

    return children;
}

function AppContent() {
    const { logout } = useAuth();
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Xử lý thông báo lỗi từ location.state
    useEffect(() => {
        if (location.state?.error) {
            setErrorMessage(location.state.error);
            // Xóa state lỗi khỏi location để tránh hiển thị lại khi refresh
            window.history.replaceState({}, document.title, location.pathname);
        }
    }, [location]);

    // Tự động xóa thông báo sau 5 giây
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 3000); // 5000ms = 5 giây

            // Dọn dẹp timer khi errorMessage thay đổi hoặc component unmount
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Xử lý logout callback
    useEffect(() => {
        setLogoutCallback(logout);
        return () => {
            setLogoutCallback(null);
        };
    }, [logout]);

    // Hide both Header and Navbar on login, register, forgot-password, reset-password
    const hideHeaderAndNavbar = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

    return (
        <div className="app-container">
            {!hideHeaderAndNavbar && (
                <>
                    <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                    <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                </>
            )}
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
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