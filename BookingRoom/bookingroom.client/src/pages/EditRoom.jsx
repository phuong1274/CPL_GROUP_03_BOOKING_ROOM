import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, updateRoom, getRoomTypes, addMedia, deleteMedia, deleteMediaByRoomId } from '../services/roomService';

function RoomDetail() {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [newMediaLink, setNewMediaLink] = useState('');
    const [newMediaType, setNewMediaType] = useState('Image');
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomData = await getRoomById(id);
                console.log('roomData:', roomData);
                console.log('roomData.media:', roomData.media);
                setRoom({
                    roomId: roomData.roomID,
                    roomNumber: roomData.roomNumber,
                    roomTypeId: roomData.roomTypeID,
                    startDate: roomData.startDate.split('T')[0],
                    endDate: roomData.endDate.split('T')[0],
                    status: roomData.status,
                    description: roomData.description,
                    media: roomData.media || [],
                });

                setMediaItems(
                    roomData.media
                        ? roomData.media.map((m) => ({
                            mediaId: m.MediaID,
                            mediaLink: `https://localhost:7067${m.media_Link}`,
                            mediaType: m.mediaType || 'Image',
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
                    mediaLink: newMediaLink.trim(),
                    mediaType: newMediaType,
                },
            ]);
            setNewMediaLink('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            const fileType = file.type.split('/')[0]; // 'image', 'video', 'audio'
            const mediaType = fileType === 'image' ? 'Image' :
                fileType === 'video' ? 'Video' :
                    fileType === 'audio' ? 'Audio' : 'File';

            setMediaItems([
                ...mediaItems,
                {
                    mediaId: `temp-${Date.now()}`,
                    mediaLink: objectUrl,
                    file: file,
                    mediaType: mediaType,
                },
            ]);
        }
    };

    const handleDeleteMedia = async (index) => {
        const mediaItem = mediaItems[index];

        if (mediaItem.mediaId && typeof mediaItem.mediaId === 'string' && !mediaItem.mediaId.startsWith('temp-')) {
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
            const roomDTO = {
                RoomID: parseInt(id),
                RoomNumber: room.roomNumber,
                RoomTypeID: parseInt(room.roomTypeId),
                description: room.description,
                StartDate: new Date(room.startDate).toISOString().split('.')[0],
                EndDate: new Date(room.endDate).toISOString().split('.')[0],
                Status: room.status,
            };

            await updateRoom(id, roomDTO);

            // Delete all existing media first
            await deleteMediaByRoomId(id);

            // Upload all current media items
            for (const item of mediaItems) {
                if (item.file) {
                    await addMedia({
                        roomId: parseInt(id),
                        file: item.file,
                        description: '',
                        mediaType: item.mediaType,
                    });
                } else {
                    const mediaLink = item.mediaLink.replace('https://localhost:7067', '');
                    await addMedia({
                        roomId: parseInt(id),
                        mediaLink: mediaLink,
                        description: '',
                        mediaType: item.mediaType,
                    });
                }
            }

            navigate('/rooms');
        } catch (err) {
            setError(err.message);
        }
    };

    const renderMediaPreview = (item) => {
        switch (item.mediaType) {
            case 'Image':
                return (
                    <img
                        src={item.mediaLink}
                        alt="Preview"
                        style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/200')}
                    />
                );
            case 'Video':
                return (
                    <video
                        controls
                        style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                    >
                        <source src={item.mediaLink} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'Audio':
                return (
                    <audio controls style={{ width: '200px', marginTop: '50px' }}>
                        <source src={item.mediaLink} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                );
            default:
                return (
                    <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <span>{item.mediaType} File</span>
                    </div>
                );
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
                    <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                    <textarea
                        name="description"
                        value={room.description}
                        onChange={handleChange}
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            resize: 'vertical',
                        }}
                    />
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
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Upload File:</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}
                    />
                </div>
                {mediaItems.length > 0 && (
                    <div>
                        <h4>Media Preview:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {mediaItems.map((item, index) => (
                                <div key={item.mediaId} style={{ position: 'relative' }}>
                                    {renderMediaPreview(item)}
                                    <button
                                        onClick={() => handleDeleteMedia(index)}
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
                        border: 'none',
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