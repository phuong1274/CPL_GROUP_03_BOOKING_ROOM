import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/customerService';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './UpdateProfile.module.css';

const UpdateProfile = () => {
    const { user, token, login, logout } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        phoneNumber: '',
        email: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                email: user.email || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (!token) {
            setServerError('You need to log in to edit your profile.');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [token, navigate]);

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        switch (name) {
            case 'username':
                if (!value || value.length < 3) newErrors.username = 'Username must be at least 3 characters long';
                else delete newErrors.username;
                break;
            case 'fullName':
                if (!value || value.length < 2) newErrors.fullName = 'Full name must be at least 2 characters long';
                else delete newErrors.fullName;
                break;
            case 'phoneNumber':
                if (!value || !/^[0-9]{10,15}$/.test(value)) newErrors.phoneNumber = 'Phone number must be 10-15 digits';
                else delete newErrors.phoneNumber;
                break;
            case 'email':
                if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = 'Please enter a valid email address';
                else delete newErrors.email;
                break;
            default:
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username || formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters long';
        if (!formData.fullName || formData.fullName.length < 2) newErrors.fullName = 'Full name must be at least 2 characters long';
        if (!formData.phoneNumber || !/^[0-9]{10,15}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10-15 digits';
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);
        setSuccess(null);

        if (!validateForm()) return;

        try {
            const response = await updateProfile(formData);
            const updatedUser = {
                ...user,
                username: response.username || formData.username,
                fullName: response.fullName || formData.fullName,
                phoneNumber: response.phoneNumber || formData.phoneNumber,
                email: response.email || formData.email,
            };
            login(token, updatedUser);
            setSuccess('Profile updated successfully.');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                const errorMessage = err.message || 'Failed to update profile';
                if (errorMessage.includes('Unauthorized')) {
                    setServerError('Session expired. Redirecting to login...');
                    setTimeout(() => {
                        logout();
                        navigate('/login');
                    }, 2000);
                } else {
                    setServerError(errorMessage);
                }
            }
        }
    };

    return (
        <div className={`container ${styles.customContainer}`}>
            <div className="row justify-content-center align-items-center min-vh-100">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className={`card ${styles.customCard}`}>
                        <div className="card-body p-4 p-md-5">
                            <h2 className={`card-title text-center ${styles.cardTitle}`}>
                                Update Your Profile
                            </h2>
                            {serverError && (
                                <div className={`alert alert-danger ${styles.alert} ${styles.alertError}`} role="alert">
                                    {serverError}
                                </div>
                            )}
                            {success && (
                                <div className={`alert alert-success ${styles.alert} ${styles.alertSuccess}`} role="alert">
                                    {success}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="username" className={`form-label ${styles.formLabel}`}>
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`form-control ${styles.formControl} ${errors.username ? 'is-invalid' : ''}`}
                                        required
                                    />
                                    {errors.username && (
                                        <div className="invalid-feedback">{errors.username}</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="fullName" className={`form-label ${styles.formLabel}`}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`form-control ${styles.formControl} ${errors.fullName ? 'is-invalid' : ''}`}
                                        required
                                    />
                                    {errors.fullName && (
                                        <div className="invalid-feedback">{errors.fullName}</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="phoneNumber" className={`form-label ${styles.formLabel}`}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={`form-control ${styles.formControl} ${errors.phoneNumber ? 'is-invalid' : ''}`}
                                        required
                                    />
                                    {errors.phoneNumber && (
                                        <div className="invalid-feedback">{errors.phoneNumber}</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className={`form-label ${styles.formLabel}`}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`form-control ${styles.formControl} ${errors.email ? 'is-invalid' : ''}`}
                                        required
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </div>
                                <div className="d-grid gap-3">
                                    <button type="submit" className={`btn ${styles.submitButton}`}>
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className={styles.backButton}
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

export default UpdateProfile;