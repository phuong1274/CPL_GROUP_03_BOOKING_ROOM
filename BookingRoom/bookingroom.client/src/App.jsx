//import { Routes, Route, Navigate } from 'react-router-dom';
//import { AuthProvider, useAuth } from './context/AuthContext';
//import Login from './pages/Login';
//import Register from './pages/Register';
//import './App.css';

//// Component Home để hiển thị nội dung trang home
//function Home() {
//    return (
//        <div>
//            <h1>Welcome to the Home Page!</h1>
//            <p>You have successfully logged in.</p>
//        </div>
//    );
//}

//function ProtectedRoute({ children }) {
//    const { token } = useAuth();
//    return token ? children : <Navigate to="/login" />;
//}

//function AppContent() {
//    return (
//        <Routes>
//            <Route path="/login" element={<Login />} />
//            <Route path="/register" element={<Register />} />
//            <Route
//                path="/"
//                element={
//                    <ProtectedRoute>
//                        <Home />
//                    </ProtectedRoute>
//                }
//            />
//        </Routes>
//    );
//}

//function App() {
//    return (
//        <AuthProvider>
//            <AppContent />
//        </AuthProvider>
//    );
//}

//export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import User from './pages/User';
import UserProfile from './pages/UserProfile';
import BookingForm from './components/BookingForm';
import ChangeUserInfo from './components/ChangeUserInfo';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ChangePassword from './components/ChangePassword';
import ViewMyBooking from './components/ViewMyBooking';
import ViewRevenu from './components/ViewRevenu';
import './App.css';
//import '@fortawesome/fontawesome-free/css/all.min.css';

function ProtectedRoute({ children }) {
    const { token, isGuest } = useAuth();
    // Cho phép truy cập nếu có token hoặc ở chế độ guest
    return token || isGuest ? children : <Navigate to="/login" />;
}

function AppContent() {
    return (
        <div className="app-container">
            <NavBar />
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<Home />} /> {/* Di chuyển Home sang /home */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <User /> {/* Trang chính với 3 nút */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/booking"
                        element={
                            <ProtectedRoute>
                                <BookingForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <UserProfile />
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
                        path="/change-user-info"
                        element={
                            <ProtectedRoute>
                                <ChangeUserInfo />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/view-my-booking"
                        element={
                            <ProtectedRoute>
                                <ViewMyBooking />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/view-revenu"
                        element={
                            <ProtectedRoute>
                                <ViewRevenu />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>

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