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

// Hàm upload nhiều file (ảnh hoặc video)
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
        return response.data; // Trả về danh sách { url, type }
    } catch (error) {
        throw new Error(error.response?.data || error.message || 'Failed to upload media');
    }
};

// Hàm lấy danh sách phòng
export const getRooms = async (queryParams = {}) => {
    try {
        const { roomNumber, status, roomTypeId } = queryParams;
        const params = new URLSearchParams();

        // Thêm các tham số vào query string nếu có
        if (roomNumber) params.append('roomNumber', roomNumber);
        if (status) params.append('status', status);
        if (roomTypeId) params.append('roomTypeId', roomTypeId);

        // Gọi API với query string
        const response = await api.get(`/room${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch rooms');
    }
};

// Hàm lấy phòng theo ID
export const getRoomById = async (id) => {
    try {
        const response = await api.get(`/room/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room details');
    }
};

// Hàm thêm phòng
export const addRoom = async (roomData) => {
    try {
        const response = await api.post('/room', roomData);
        return response.data; // { roomID, roomNumber, ... }
    } catch (error) {
        // ✅ Đọc lỗi từ backend
        const serverError = error.response?.data?.error || error.message || 'Unknown error';
        throw new Error(serverError);
    }
};


export const updateRoom = async (id, roomData) => {
    try {
        // Transform data to match backend expectations
        const payload = {
            RoomID: parseInt(id),
            RoomNumber: roomData.roomNumber,
            RoomTypeID: parseInt(roomData.roomTypeId),
            Status: roomData.status,
            StartDate: roomData.startDate ? new Date(roomData.startDate) : null,
            EndDate: roomData.endDate ? new Date(roomData.endDate) : null
        };

        const response = await api.put(`/room/${id}`, payload);
        return response.data;
    } catch (error) {
        // Enhanced error handling
        const errorMessage = error.response?.data?.toString() ||
            error.response?.statusText ||
            error.message ||
            'Failed to update room';
        throw new Error(errorMessage);
    }
};
// Hàm xóa phòng
export const deleteRoom = async (id) => {
    try {
        await api.delete(`/room/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to delete room');
    }
};

// Hàm lấy danh sách loại phòng
export const getRoomTypes = async () => {
    try {
        const response = await api.get('/roomtype');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room types');
    }
};

// Hàm lấy loại phòng theo ID
export const getRoomTypeById = async (id) => {
    try {
        const response = await api.get(`/roomtype/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room type details');
    }
};

// Hàm thêm loại phòng
export const addRoomType = async (roomTypeData) => {
    try {
        const response = await api.post('/roomtype', roomTypeData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to add room type');
    }
};

export const updateRoomType = async (id, roomTypeData) => {
    const payload = {
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

// Hàm xóa loại phòng
export const deleteRoomType = async (id) => {
    try {
        await api.delete(`/roomtype/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to delete room type');
    }
};

// Hàm lấy media theo RoomID
export const getMediaByRoomId = async (roomId) => {
    try {
        const response = await api.get(`/roommedia/room/${roomId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch media');
    }
};

// Hàm thêm media
export const addMedia = async (mediaData) => {
    try {
        const response = await api.post('/roommedia', {
            RoomID: mediaData.roomID, 
            Media_Link: mediaData.media_Link,
            Description: mediaData.description,
            MediaType: mediaData.mediaType,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to add media');
    }
};

// Hàm xóa media
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