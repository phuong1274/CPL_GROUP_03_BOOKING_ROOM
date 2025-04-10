import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getRoomTypes,
    deleteRoomType,
    addRoomType,
    updateRoomType,
    getRoomTypeById
} from '../services/roomService';

function RoomType() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [filteredRoomTypes, setFilteredRoomTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomTypeId, setRoomTypeId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [roomType, setRoomType] = useState({
        roomTypeName: '',
        description: '',
        price: '',
        validDate: '',
    });
    const navigate = useNavigate();

    const fetchRoomTypes = async () => {
        try {
            const data = await getRoomTypes();
            setRoomTypes(data);
            setFilteredRoomTypes(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = roomTypes.filter(type =>
            type.roomTypeName.toLowerCase().includes(term)
        );
        setFilteredRoomTypes(filtered);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room type?')) {
            try {
                await deleteRoomType(id);
                setRoomTypes(roomTypes.filter((type) => type.roomTypeID !== id));
                setFilteredRoomTypes(filteredRoomTypes.filter((type) => type.roomTypeID !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleEdit = async (id) => {
        setIsLoading(true);
        try {
            const data = await getRoomTypeById(id);
            console.log("Fetched roomType by ID:", data);
            setRoomType({
                roomTypeName: data.roomTypeName,
                description: data.description,
                price: data.price,
                validDate: data.validDate?.split('T')[0] || '',
            });
            setRoomTypeId(id);
            setIsModalOpen(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setRoomType({
            roomTypeName: '',
            description: '',
            price: '',
            validDate: '',
        });
        setRoomTypeId(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRoomTypeId(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomType(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedDate = new Date(roomType.validDate);
            if (selectedDate <= new Date()) {
                setError("Valid date must be in the future");
                return;
            }

            console.log('Submitting updateRoomType with ID:', roomTypeId);
            console.log('Data being sent:', roomType);

            const dataToSend = {
                roomTypeName: roomType.roomTypeName,
                description: roomType.description,
                price: parseFloat(roomType.price),
                validDate: roomType.validDate
            };

            if (roomTypeId) {
                await updateRoomType(roomTypeId, dataToSend);
            } else {
                await addRoomType(dataToSend);
            }

            await fetchRoomTypes();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
            console.error('Operation error:', err);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Room Type List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {isLoading && <p>Loading...</p>}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                        padding: '8px',
                        width: '300px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <button
                    onClick={handleAdd}
                    style={{
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
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Valid Date</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRoomTypes.map((type) => (
                        <tr key={type.roomTypeID}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{type.roomTypeName}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{type.description}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{type.price}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {new Date(type.validDate).toLocaleDateString()}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                    onClick={() => handleEdit(type.roomTypeID)}
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

            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '500px',
                        maxWidth: '90%',
                    }}>
                        <h2>{roomTypeId ? 'Edit Room Type' : 'Add Room Type'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                                <input
                                    type="text"
                                    name="roomTypeName"
                                    value={roomType.roomTypeName}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                                <textarea
                                    name="description"
                                    value={roomType.description}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Price:</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={roomType.price}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Valid Date:</label>
                                <input
                                    type="date"
                                    name="validDate"
                                    value={roomType.validDate}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: roomTypeId ? '#007bff' : '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {roomTypeId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomType;
