//import { createContext, useContext, useState, useEffect } from 'react';

//const AuthContext = createContext();

//export const AuthProvider = ({ children }) => {
//    const [user, setUser] = useState(null);
//    const [token, setToken] = useState(null);

//    useEffect(() => {
//        // Kiểm tra token trong localStorage khi ứng dụng khởi động
//        const storedToken = localStorage.getItem('token');
//        const storedUser = localStorage.getItem('user');
//        if (storedToken && storedUser) {
//            setToken(storedToken);
//            setUser(JSON.parse(storedUser));
//        }
//    }, []);

//    const login = (newToken, newUser) => {
//        setToken(newToken);
//        setUser(newUser);
//        localStorage.setItem('token', newToken);
//        localStorage.setItem('user', JSON.stringify(newUser));
//    };

//    const logout = () => {
//        setToken(null);
//        setUser(null);
//        localStorage.removeItem('token');
//        localStorage.removeItem('user');
//    };

//    return (
//        <AuthContext.Provider value={{ user, token, login, logout }}>
//            {children}
//        </AuthContext.Provider>
//    );
//};

//export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isGuest, setIsGuest] = useState(false); // Thêm trạng thái guest

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        setIsGuest(false); // Đảm bảo không ở chế độ guest khi đăng nhập thật
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const loginAsGuest = () => {
        setToken(null); // Không có token
        setUser({ username: 'Guest' }); // User giả với tên "Guest"
        setIsGuest(true); // Kích hoạt chế độ guest
        localStorage.removeItem('token'); // Xóa token nếu có
        localStorage.removeItem('user');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsGuest(false); // Thoát chế độ guest
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isGuest, login, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);