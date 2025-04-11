import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/api';
import styles from './ChangePassword.module.css'; // Import CSS module
import 'bootstrap/dist/css/bootstrap.min.css';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

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

    // Validate old password (không được để trống)
    const handleOldPasswordChange = useCallback((e) => {
        const value = e.target.value;
        setOldPassword(value);
        setOldPasswordError(value.length === 0 ? 'Old password cannot be empty.' : '');
    }, []);

    // Validate new password (ít nhất 8 ký tự, 1 chữ in hoa, 1 ký tự đặc biệt)
    const handleNewPasswordChange = useCallback((e) => {
        const value = e.target.value;
        setOldPasswordError(value.length === 0 ? 'New password cannot be empty.' : '');

        setNewPassword(value);
        const validationError = validatePassword(value);
        setNewPasswordError(validationError);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Kiểm tra tất cả các lỗi trước khi gửi request
        const oldPasswordValidation = oldPassword.length === 0 ? 'Old password cannot be empty.' : '';
        const newPasswordValidation = validatePassword(newPassword);

        setOldPasswordError(oldPasswordValidation);
        setNewPasswordError(newPasswordValidation);

        if (oldPasswordValidation || newPasswordValidation) {
            return;
        }

        try {
            const response = await changePassword(oldPassword, newPassword);
            setSuccess(response); // Chuỗi: "Password changed successfully."
            setError(null);
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err || 'Failed to change password'); // Chuỗi từ server
            setSuccess(null);
        }
    };

    return (
        <div className={styles.changePasswordWrapper}>
            <div className={styles.changePasswordBox}>
                <h2>Change Password</h2>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="oldPassword">Old Password:</label>
                        <input
                            id="oldPassword"
                            type="password"
                            value={oldPassword}
                            onChange={handleOldPasswordChange}
                            required
                            placeholder="Enter your old password"
                            className={`${styles.input} ${oldPasswordError ? styles['is-invalid'] : ''}`}
                        />
                        {oldPasswordError && (
                            <div className={styles.invalidFeedback}>{oldPasswordError}</div>
                        )}
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            required
                            placeholder="Enter your new password"
                            className={`${styles.input} ${newPasswordError ? styles['is-invalid'] : ''}`}
                        />
                        {newPasswordError && (
                            <div className={styles.invalidFeedback}>{newPasswordError}</div>
                        )}
                    </div>
                    <button type="submit" className={styles.changePasswordButton}>Change Password</button>
                </form>
                <div className={styles.backToHome}>
                    <span
                        onClick={() => navigate('/')}
                        className={styles.backToHomeLink}
                    >
                        Back to Home
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;