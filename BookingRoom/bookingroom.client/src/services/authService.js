import api from './api';

// Register function
export const register = async (registerData) => {
    try {
        const response = await api.post('/auth/register', registerData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            throw error.response.data;
        } else if (error.response && error.response.status === 500) {
            throw error.response.data;
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'Registration failed');
        }
    }
};
 
// Login function
export const login = async (loginData) => {
    try {
        const response = await api.post('/auth/login', {
            login: loginData.login.trim(),
            password: loginData.password
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                if (error.response.data.login || error.response.data.password || error.response.data.error) {
                    throw error.response.data; 
                } else {
                    throw { Error: error.response.data.Error || 'Invalid request' };
                }
            } else if (error.response.status === 403) {
                throw { error: error.response.data.error || 'Your account has been disabled. Please contact support.' };
            } else if (error.response.status === 500) {
                throw { Error: error.response.data.Error || 'Server error', Details: error.response.data.Details };
            }
        } else if (error.request) {
            throw { error: 'No response received from server. Please check if backend is running.' };
        }
        throw { error: error.message || 'Login failed' };
    }
};

//Hàm Forgot Password
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data; // response.data là chuỗi: "Reset link has been sent to your email."
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                throw error.response.data; // Chuỗi: "User with this email does not exist."
            } else if (error.response.status === 500) {
                throw error.response.data || 'Server error';
            }
        } else if (error.request) {
            throw 'No response from server. Please check if the backend is running.';
        }
        throw error.message || 'Failed to send reset password email';
    }
};

//Hàm Reset Password
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data; // Chuỗi: "Password reset successfully."
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                throw error.response.data || 'Invalid or expired token'; // Chuỗi
            } else if (error.response.status === 500) {
                throw error.response.data || 'Server error'; // Chuỗi
            }
        } else if (error.request) {
            throw 'No response from server. Please check if the backend is running.'; // Chuỗi
        }
        throw error.message || 'Failed to reset password'; // Chuỗi
    }
};

//Hàm Change Password
export const changePassword = async (oldPassword, newPassword) => {
    try {
        const response = await api.post(
            '/auth/change-password',
            { oldPassword, newPassword },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Thêm token vào header
                },
            }
        );
        return response.data; // Chuỗi: "Password changed successfully."
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                throw error.response.data || 'Invalid old password or server error'; // Chuỗi
            } else if (error.response.status === 401) {
                throw 'Unauthorized: Invalid or expired token'; // Chuỗi
            } else if (error.response.status === 500) {
                throw error.response.data || 'Server error'; // Chuỗi
            }
        } else if (error.request) {
            throw 'No response from server. Please check if the backend is running.'; // Chuỗi
        }
        throw error.message || 'Failed to change password'; // Chuỗi
    }
};

// Hàm lấy danh sách người dùng
export const getUsers = async (search = '', role = '', page = 1, pageSize = 10) => {
    try {
        const response = await api.get('/users', {
            params: { search, role, page, pageSize }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error('Unauthorized: Please log in as an Admin');
        } else if (error.response && error.response.status === 500) {
            throw error.response.data;
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'Failed to fetch users');
        }
    }
};
// Hàm lấy thông tin chi tiết người dùng
export const getUserById = async (id) => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('User not found');
        } else if (error.response && error.response.status === 500) {
            throw error.response.data;
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'Failed to fetch user details');
        }
    }
};

// Function to update user
export const updateUserStatus = async (userId, status) => {
    try {
        const response = await api.put(`/users/${userId}/status`, { status });
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 405) {
                throw new Error('Method not supported. Please check API endpoint.');
            } else if (error.response.status === 404) {
                throw new Error(error.response.data.error || 'Account does not exist');
            } else if (error.response.status === 500) {
                throw new Error(error.response.data.error || 'Server error');
            } else if (error.response.status === 401) {
                throw new Error('Access not allowed. Please log in again.');
            } else if (error.response.status === 403) {
                throw new Error('You do not have permission to perform this action.');
            }
        } else if (error.request) {
            throw new Error('No response received from server. Please check if backend is running.');
        }
        throw new Error(error.message || 'Update status failed.');
    }
};

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
    logoutCallback = callback;
};

//Logout function
export const logout = () => {
    if (logoutCallback) {
        logoutCallback();
    }
    localStorage.removeItem('token');
};

export default api;
