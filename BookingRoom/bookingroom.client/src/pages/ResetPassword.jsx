import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api.js';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
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

    const handleChange = useCallback((e) => {
        setNewPassword(e.target.value);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await resetPassword(token, newPassword);
            console.log('API Response:', response); // Debug
            setMessage(response.message || 'Password reset successfully.');
            // Tự động điều hướng về trang login sau 3 giây
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.log('Error:', err); // Debug
            setError(err.error || 'Failed to reset password. The link may be invalid or expired.');
        }
    }, [token, newPassword, navigate]);

    // Nếu token không hợp lệ, hiển thị thông báo lỗi
    if (!isTokenValid) {
        return (
            <>
                <style>
                    {`
                        .loginPageWrapper {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background-color: #f0f2f5;
                        }

                        .loginBox {
                            background-color: white;
                            padding: 40px;
                            border-radius: 10px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            width: 100%;
                            max-width: 400px;
                            text-align: center;
                        }

                        .loginBox h2 {
                            margin-bottom: 20px;
                            font-size: 24px;
                            color: #333;
                        }

                        .errorMessage {
                            color: red;
                            margin-bottom: 15px;
                            font-size: 14px;
                        }

                        .loginButton {
                            background-color: #007bff;
                            color: white;
                            padding: 10px 20px;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            width: 100%;
                            transition: background-color 0.3s;
                        }

                        .loginButton:hover {
                            background-color: #0056b3;
                        }
                    `}
                </style>

                <div className="loginPageWrapper">
                    <div className="loginBox">
                        <h2>Reset Password</h2>
                        <div className="errorMessage">{error}</div>
                        <button
                            onClick={() => navigate('/login')}
                            className="loginButton"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Thêm thẻ <style> để viết CSS inline */}
            <style>
                {`
                    /* Wrapper bao quanh toàn bộ trang */
                    .loginPageWrapper {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background-color: #f0f2f5;
                    }

                    /* Hộp chứa form Reset Password */
                    .loginBox {
                        background-color: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        width: 100%;
                        max-width: 400px;
                        text-align: center;
                    }

                    /* Tiêu đề Reset Password */
                    .loginBox h2 {
                        margin-bottom: 20px;
                        font-size: 24px;
                        color: #333;
                    }

                    /* Thông báo thành công */
                    .successMessage {
                        color: green;
                        margin-bottom: 15px;
                        font-size: 14px;
                    }

                    /* Thông báo lỗi */
                    .errorMessage {
                        color: red;
                        margin-bottom: 15px;
                        font-size: 14px;
                    }

                    /* Nhóm input (label + input) */
                    .inputGroup {
                        margin-bottom: 20px;
                        text-align: left;
                    }

                    .inputGroup label {
                        display: block;
                        margin-bottom: 5px;
                        font-size: 14px;
                        color: #555;
                    }

                    .inputGroup input {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 14px;
                        outline: none;
                        transition: border-color 0.3s;
                    }

                    .inputGroup input:focus {
                        border-color: #007bff;
                    }

                    /* Nút gửi yêu cầu reset password */
                    .loginButton {
                        background-color: #007bff;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        width: 100%;
                        transition: background-color 0.3s;
                    }

                    .loginButton:hover {
                        background-color: #0056b3;
                    }

                    /* Liên kết "Back to Login" */
                    .forgotPassword {
                        margin-top: 15px;
                        text-align: center;
                    }

                    .forgotPasswordLink {
                        color: #007bff;
                        cursor: pointer;
                        font-size: 14px;
                        text-decoration: none;
                    }

                    .forgotPasswordLink:hover {
                        text-decoration: underline;
                    }
                `}
            </style>

            {/* JSX */}
            <div className="loginPageWrapper">
                <div className="loginBox">
                    <h2>Reset Password</h2>
                    {message && <div className="successMessage">{message}</div>}
                    {error && <div className="errorMessage">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="inputGroup">
                            <label htmlFor="newPassword">New Password:</label>
                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={handleChange}
                                required
                                placeholder="Enter your new password"
                            />
                        </div>
                        <button type="submit" className="loginButton">Reset Password</button>
                    </form>
                    <div className="forgotPassword">
                        <span
                            onClick={() => navigate('/login')}
                            className="forgotPasswordLink"
                        >
                            Back to Login
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;