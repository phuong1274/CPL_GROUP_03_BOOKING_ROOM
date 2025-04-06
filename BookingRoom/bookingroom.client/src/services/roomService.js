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
export const getRooms = async () => {
    try {
        const response = await api.get('/room');
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


// Hàm sửa phòng
export const updateRoom = async (id, roomData) => {
    try {
        await api.put(`/room/${id}`, roomData);
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to update room');
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

// Hàm sửa loại phòng
export const updateRoomType = async (id, roomTypeData) => {
    try {
        await api.put(`/roomtype/${id}`, roomTypeData);
    } catch (error) {
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