import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, deleteRoom } from '../services/api';

function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRooms();
    }, []);

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

    return (
        <div style={{ padding: '20px' }}>
            <h1>Room List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
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