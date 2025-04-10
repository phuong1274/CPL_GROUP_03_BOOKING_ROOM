import api from './api';

// Get booking list
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


// Get details of 1 booking
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
        const data = error.response?.data;
        if (data?.error) {
            throw new Error(`${data.error.code}: ${data.error.details}`);
        }
        throw new Error(
            data?.message || error.message || `Failed to check in booking (Status: ${status})`
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