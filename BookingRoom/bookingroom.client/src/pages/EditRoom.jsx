import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, updateRoom, getRoomTypes, addMedia, deleteMedia } from '../services/roomService';

function RoomDetail() {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [mediaItems, setMediaItems] = useState([]); 
    const [newMediaLink, setNewMediaLink] = useState('');
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
    const fetchData = async () => {
        try {
            const roomData = await getRoomById(id);
            console.log('Room data:', roomData); 
            setRoom({
                roomId: roomData.roomId,
                roomNumber: roomData.roomNumber,
                roomTypeId: roomData.roomTypeId,
                startDate: roomData.startDate.split('T')[0],
                endDate: roomData.endDate.split('T')[0],
                status: roomData.status,
            });
            setMediaItems(
                roomData.media
                    ? roomData.media.map((m) => ({
                          mediaId: m.mediaId,
                          mediaLink: `https://localhost:7067${m.media_Link}`,
                      }))
                    : []
            );
            const roomTypesData = await getRoomTypes();
            setRoomTypes(roomTypesData);
        } catch (err) {
            setError(err.message);
        }
    };
    fetchData();
}, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoom((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddMediaLink = () => {
        if (newMediaLink.trim()) {
            setMediaItems([
                ...mediaItems,
                {
                    mediaId: `temp-${Date.now()}`, 
                    mediaLink: newMedia_Link.trim(),
                },
            ]);
            setNewMediaLink('');
        }
    };

    const handleDeleteMedia = async (index) => {
        const mediaItem = mediaItems[index];
        if (!mediaItem.mediaId.startsWith('temp-')) {
            try {
                await deleteMedia(mediaItem.mediaId);
            } catch (err) {
                setError(err.message);
                return;
            }
        }
        setMediaItems(mediaItems.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            await updateRoom(id, room);

            const existingMediaLinks = room.media
                ? room.media.map((m) => `https://localhost:7067${m.mediaLink}`)
                : [];
            const newMediaItems = mediaItems.filter(
                (item) => !existingMediaLinks.includes(item.mediaLink)
            );
            for (const item of newMediaItems) {
                const mediaLink = item.mediaLink.replace('https://localhost:7067', '');
                await addMedia({
                    roomId: parseInt(id),
                    mediaLink: mediaLink,
                    description: '',
                    mediaType: 'Image',
                });
            }
            navigate('/rooms');
        } catch (err) {
            setError(err.message);
        }
    };

    if (!room) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Room Details</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ maxWidth: '500px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Room Number:</label>
                    <input
                        type="text"
                        name="roomNumber"
                        value={room.roomNumber}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Room Type:</label>
                    <select
                        name="roomTypeId"
                        value={room.roomTypeId}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        {roomTypes.map((type) => (
                            <option key={type.roomTypeId} value={type.roomTypeId}>
                                {type.roomTypeName}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
                    <select
                        name="status"
                        value={room.status}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Start Date:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={room.startDate}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>End Date:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={room.endDate}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
            </div>
            <h2>Media</h2>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Add Media (Image URL):</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        value={newMediaLink}
                        onChange={(e) => setNewMediaLink(e.target.value)}
                        placeholder="Enter image URL"
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <button
                        onClick={handleAddMediaLink}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Add Media File
                    </button>
                </div>
                {mediaItems.length > 0 && (
                    <div>
                        <h4>Media Links:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {mediaItems.map((item) => (
                                <div key={item.mediaId} style={{ position: 'relative' }}>
                                    <img
                                        src={item.mediaLink}
                                        alt="Preview"
                                        style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => (e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAjW6fUQAAAABJRU5ErkJggg==')}
                                    />
                                    <button
                                        onClick={() => handleDeleteMedia(mediaItems.indexOf(item))}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            padding: '5px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Save
                </button>
                <button
                    onClick={() => navigate('/rooms')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        Wborder: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Back to Room List
                </button>
            </div>
        </div>
    );
}

export default RoomDetail;