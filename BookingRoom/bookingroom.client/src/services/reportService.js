import api from './api';


// Get revenue report 
export const getRevenueReport = async (reportType, status = null, roomId = null) => {
    try {
        const params = new URLSearchParams();
        params.append('reportType', reportType);
        if (status) params.append('status', status);
        if (roomId) params.append('roomId', roomId);

        const url = `/RevenueReport${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to fetch revenue report');
    }
};