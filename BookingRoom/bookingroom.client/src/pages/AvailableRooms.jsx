import React, { useEffect, useState } from 'react';
import {
    getRoomTypes,
    getRoomTypeById,
    getAvailableRooms,
    getRoomById, bookRoom
} from '../services/customerService';
import { useNavigate } from 'react-router-dom';

export default function AvailableRooms() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [roomTypeId, setRoomTypeId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if (selectedDate || roomTypeId) {
            fetchAvailableRooms();
        }
    }, [roomTypeId, selectedDate]);

    const fetchRoomTypes = async () => {
        try {
            const types = await getRoomTypes();
            setRoomTypes(types);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchAvailableRooms = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = {};
            if (roomTypeId) params.roomTypeId = roomTypeId;
            if (selectedDate) params.date = selectedDate;

            const data = await getAvailableRooms(params);

            const enrichedRooms = await Promise.all(
                data.map(async (room) => {
                    try {
                        const [roomType, roomDetail] = await Promise.all([
                            getRoomTypeById(room.roomTypeID),
                            getRoomById(room.roomID)
                        ]);

                        return {
                            ...room,
                            roomTypeName: roomType?.roomTypeName || 'N/A',
                            price: roomType?.price || 0,
                            media: roomDetail?.media || [],
                        };
                    } catch (err) {
                        console.error(`Error enriching room ${room.roomID}:`, err);
                        return {
                            ...room,
                            roomTypeName: 'N/A',
                            price: 0,
                            media: [],
                        };
                    }
                })
            );

            setRooms(enrichedRooms);
        } catch (err) {
            setError(err.message);
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoomTypeChange = (e) => {
        setRoomTypeId(e.target.value);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleBook = async (room) => {
        // Check for selected date
        if (!selectedDate) {
            alert("Please select a date before booking.");
            return;
        }

        // Check for token
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to book a room");
            navigate('/login');
            return;
        }

        try {
            const checkInDate = new Date(selectedDate).toISOString();
            const payload = {
                RoomID: room.roomID,
                CheckInDate: checkInDate
            };

            const result = await bookRoom(payload);
            alert(`Successfully booked Room ${room.roomNumber} for ${selectedDate}`);
            navigate('/my-booking');
        } catch (err) {
            console.error('Booking error:', err);
            alert(`Failed to book room: ${err.message}`);

            // If unauthorized, redirect to login
            if (err.message.includes('Unauthorized') || err.message.includes('Session expired')) {
                navigate('/login');
            }
        }
    };

    const renderMediaPreview = (media) => {
        if (!media || media.length === 0) {
            return (
                <div className="w-24 h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500 text-xs">No media</span>
                </div>
            );
        }

        const first = media[0];
        const link = `https://localhost:7067${first.media_Link}`;
        const type = first.mediaType;

        return (
            <div className="w-24 h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-100 overflow-hidden">
                {type === 'Image' ? (
                    <img
                        src={link}
                        alt="Room"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100';
                            e.target.className = 'w-full h-full object-contain p-2';
                        }}
                    />
                ) : type === 'Video' ? (
                    <video className="w-full h-full object-cover" controls>
                        <source src={link} type="video/mp4" />
                    </video>
                ) : type === 'Audio' ? (
                    <audio controls src={link} className="w-full" />
                ) : (
                    <span className="text-gray-500 text-xs">Unsupported media</span>
                )}
            </div>
        );
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="flex gap-4 mb-4 flex-wrap">
                <div className="flex items-center">
                    <label className="mr-2 whitespace-nowrap">Filter by Room Type:</label>
                    <select
                        value={roomTypeId}
                        onChange={handleRoomTypeChange}
                        className="border px-2 py-1 rounded min-w-[150px]"
                    >
                        <option value="">All Room Types</option>
                        {roomTypes.map((type) => (
                            <option key={type.roomTypeID} value={type.roomTypeID}>
                                {type.roomTypeName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center">
                    <label className="mr-2 whitespace-nowrap">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="border px-2 py-1 rounded"
                        required
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <table className="table-auto w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-4 py-2">Media</th>
                            <th className="border px-4 py-2">Room Number</th>
                            <th className="border px-4 py-2">Room Type</th>
                            <th className="border px-4 py-2">Description</th>
                                <th className="border px-4 py-2">Price</th>
                                <th className="border px-4 py-2"></th>

                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="border px-4 py-2 text-center text-gray-500">
                                    {selectedDate ?
                                        "No rooms available for the selected criteria." :
                                        "Please select a date to see available rooms."}
                                </td>
                            </tr>
                        ) : (
                            rooms.map((room) => (
                                <tr key={room.roomID}>
                                    <td className="border px-4 py-2">
                                        {renderMediaPreview(room.media)}
                                    </td>
                                    <td className="border px-4 py-2">{room.roomNumber}</td>
                                    <td className="border px-4 py-2">{room.roomTypeName}</td>
                                    <td className="border px-4 py-2">{room.description || 'N/A'}</td>
                                    <td className="border px-4 py-2">${room.price.toFixed(2)} /Day</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => handleBook(room)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                        >
                                            Book
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}