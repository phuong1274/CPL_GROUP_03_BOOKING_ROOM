import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ResetPassword.module.css'; // Import CSS module
import { resetPassword } from '../../services/api'; // Import resetPassword function
import 'bootstrap/dist/css/bootstrap.min.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [token, setToken] = useState('');
    const [isTokenValid, setIsTokenValid] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Lấy token từ URL khi component được mount
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('No token provided. Please use the link from your email.');
            setIsTokenValid(false);
        }
    }, [searchParams]);

    // Hàm kiểm tra định dạng mật khẩu
    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!minLength) {
            return 'Password must be at least 8 characters long.';
        }
        if (!hasUpperCase) {
            return 'Password must contain at least 1 uppercase letter.';
        }
        if (!hasSpecialChar) {
            return 'Password must contain at least 1 special character (e.g., !@#$%^&*).';
        }
        return '';
    };

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        setNewPassword(value);

        const validationError = validatePassword(value);
        setPasswordError(validationError);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setPasswordError('');

        const validationError = validatePassword(newPassword);
        if (validationError) {
            setPasswordError(validationError);
            return;
        }

        try {
            const response = await resetPassword(token, newPassword);
            console.log('API Response:', response);
            setMessage(response); // Chuỗi: "Password reset successfully."
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.log('Error:', err);
            setError(err || 'Failed to reset password. The link may be invalid or expired.'); // Chuỗi
        }
    }, [token, newPassword, navigate]);

    // Nếu token không hợp lệ, hiển thị thông báo lỗi
    if (!isTokenValid) {
        return (
            <div className={styles.loginPageWrapper}>
                <div className={styles.loginBox}>
                    <h2>Reset Password</h2>
                    <div className={styles.errorMessage}>{error}</div>
                    <button
                        onClick={() => navigate('/login')}
                        className={styles.loginButton}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.loginPageWrapper}>
            <div className={styles.loginBox}>
                <h2>Reset Password</h2>
                {message && <div className={styles.successMessage}>{message}</div>}
                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            id="newPassword"
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            onChange={handleChange}
                            required
                            placeholder="Enter your new password"
                            className={`${styles.input} ${passwordError ? styles['is-invalid'] : ''}`}
                        />
                        {passwordError && (
                            <div className={styles.invalidFeedback}>{passwordError}</div>
                        )}
                    </div>
                    <button type="submit" className={styles.loginButton}>Reset Password</button>
                </form>
                <div className={styles.forgotPassword}>
                    <span
                        onClick={() => navigate('/login')}
                        className={styles.forgotPasswordLink}
                    >
                        Back to Login
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;