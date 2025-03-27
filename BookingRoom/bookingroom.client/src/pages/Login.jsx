import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // Thêm trạng thái success
    const errorRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth(); // Sử dụng hàm login từ useAuth

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Frontend - Sending login data:', {
            login: formData.login,
            password: formData.password
        });
        try {
            const token = await loginService(formData);
            // Giả sử backend trả về user cùng với token, nếu không thì bạn cần điều chỉnh
            const user = { username: formData.login }; // Thay thế bằng dữ liệu user thực tế từ backend
            login(token, user); // Cập nhật token và user trong AuthContext
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
        <div>
            <h2>Login</h2>
            {error && <div ref={errorRef} style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>} {/* Hiển thị thông báo thành công */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email or Username:</label>
                    <input
                        type="text"
                        name="login"
                        value={formData.login}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;