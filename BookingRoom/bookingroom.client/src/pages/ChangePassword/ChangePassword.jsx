import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/authService';
import styles from './ChangePassword.module.css';
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
        <div className={`container ${styles.customContainer}`}>
            <div className="row justify-content-center align-items-center min-vh-100">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className={`card ${styles.customCard}`}>
                        <div className="card-body p-4 p-md-5">
                            <h2 className={`card-title text-center ${styles.cardTitle}`}>
                                Change Password
                            </h2>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="oldPassword" className="form-label">
                                        Old Password
                                    </label>
                                    <input
                                        id="oldPassword"
                                        type="password"
                                        value={oldPassword}
                                        onChange={handleOldPasswordChange}
                                        className={`form-control ${oldPasswordError ? 'is-invalid' : ''}`}
                                        required
                                        placeholder="Enter your old password"
                                    />
                                    {oldPasswordError && (
                                        <div className="invalid-feedback">{oldPasswordError}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="newPassword" className="form-label">
                                        New Password
                                    </label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={handleNewPasswordChange}
                                        className={`form-control ${newPasswordError ? 'is-invalid' : ''}`}
                                        required
                                        placeholder="Enter your new password"
                                    />
                                    {newPasswordError && (
                                        <div className="invalid-feedback">{newPasswordError}</div>
                                    )}
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className={`btn btn-warning ${styles.submitButton}`}
                                    >
                                        Change Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className={`btn btn-warning ${styles.submitButton}`}
                                    >
                                        Back to Home
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

export default ChangePassword;