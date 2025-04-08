import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as loginService, forgotPassword, resetPassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ login: '', password: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const errorRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Lấy token từ query parameter
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        if (token) {
            setResetToken(token);
            setShowForgotPassword(true);
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await loginService(formData);
            const user = { username: formData.login };
            login(token, user);
            setSuccess('Login successful! Redirecting to home...');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.message || 'Login failed');
            setSuccess(null);
            errorRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword({ email });
            setSuccess('Password reset link has been sent to your email.');
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
            setSuccess(null);
        }
    };

    const validateResetForm = () => {
        const errors = {};
        if (!newPassword) errors.newPassword = 'New password is required';
        else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
        if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!resetToken) errors.resetToken = 'Reset token is required';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateResetForm()) return;
        try {
            await resetPassword({ token: resetToken, newPassword });
            setSuccess('Password reset successful! Redirecting to login...');
            setError(null);
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetToken('');
                navigate('/login', { replace: true }); // Xóa query parameter
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
            setSuccess(null);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>{showForgotPassword ? 'Reset Password' : 'Login'}</h2>
            {error && <div ref={errorRef} style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}

            {!showForgotPassword ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email or Username:</label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
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
                            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '10px', width: '100%' }}>Login</button>
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        style={{ padding: '10px', width: '100%', marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                    >
                        Forgot Password?
                    </button>
                </form>
            ) : (
                <>
                    {!resetToken ? (
                        <form onSubmit={handleForgotPassword}>
                            <div>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                                />
                            </div>
                            <button type="submit" style={{ padding: '10px', width: '100%' }}>Send Reset Link</button>
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(false)}
                                style={{ padding: '10px', width: '100%', marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div>
                                <label>Reset Token:</label>
                                <input
                                    type="text"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    required
                                    disabled
                                    style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                                />
                                {validationErrors.resetToken && (
                                    <div style={{ color: 'red' }}>{validationErrors.resetToken}</div>
                                )}
                            </div>
                            <div>
                                <label>New Password:</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                                />
                                {validationErrors.newPassword && (
                                    <div style={{ color: 'red' }}>{validationErrors.newPassword}</div>
                                )}
                            </div>
                            <div>
                                <label>Confirm Password:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                                />
                                {validationErrors.confirmPassword && (
                                    <div style={{ color: 'red' }}>{validationErrors.confirmPassword}</div>
                                )}
                            </div>
                            <button type="submit" style={{ padding: '10px', width: '100%' }}>Reset Password</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setResetToken('');
                                    navigate('/login', { replace: true });
                                }}
                                style={{ padding: '10px', width: '100%', marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                            >
                                Back to Login
                            </button>
                        </form>
                    )}
                </>
            )}
        </div>
    );
};

export default Login;