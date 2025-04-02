// pages/Login.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './styles/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const errorRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth();

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
            <div className="login-page">
                <h2>Login</h2>
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
                    <div className="input-group"> {/* Replaced form-group with input-group */}
                        <label htmlFor="login">Email or Username:</label> {/* Fixed label1 to label */}
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group"> {/* Replaced form-group with input-group */}
                        <label htmlFor="password">Password:</label> {/* Fixed label1 to label */}
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
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