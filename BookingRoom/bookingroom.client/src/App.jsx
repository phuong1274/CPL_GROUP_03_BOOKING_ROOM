// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Booking from './pages/Booking';
import './App.css';

function ProtectedRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
}

function AppContent() {
    return (
        <>
            <NavBar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} /> {/* Publicly accessible */}
                <Route
                    path="/booking"
                    element={
                        <ProtectedRoute>
                            <Booking />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
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