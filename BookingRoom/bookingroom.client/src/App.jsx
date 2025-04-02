import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import './App.css';
import { useEffect } from 'react';

// Component Navbar để hiển thị thanh điều hướng
function Navbar() {
    const { token, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Không hiển thị Navbar trên trang login và register
    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    // Xử lý đăng xuất
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            backgroundColor: '#f8f9fa',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ddd'
        }}>
            <div>
                <h3 style={{ margin: 0 }}>Hotel Booking</h3>
            </div>
            <div>
                {token && isAdmin() && (
                    <button
                        onClick={() => navigate('/users')}
                        style={{
                            marginRight: '10px',
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        User List
                    </button>
                )}
                {token && (
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}

// Component Home để hiển thị nội dung trang home
function Home() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome to the Home Page!</h1>
            <p>You have successfully logged in.</p>
        </div>
    );
}

function ProtectedRoute({ children, requireAdmin = false }) {
    const { token, isLoading, isAdmin } = useAuth();

    // Nếu đang tải dữ liệu xác thực, hiển thị loading
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Kiểm tra nếu không có token (chưa đăng nhập)
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Kiểm tra nếu route yêu cầu Admin và người dùng không phải Admin
    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" />;
    }

    return children;
}

function AppContent() {
    const { logout } = useAuth();

    // Cung cấp logout cho api.js
    useEffect(() => {
        setLogoutCallback(logout);
    }, [logout]);

    return (
        <div>
            <Navbar />
            <div style={{ minHeight: 'calc(100vh - 60px)' }}>
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
                        path="/user/:id"
                        element={
                            <ProtectedRoute requireAdmin={true}>
                                <UserDetail />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
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