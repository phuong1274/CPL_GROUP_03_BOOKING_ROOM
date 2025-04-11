import api from './api';

// ==== USER ====
// Get user detail
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
export const updateProfile = async (formData) => {
    try {
        const response = await api.put(
            '/customer/users/update-profile',
            formData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Thêm token vào header
                },
            }
        );
        return response.data; // Chuỗi: "Profile updated successfully."
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                throw error.response.data || 'Invalid data provided'; // Chuỗi
            } else if (error.response.status === 401) {
                throw 'Unauthorized: Please log in again.'; // Chuỗi
            } else if (error.response.status === 500) {
                throw error.response.data || 'Server error'; // Chuỗi
            }
        } else if (error.request) {
            throw 'No response from server. Please check if the backend is running.'; // Chuỗi
        }
        throw error.message || 'Failed to update profile'; // Chuỗi
    }
};

// ==== ROOM ====
// Get available room
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

// Get room by ID
export const getRoomById = async (id) => {
    try {
        const response = await api.get(`/customer/booking/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room details');
    }
};

// Get room type
export const getRoomTypes = async () => {
    try {
        const response = await api.get('/CustomerRoom/roomtype');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to fetch room types');
    }
};

// Get roomtype by id
export const getRoomTypeById = async (id) => {
    try {
        const response = await api.get(`/CustomerRoom/roomtype/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room type details');
    }
};

// Get media by roomid
export const getMediaByRoomId = async (roomId) => {
    try {
        const response = await api.get(`/CustomerRoom/roommedia/room/${roomId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch media');
    }
};

// ==== BOOKING ====

// Gte customer booking list
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

// Customer cancel booking
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

// Customer book room
export const bookRoom = async (payload) => {
    try {
        const response = await api.post('/CustomerRoom/book', payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to book room');
    }
};
