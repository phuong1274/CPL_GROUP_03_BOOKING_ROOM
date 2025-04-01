import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ login: '', password: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setErrors({});
        console.log("Form data on submit:", formData);

        try {
            const { token, user } = await loginService(formData);
            console.log("Login successful, token:", token, "user:", user);
            login(token, user);
            navigate('/');
        } catch (err) {
            console.log("Error caught in handleSubmit:", err);
            const errorMessage = err.message || 'Đăng nhập thất bại';
            setErrors({ general: errorMessage });
        }
    }, [formData, login, navigate]);

    return (
        <div>
            <h2>Login</h2>
            {errors.general && <div style={{ color: 'red' }}>{errors.general}</div>}

            <form onSubmit={handleSubmit}>
                {['login', 'password'].map((field) => (
                    <div key={field}>
                        <label>{field === 'login' ? 'Email or Username:' : 'Password:'}</label>
                        <input
                            type={field === 'password' ? 'password' : 'text'}
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                        />
                        {errors[field] && <div style={{ color: 'red' }}>{errors[field]}</div>}
                    </div>
                ))}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
