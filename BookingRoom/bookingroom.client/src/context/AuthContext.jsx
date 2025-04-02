import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Khôi phục token và user từ localStorage khi ứng dụng khởi động
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to parse auth data from localStorage:', error);
                logout(); // Đăng xuất nếu dữ liệu không hợp lệ
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Đồng bộ hóa state khi localStorage thay đổi (multi-tab support)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'token' || event.key === 'user') {
                if (!event.newValue) {
                    // Nếu token hoặc user bị xóa, đăng xuất
                    logout();
                } else {
                    try {
                        const storedToken = localStorage.getItem('token');
                        const storedUser = localStorage.getItem('user');
                        setToken(storedToken);
                        setUser(storedUser ? JSON.parse(storedUser) : null);
                    } catch (error) {
                        console.error('Failed to parse auth data from localStorage:', error);
                        logout();
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAdmin = () => {
        const isAdminUser = user?.role === 'Admin'; // Sửa Role thành role
        console.log('isAdmin:', isAdminUser, 'User:', user); // Thêm log để kiểm tra
        return isAdminUser;
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);