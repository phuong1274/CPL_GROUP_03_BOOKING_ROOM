//// App.jsx
//import { Routes, Route, Navigate } from 'react-router-dom';
//import { AuthProvider, useAuth } from './context/AuthContext';
//import NavBar from './components/NavBar';
//import Login from './pages/Login';
//import Register from './pages/Register';
//import Home from './pages/Home';
//import Booking from './pages/Booking';
//import './App.css';

//function ProtectedRoute({ children }) {
//    const { token } = useAuth();
//    return token ? children : <Navigate to="/login" />;
//}

//function AppContent() {
//    return (
//        <>
//            <NavBar />
//            <Routes>
//                <Route path="/login" element={<Login />} />
//                <Route path="/register" element={<Register />} />
//                <Route path="/" element={<Home />} /> {/* Publicly accessible */}
//                <Route
//                    path="/booking"
//                    element={
//                        <ProtectedRoute>
//                            <Booking />
//                        </ProtectedRoute>
//                    }
//                />
//            </Routes>
//        </>
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
// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Booking from './pages/Booking';
import ChangeUserInfo from './components/ChangeUserInfo'
import ForgotPassword from './components/ForgotPassword'; // Component mới
import ResetPassword from './components/ResetPassword';   // Component mới
import UserProfile from './pages/UserProfile';       // Component mới
import ChangePassword from './components/ChangePassword'; // Component mới
import './App.css';

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
                    <Route path="/" element={<Home />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route
                        path="/booking"
                        element={
                            <ProtectedRoute>
                                <Booking />
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