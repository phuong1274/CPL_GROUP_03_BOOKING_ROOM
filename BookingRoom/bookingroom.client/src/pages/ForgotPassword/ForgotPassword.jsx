import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';

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

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setEmailError('');

        // Validate định dạng email phía client
        if (!validateEmail(email)) {
            setEmailError('Email sai định dạng');
            return;
        }

        try {
            const response = await forgotPassword(email);
            setMessage(response); // response là chuỗi: "Reset link has been sent to your email."
        } catch (err) {
            setError(err || 'Failed to send reset password email'); // err là chuỗi: "User with this email does not exist."
        }
    }, [email]);

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient bg-primary-subtle">
            <div className="card shadow-lg p-4" style={{ maxWidth: '420px', width: '100%', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                <h2 className="text-center mb-4 fw-bold text-primary">Forgot Password</h2>

                {message && (
                    <div className="alert alert-success text-center">{message}</div>
                )}
                {error && (
                    <div className="alert alert-danger text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className={`form-control ${emailError ? 'is-invalid' : ''}`}
                            placeholder="you@example.com"
                            value={email}
                            onChange={handleChange}
                            required
                        />
                        {emailError && <div className="invalid-feedback">{emailError}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary w-100 fw-semibold shadow-sm">
                        Send Reset Link
                    </button>
                </form>

                <div className="text-center mt-3">
                    <span
                        role="button"
                        className="text-decoration-underline text-primary"
                        onClick={() => navigate('/login')}
                    >
                        ← Back to Login
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;