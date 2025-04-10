import axios from 'axios';

// Khởi tạo instance axios với baseURL và headers mặc định
const api = axios.create({
    baseURL: 'https://localhost:7067/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Gắn token từ localStorage vào header Authorization trước mỗi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // 👈 Dòng này để in token ra console
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==== USER ====

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/customer/users/${id}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('User not found');
        } else if (error.response?.status === 500) {
            throw error.response.data;
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'Failed to fetch user details');
        }
    }
};

// ==== ROOM ====

export const getAvailableRooms = async (queryParams = {}) => {
    try {
        const { roomTypeId, date } = queryParams;

        const params = new URLSearchParams();
        if (roomTypeId) params.append('roomTypeId', roomTypeId);
        if (date) params.append('date', date);

        const url = `/CustomerRoom${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to fetch rooms');
    }
};

export const getRoomById = async (id) => {
    try {
        const response = await api.get(`/customer/booking/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room details');
    }
};

export const getRoomTypes = async () => {
    try {
        const response = await api.get('/CustomerRoom/roomtype');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to fetch room types');
    }
};

export const getRoomTypeById = async (id) => {
    try {
        const response = await api.get(`/CustomerRoom/roomtype/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room type details');
    }
};

export const getMediaByRoomId = async (roomId) => {
    try {
        const response = await api.get(`/CustomerRoom/roommedia/room/${roomId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch media');
    }
};

// ==== BOOKING ====

export const getMyBookings = async (params = {}) => {
    try {
        const response = await api.get('/customer/booking', { params });
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to fetch your bookings (Status: ${status})`
        );
    }
};

export const cancelBooking = async (id) => {
    try {
        const response = await api.put(`/customer/booking/${id}/cancel`);
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to cancel booking (Status: ${status})`
        );
    }
};

export const bookRoom = async (payload) => {
    try {
        const response = await api.post('/CustomerRoom/book', payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to book room');
    }
};
