import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomTypes, deleteRoomType } from '../services/api';

function RoomType() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const data = await getRoomTypes();
                setRoomTypes(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRoomTypes();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room type?')) {
            try {
                await deleteRoomType(id);
                setRoomTypes(roomTypes.filter((type) => type.roomTypeID !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Room Type List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button
                onClick={() => navigate('/add-room-type')}
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
                Add New Room Type
            </button>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Valid Date</th>
                        <th style={{ border: '1px solid #ddd', padding: '8mpx' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {roomTypes.map((type) => (
                        <tr key={type.roomTypeID}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{type.roomTypeName}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{type.price}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {new Date(type.validDate).toLocaleDateString()}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                    onClick={() => navigate(`/edit-room-type/${type.roomTypeID}`)}
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
                                    onClick={() => handleDelete(type.roomTypeID)}
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

export default RoomType;