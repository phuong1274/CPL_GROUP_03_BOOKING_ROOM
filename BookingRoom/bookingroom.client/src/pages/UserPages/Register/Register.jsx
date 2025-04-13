import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import styles from './Register.module.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: 'Customer'
    });

    const [errors, setErrors] = useState({});
    const [clientErrors, setClientErrors] = useState({});
    const errorRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const validateField = (name, value) => {
        const newErrors = { ...clientErrors };

        switch (name) {
            case 'username':
                !value ? (newErrors.username = 'Username is required') : (delete newErrors.username);
                break;

            case 'email':
                newErrors.email = !value? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : (delete newErrors.email, undefined);
                break;

            case 'password':
                newErrors.password = !value ? 'Password is required' : value.length < 6 || value.length > 100 ? 'Password must be between 6 and 100 characters long'
                        : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value) ? 'Password must contain at least one uppercase letter, one lowercase letter, and one number': (delete newErrors.password, undefined);
                break;

            case 'fullName':
                !value ? (newErrors.fullName = 'Full Name is required') : delete newErrors.fullName;
                break;

            case 'phoneNumber':
                newErrors.phoneNumber = !value ? 'Phone Number is required': !/^\d{10,15}$/.test(value)
                        ? 'Phone Number must be between 10 and 15 digits' : (delete newErrors.phoneNumber, undefined);
                break;

            default:
                break;
        }

        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username) {
            newErrors.username = 'Username is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6 || formData.password.length > 100) {
            newErrors.password = 'Password must be between 6 and 100 characters long';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        if (!formData.fullName) {
            newErrors.fullName = 'Full Name is required';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone Number is required';
        } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone Number must be between 10 and 15 digits';
        }

        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); 
        setClientErrors({}); 

        if (!validateForm()) {
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        try {
            const { token, user } = await register(formData);
            login(token, user);
            navigate('/');
        } catch (err) {
            setErrors(
                err && typeof err === 'object'
                    ? err.Error
                        ? { general: `${err.Error}${err.Details ? `: ${err.Details}` : ''}` }
                        : err
                    : { general: err.message || 'Registration failed' }
            );

            errorRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (


        <div className={styles.registerPageWrapper}>
            <div className={styles.registerBox}>
                <h2>Register</h2>
                {(errors.general || clientErrors.general) && (
                    <div ref={errorRef} style={{ color: 'red' }} className={styles.errorMessage}>
                        {errors.general || clientErrors.general}
                    </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.inputGroup}>
                        {/*<label>Username:</label>*/}
                        <div className={styles.inputWrapper}>
                            <i className={`bi bi-person ${styles.inputIcon}`}></i>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter Username"
                                className={clientErrors.username || errors.username ? styles.inputError : ''}
                            />
                        </div>
                        {(clientErrors.username || errors.username) && (
                            <div style={{ color: 'red' }} className={styles.errorMessageField}>
                                {clientErrors.username || (Array.isArray(errors.username) ? errors.username[0] : errors.username)}
                            </div>
                        )}
                    </div>
                    <div className={styles.inputGroup}>
                        {/*<label>Email:</label>*/}
                        <div className={styles.inputWrapper}>
                            <i className={`bi bi-envelope ${styles.inputIcon}`}></i>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter Email"
                                className={clientErrors.email || errors.email ? styles.inputError : ''}
                            />
                        </div>
                        {(clientErrors.email || errors.email) && (
                            <div style={{ color: 'red' }} className={styles.errorMessageField}>
                                {clientErrors.email || (Array.isArray(errors.email) ? errors.email[0] : errors.email)}
                            </div>
                        )}
                    </div>
                    <div className={styles.inputGroup}>
                        {/*<label>Password:</label>*/}
                        <div className={styles.inputWrapper}>
                            <i className={`bi bi-lock ${styles.inputIcon}`}></i>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter Password"
                                className={clientErrors.password || errors.password ? styles.inputError : ''}
                            />
                        </div>
                        {(clientErrors.password || errors.password) && (
                            <div style={{ color: 'red' }} className={styles.errorMessageField}>
                                {clientErrors.password || (Array.isArray(errors.password) ? errors.password[0] : errors.password)}
                            </div>
                        )}
                    </div>
                    <div className={styles.inputGroup}>
                        {/*<label>Full Name:</label>*/}
                        <div className={styles.inputWrapper}>
                            <i className={`bi bi-person ${styles.inputIcon}`}></i>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Enter Full Name"
                                className={clientErrors.fullName || errors.fullName ? styles.inputError : ''}
                            />
                        </div>
                        {(clientErrors.fullName || errors.fullName) && (
                            <div style={{ color: 'red' }} className={styles.errorMessageField}>
                                {clientErrors.fullName || (Array.isArray(errors.fullName) ? errors.fullName[0] : errors.fullName)}
                            </div>
                        )}
                    </div>
                    <div className={styles.inputGroup}>
                        {/*<label>Phone Number:</label>*/}
                        <div className={styles.inputWrapper}>
                            <i className={`bi bi-telephone ${styles.inputIcon}`}></i>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                placeholder="Enter Phone Number"
                                className={clientErrors.phoneNumber || errors.phoneNumber ? styles.inputError : ''}
                            />
                        </div>
                        {(clientErrors.phoneNumber || errors.phoneNumber) && (
                            <div style={{ color: 'red' }} className={styles.errorMessageField}>
                                {clientErrors.phoneNumber || (Array.isArray(errors.phoneNumber) ? errors.phoneNumber[0] : errors.phoneNumber)}
                            </div>
                        )}
                    </div>
                    <button type="submit" className={styles.registerButton}>REGISTER</button>
                    <div className={styles.loginLink}>
                        Already have an account? <a href="/login">Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;