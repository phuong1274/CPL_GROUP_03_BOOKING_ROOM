import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css'; 


const Login = () => {
    const [formData, setFormData] = useState({ login: '', password: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setErrors({}); 

        try {
            const { token, user } = await loginService(formData);
            login(token, user);
            navigate('/');
        } catch (err) {
            const newErrors = err && typeof err === 'object'
                ? err.Errors
                    ? { general: `${err.Error}${err.Details ? `: ${err.Details}` : ''}` }
                    : err
                : { general: err?.message || 'Login failed' };

            setErrors(newErrors);
        }
    }, [formData, login, navigate]);

    return (
        <div className={styles.loginPageWrapper}>
            <div className={styles.loginBox}>
                <h2>Login</h2>
                {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}

                <form onSubmit={handleSubmit}>
                    {['login', 'password'].map((field) => (
                        <div key={field} className={styles.inputGroup}>
                            <label htmlFor={field}>
                                {field === 'login' ? 'Email or Username:' : 'Password:'}
                            </label>
                            <input
                                id={field}
                                type={field === 'password' ? 'password' : 'text'}
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                required
                                placeholder={field === 'login' ? 'Enter Email or Username' : 'Enter Password'}
                                className={errors[field] ? styles.inputError : ''}
                            />
                            {errors[field] && <div className={styles.errorMessageField}>{errors[field]}</div>}
                        </div>
                    ))}
                    <button type="submit" className={styles.loginButton}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
