import axios from 'axios';

// Tạo instance của axios
const api = axios.create({
    baseURL: 'https://localhost:7067/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để gắn token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Hàm register
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

// Hàm login
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
                if (error.response.data.login) {
                    throw new Error(error.response.data.login);
                } else if (error.response.data.password) {
                    throw new Error(error.response.data.password);
                } else if (error.response.data.error) {
                    throw new Error(error.response.data.error);
                } else {
                    throw new Error(error.response.data.Error || 'Yêu cầu không hợp lệ');
                }
            } else if (error.response.status === 403) {
                throw new Error(error.response.data.error || 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.');
            } else if (error.response.status === 500) {
                throw new Error(error.response.data.Error || 'Lỗi server');
            }
        } else if (error.request) {
            throw new Error('Không nhận được phản hồi từ server. Vui lòng kiểm tra xem backend có đang chạy không.');
        }
        throw new Error(error.message || 'Đăng nhập thất bại');
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

export const updateUserStatus = async (userId, status) => {
    try {
        const response = await api.put(`/users/${userId}/status`, { status });
        return response.data; 
    } catch (error) {
        if (error.response) {
            if (error.response.status === 405) {
                throw new Error('Phương thức không được hỗ trợ. Vui lòng kiểm tra API endpoint.');
            } else if (error.response.status === 404) {
                throw new Error(error.response.data.error || 'Tài khoản không tồn tại');
            } else if (error.response.status === 500) {
                throw new Error(error.response.data.error || 'Lỗi server');
            } else if (error.response.status === 401) {
                throw new Error('Không được phép truy cập. Vui lòng đăng nhập lại.');
            } else if (error.response.status === 403) {
                throw new Error('Bạn không có quyền thực hiện hành động này.');
            }
        } else if (error.request) {
            throw new Error('Không nhận được phản hồi từ server. Vui lòng kiểm tra xem backend có đang chạy không.');
        }
        throw new Error(error.message || 'Cập nhật trạng thái thất bại');
    }
};

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
    logoutCallback = callback;
};

export const logout = () => {
    if (logoutCallback) {
        logoutCallback();
    }
    localStorage.removeItem('token');
};

export default api;