import { register, login, forgotPassword, resetPassword, changePassword, getUsers, getUserById, updateUserStatus, setLogoutCallback } from './authService';
import { getRooms, deleteRoom, getRoomTypes, deleteRoomType, addRoom, addMedia, deleteMediaByRoomId, deleteMedia, getRoomById, updateRoom } from './roomService';
import { updateProfile } from './customerService'

export { register, login, forgotPassword, resetPassword, changePassword, getUsers, getUserById, updateUserStatus, setLogoutCallback };
export { getRooms, deleteRoom, deleteRoomType, addRoom, getRoomTypes, addMedia, deleteMediaByRoomId, deleteMedia, getRoomById, updateRoom };
export { updateProfile } from './customerService'
