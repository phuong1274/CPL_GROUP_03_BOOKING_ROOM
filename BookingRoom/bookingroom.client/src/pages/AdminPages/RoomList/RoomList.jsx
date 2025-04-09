import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, deleteRoom, getRoomTypes } from '../../../services/api';

function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    const [roomNumber, setRoomNumber] = useState('');
    const [status, setStatus] = useState('');
    const [roomTypeId, setRoomTypeId] = useState('');
    const [roomTypes, setRoomTypes] = useState([]); // Lưu danh sách room types để hiển thị trong dropdown
    const navigate = useNavigate();

    // Lấy danh sách phòng và room types khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Sử dụng getRoomTypes từ api.js thay vì fetch thủ công
                const roomTypesData = await getRoomTypes();
                setRoomTypes(roomTypesData);

                // Lấy danh sách phòng với các tham số lọc hiện tại
                fetchRooms();
            } catch (err) {
                setError(err.message);
            }
        };
        fetchData();
    }, []); // Chỉ chạy một lần khi component mount

    // Hàm lấy danh sách phòng với các tham số lọc
    const fetchRooms = async () => {
        try {
            const params = {
                roomNumber: roomNumber,
                status: status,
                roomTypeId: roomTypeId,
            };

            const data = await getRooms(params);
            setRooms(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Cập nhật danh sách phòng khi các tham số lọc thay đổi
    useEffect(() => {
        fetchRooms();
    }, [roomNumber, status, roomTypeId]); // Khi lọc thay đổi, gọi lại fetchRooms

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteRoom(id);
                setRooms(rooms.filter((room) => room.roomID !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleResetFilters = () => {
        setRoomNumber('');
        setStatus('');
        setRoomTypeId('');
    };

    return (

        <div style={{ padding: '20px' }}>
            <h1>Room List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Bộ lọc */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label style={{ marginRight: '10px' }}>Search Room Number:</label>
                    <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="Enter room number..."
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div>
                    <label style={{ marginRight: '10px' }}>Filter by Status:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">All</option>
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>

                <div>
                    <label style={{ marginRight: '10px' }}>Filter by Room Type:</label>
                    <select
                        value={roomTypeId}
                        onChange={(e) => setRoomTypeId(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">All</option>
                        {roomTypes && roomTypes.length > 0 ? (
                            roomTypes.map((type) => (
                                <option key={type.roomTypeID} value={type.roomTypeID}>
                                    {type.roomTypeName}
                                </option>
                            ))
                        ) : (
                            <option disabled>Loading...</option>
                        )}
                    </select>
                </div>

                <button
                    onClick={handleResetFilters}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Reset Filters
                </button>
            </div>

            <button
                onClick={() => navigate('/add-room')}
                style={{
                    marginBottom: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Add New Room
            </button>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Room Number</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Room Type</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room) => (
                        <tr key={room.roomID}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{room.roomNumber}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{room.roomTypeName}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{room.status}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                    onClick={() => navigate(`/edit-room/${room.roomID}`)}
                                    style={{
                                        marginRight: '10px',
                                        padding: '5px 10px',
                                        backgroundColor: '#ffc107',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(room.roomID)}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RoomList;