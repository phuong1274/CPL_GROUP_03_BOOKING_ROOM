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


// Lấy danh sách booking
export const getAllBookings = async (params = {}) => {
    try {
        const response = await api.get('/booking', { params });
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to fetch bookings (Status: ${status})`
        );
    }
};


// Lấy chi tiết 1 booking
export const getBookingById = async (id) => {
    try {
        const response = await api.get(`/booking/${id}`);
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to fetch booking details (Status: ${status})`
        );
    }
};

// Check-in 1 booking
export const checkInBooking = async (id) => {
    try {
        const response = await api.put(`/booking/${id}/checkin`);
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to check in booking (Status: ${status})`
        );
    }
};

// Check-out 1 booking
export const checkOutBooking = async (id) => {
    try {
        const response = await api.put(`/booking/${id}/checkout`);
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to check out booking (Status: ${status})`
        );
    }
};