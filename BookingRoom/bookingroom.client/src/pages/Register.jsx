//import React, { useState, useRef } from 'react';
//import { useNavigate } from 'react-router-dom';
//import { register } from '../services/authService'; // Import hàm register từ authService

//const Register = () => {
//    const [formData, setFormData] = useState({
//        username: '',
//        email: '',
//        password: '',
//        fullName: '',
//        phoneNumber: ''
//    });
//    const [error, setError] = useState(null);
//    const errorRef = useRef(null); // Sử dụng useRef trong functional component
//    const navigate = useNavigate();

//    const handleChange = (e) => {
//        setFormData({ ...formData, [e.target.name]: e.target.value });
//    };

//    const handleSubmit = async (e) => {
//        e.preventDefault();
//        try {
//            await register(formData);
//            navigate('/login'); // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
//        } catch (err) {
//            setError(err.message || 'Registration failed');
//            if (errorRef.current) {
//                errorRef.current.scrollIntoView({ behavior: 'smooth' });
//            }
//        }
//    };

//    return (
//        <div>
//            <h2>Register</h2>
//            {error && <div ref={errorRef} style={{ color: 'red' }}>{error}</div>}
//            <form onSubmit={handleSubmit}>
//                <div>
//                    <label>Username:</label>
//                    <input
//                        type="text"
//                        name="username"
//                        value={formData.username}
//                        onChange={handleChange}
//                        required
//                    />
//                </div>
//                <div>
//                    <label>Email:</label>
//                    <input
//                        type="email"
//                        name="email"
//                        value={formData.email}
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
//                <div>
//                    <label>Full Name:</label>
//                    <input
//                        type="text"
//                        name="fullName"
//                        value={formData.fullName}
//                        onChange={handleChange}
//                        required
//                    />
//                </div>
//                <div>
//                    <label>Phone Number:</label>
//                    <input
//                        type="text"
//                        name="phoneNumber"
//                        value={formData.phoneNumber}
//                        onChange={handleChange}
//                        required
//                    />
//                </div>
//                <button type="submit">Register</button>
//            </form>
//        </div>
//    );
//};

//export default Register;

// pages/Register.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService'; // Import hàm register từ authService
import './styles/register.css'; // Assuming this is the same CSS file as before

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // Added success state for consistency
    const errorRef = useRef(null); // Sử dụng useRef trong functional component
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            setSuccess('Registration successful! Redirecting to login...'); // Added success message
            setError(null);
            setTimeout(() => {
                navigate('/login'); // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
            }, 2000); // Added a delay for the user to see the success message
        } catch (err) {
            setError(err.message || 'Registration failed');
            setSuccess(null);
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-page">
                <h2>Register</h2>
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
                    <div className="input-group"> {/* Replaced form-group1 with input-group */}
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group"> {/* Replaced form-group1 with input-group */}
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group"> {/* Replaced form-group1 with input-group */}
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group"> {/* Replaced form-group1 with input-group */}
                        <label htmlFor="fullName">Full Name:</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group"> {/* Replaced form-group1 with input-group */}
                        <label htmlFor="phoneNumber">Phone Number:</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;