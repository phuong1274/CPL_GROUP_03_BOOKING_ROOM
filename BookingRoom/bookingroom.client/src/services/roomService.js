import api from './api';

// Upload media function
export const uploadMedia = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });
    try {
        const response = await api.post('/roommedia/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; 
    } catch (error) {
        throw new Error(error.response?.data || error.message || 'Failed to upload media');
    }
};

// Method to get room list
export const getRooms = async (queryParams = {}) => {
    try {
        const { roomNumber, status, roomTypeId } = queryParams;
        const params = new URLSearchParams();
        if (roomNumber) params.append('roomNumber', roomNumber);
        if (status) params.append('status', status);
        if (roomTypeId) params.append('roomTypeId', roomTypeId);
        const response = await api.get(`/room${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch rooms');
    }
};

// Method to get room by id
export const getRoomById = async (id) => {
    try {
        const response = await api.get(`/room/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room details');
    }
};

// Method to add room
export const addRoom = async (roomData) => {
    try {
        const response = await api.post('/room', roomData);
        return response.data; 
    } catch (error) {
        const serverError = error.response?.data?.error || error.message || 'Unknown error';
        throw new Error(serverError);
    }
};

//Method to update room
export const updateRoom = async (id, roomData) => {
    try {
        const response = await api.put(`/room/${id}`, roomData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update room';
        throw new Error(errorMessage);
    }
};
// Method to delete room
export const deleteRoom = async (id) => {
    try {
        await api.delete(`/room/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to delete room');
    }
};

// Method to get room type
export const getRoomTypes = async () => {
    try {
        const response = await api.get('/roomtype');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room types');
    }
};

// Function to get room type by ID
export const getRoomTypeById = async (id) => {
    try {
        const response = await api.get(`/roomtype/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room type details');
    }
};

// Add room type function
export const addRoomType = async (roomTypeData) => {
    try {
        const response = await api.post('/roomtype', roomTypeData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to add room type');
    }
};
// Update room type function
export const updateRoomType = async (id, roomTypeData) => {
    const payload = {
        roomTypeID: id, 
        roomTypeID: id,
        roomTypeName: roomTypeData.roomTypeName,
        description: roomTypeData.description,
        price: roomTypeData.price,
        validDate: roomTypeData.validDate
    };

    try {
        await api.put(`/roomtype/${id}`, payload);
    } catch (error) {
        console.error('API PUT error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.Error || error.message || 'Failed to update room type');
    }
};

// Delete room type function
export const deleteRoomType = async (id) => {
    try {
        await api.delete(`/roomtype/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to delete room type');
    }
};

// Get media by roomid function
export const getMediaByRoomId = async (roomId) => {
    try {
        const response = await api.get(`/roommedia/room/${roomId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch media');
    }
};

// Add media function
export const addMedia = async (mediaData) => {
    try {
        if (mediaData.file) {
            const formData = new FormData();
            formData.append('RoomID', mediaData.roomId);
            formData.append('files', mediaData.file);
            const response = await api.post('/roommedia/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data[0]; // Assuming the response returns an array of media
        } else {
            const response = await api.post('/roommedia', {
                RoomID: mediaData.roomId,
                Media_Link: mediaData.mediaLink,
                Description: mediaData.description,
                MediaType: mediaData.mediaType,
            });
            return response.data;
        }
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to add media');
    }
};

// Delete media function
export const deleteMedia = async (id) => {
    try {
        await api.delete(`/roommedia/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to delete media');
    }
};
export const deleteMediaByRoomId = async (roomId) => {
    try {
        await api.delete(`/roommedia/room/${roomId}`);
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to delete media by room');
    }
};