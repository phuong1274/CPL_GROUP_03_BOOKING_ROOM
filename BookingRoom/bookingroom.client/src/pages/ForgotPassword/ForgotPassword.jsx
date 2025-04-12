import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        setEmail(value);

        if (!validateEmail(value) && value.length > 0) {
            setEmailError('Email sai định dạng');
        } else {
            setEmailError('');
        }
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setMessage('');
            setError('');
            setEmailError('');

            if (!validateEmail(email)) {
                setEmailError('Email sai định dạng');
                return;
            }

            try {
                const response = await forgotPassword(email);
                setMessage(response);
            } catch (err) {
                setError(err || 'Failed to send reset password email');
            }
        },
        [email]
    );

    return (
        <div className={`container ${styles.customContainer}`}>
            <div className="row justify-content-center align-items-center min-vh-100">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className={`card ${styles.customCard}`}>
                        <div className="card-body p-4 p-md-5">
                            <h2 className={`card-title text-center ${styles.cardTitle}`}>
                                Forgot Password
                            </h2>
                            {message && (
                                <div className="alert alert-success" role="alert">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {emailError && (
                                        <div className="invalid-feedback">{emailError}</div>
                                    )}
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className={`btn btn-warning ${styles.submitButton}`}
                                    >
                                        Send Reset Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className={`btn btn-warning ${styles.submitButton}`}
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;