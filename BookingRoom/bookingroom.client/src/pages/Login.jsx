//import React, { useState, useRef } from 'react';
//import { useNavigate } from 'react-router-dom';
//import { login as loginService } from '../services/authService';
//import { useAuth } from '../context/AuthContext';

//const Login = () => {
//    const [formData, setFormData] = useState({
//        login: '',
//        password: ''
//    });
//    const [error, setError] = useState(null);
//    const [success, setSuccess] = useState(null); // Thêm trạng thái success
//    const errorRef = useRef(null);
//    const navigate = useNavigate();
//    const { login } = useAuth(); // Sử dụng hàm login từ useAuth

//    const handleChange = (e) => {
//        setFormData({ ...formData, [e.target.name]: e.target.value });
//    };

//    const handleSubmit = async (e) => {
//        e.preventDefault();
//        console.log('Frontend - Sending login data:', {
//            login: formData.login,
//            password: formData.password
//        });
//        try {
//            const token = await loginService(formData);
//            // Giả sử backend trả về user cùng với token, nếu không thì bạn cần điều chỉnh
//            const user = { username: formData.login }; // Thay thế bằng dữ liệu user thực tế từ backend
//            login(token, user); // Cập nhật token và user trong AuthContext
//            setSuccess('Login successful! Redirecting to home...');
//            setTimeout(() => {
//                navigate('/');
//            }, 2000);
//        } catch (err) {
//            console.error('Frontend - Login Error:', err.message);
//            setError(err.message || 'Login failed');
//            setSuccess(null);
//            if (errorRef.current) {
//                errorRef.current.scrollIntoView({ behavior: 'smooth' });
//            }
//        }
//    };

//    return (
//        <div>
//            <h2>Login</h2>
//            {error && <div ref={errorRef} style={{ color: 'red' }}>{error}</div>}
//            {success && <div style={{ color: 'green' }}>{success}</div>} {/* Hiển thị thông báo thành công */}
//            <form onSubmit={handleSubmit}>
//                <div>
//                    <label>Email or Username:</label>
//                    <input
//                        type="text"
//                        name="login"
//                        value={formData.login}
//                        onChange={handleChange}
//                        required
//                    />
//                </div>
//                <div>
//                    <label>Password:</label>
//                    <input
//                        type="password"
//                        name="password"
//                        value={formData.password}
//                        onChange={handleChange}
//                        required
//                    />
//                </div>
//                <button type="submit">Login</button>
//            </form>
//        </div>
//    );
//};

//export default Login;

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './styles/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        rememberMe: false,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const errorRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Frontend - Sending login data:', {
            login: formData.login,
            password: formData.password,
            rememberMe: formData.rememberMe,
        });
        try {
            const token = await loginService(formData);
            const user = { username: formData.login };
            login(token, user);
            setSuccess('Login successful! Redirecting to home...');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Frontend - Login Error:', err.message);
            setError(err.message || 'Login failed');
            setSuccess(null);
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="login-container">
            {/* Phần hình nền bên trái - bỏ văn bản quảng bá */}
            <div className="login-background"></div>

            {/* Phần form đăng nhập bên phải */}
            <div className="login-page">
                <h3>Login</h3>
                {error && (
                    <div ref={errorRef} className="error-message">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="login">Email</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="login-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            Remember
                        </label>
                        <a href="/forgot-password" className="forgot-password">
                            Forget?
                        </a>
                    </div>
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;