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
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomData = await getRoomById(id);
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
                setErrors({ general: err.response?.data?.message || err.message || 'Failed to fetch room data' });
            }
        };

        fetchData();
    }, [id]);

    const validateForm = () => {
        const newErrors = {};

        if (!room.roomNumber.trim()) {
            newErrors.roomNumber = 'Room number is required';
        } else if (!/^\d+$/.test(room.roomNumber.trim())) {
            newErrors.roomNumber = 'Room number must be a valid number (digits only)';
        }

        if (!room.roomTypeId) {
            newErrors.roomTypeId = 'Room type is required';
        }

        if (!room.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!room.endDate) {
            newErrors.endDate = 'End date is required';
        }

        if (room.startDate && room.endDate) {
            const start = new Date(room.startDate);
            const end = new Date(room.endDate);
            if (end <= start) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        if (!room.status) {
            newErrors.status = 'Status is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoom((prev) => ({ ...prev, [name]: value }));

        // Clear the error for the current field
        setErrors((prev) => ({ ...prev, [name]: '' }));

        // Real-time validation for each field
        if (name === 'roomNumber') {
            if (!value.trim()) {
                setErrors((prev) => ({ ...prev, roomNumber: 'Room number is required' }));
            } else if (!/^\d+$/.test(value.trim())) {
                setErrors((prev) => ({ ...prev, roomNumber: 'Room number must be a valid number (digits only)' }));
            }
        }

        if (name === 'roomTypeId') {
            if (!value) {
                setErrors((prev) => ({ ...prev, roomTypeId: 'Room type is required' }));
            }
        }

        if (name === 'startDate') {
            if (!value) {
                setErrors((prev) => ({ ...prev, startDate: 'Start date is required' }));
            } else if (room.endDate) {
                const start = new Date(value);
                const end = new Date(room.endDate);
                if (end <= start) {
                    setErrors((prev) => ({ ...prev, endDate: 'End date must be after start date' }));
                }
            }
        }

        if (name === 'endDate') {
            if (!value) {
                setErrors((prev) => ({ ...prev, endDate: 'End date is required' }));
            } else if (room.startDate) {
                const start = new Date(room.startDate);
                const end = new Date(value);
                if (end <= start) {
                    setErrors((prev) => ({ ...prev, endDate: 'End date must be after start date' }));
                }
            }
        }

        if (name === 'status') {
            if (!value) {
                setErrors((prev) => ({ ...prev, status: 'Status is required' }));
            }
        }
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
            const fileType = file.type.split('/')[0];
            const mediaType =
                fileType === 'image' ? 'Image' :
                    fileType === 'video' ? 'Video' :
                        fileType === 'audio' ? 'Audio' : 'File';

            setMediaItems([
                ...mediaItems,
                {
                    mediaId: `temp-${Date.now()}`,
                    mediaLink: objectUrl,
                    file,
                    mediaType,
                },
            ]);
        }
    };

    const handleDeleteMedia = async (index) => {
        const mediaItem = mediaItems[index];

        if (mediaItem.mediaId && !mediaItem.mediaId.toString().startsWith('temp-')) {
            try {
                await deleteMedia(mediaItem.mediaId);
            } catch (err) {
                setErrors({ general: err.response?.data?.message || err.message || 'Failed to delete media' }); return;
            }
        }

        setMediaItems(mediaItems.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const roomDTO = {
                RoomID: parseInt(id),
                RoomNumber: room.roomNumber,
                RoomTypeID: parseInt(room.roomTypeId),
                Description: room.description || '',
                StartDate: new Date(room.startDate).toISOString().split('.')[0],
                EndDate: new Date(room.endDate).toISOString().split('.')[0],
                Status: room.status,
            };

            // Capture the response from updateRoom
            const updateResponse = await updateRoom(id, roomDTO);
            await deleteMediaByRoomId(id);
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
                        mediaLink,
                        description: '',
                        mediaType: item.mediaType,
                    });
                }
            }

            // Set success message from backend response
            setErrors({});
            setSuccessMessage(updateResponse.message || 'Room updated successfully');
            setTimeout(() => {
                setSuccessMessage('');
                navigate('/rooms');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save changes.';
            if (errorMessage.toLowerCase().includes('room number already exists')) {
                setErrors((prev) => ({ ...prev, roomNumber: 'Room number already exists' }));
            } else {
                setErrors((prev) => ({ ...prev, general: errorMessage }));
            }
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
            {errors.general && (
                <div style={{
                    color: 'white',
                    backgroundColor: '#dc3545',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{errors.general}</span>
                    <button
                        onClick={() => setErrors((prev) => ({ ...prev, general: '' }))}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>
            )}
            {successMessage && (
                <p style={{
                    color: 'white',
                    backgroundColor: '#28a745',
                    padding: '10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '20px'
                }}>
                    {successMessage}
                </p>
            )}

            <div style={{ maxWidth: '500px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Room Number:</label>
                    <input
                        type="text"
                        name="roomNumber"
                        value={room.roomNumber}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: errors.roomNumber ? '1px solid red' : '1px solid #ddd',
                        }}
                        required
                    />
                    {errors.roomNumber && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.roomNumber}
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Room Type:</label>
                    <select
                        name="roomTypeId"
                        value={room.roomTypeId}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: errors.roomTypeId ? '1px solid red' : '1px solid #ddd',
                        }}
                    >
                        <option value="">Select Room Type</option>
                        {roomTypes.map((type) => (
                            <option key={type.roomTypeID} value={type.roomTypeID}>
                                {type.roomTypeName}
                            </option>
                        ))}
                    </select>
                    {errors.roomTypeId && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.roomTypeId}
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
                    <select
                        name="status"
                        value={room.status}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: errors.status ? '1px solid red' : '1px solid #ddd',
                        }}
                    >
                        <option value="">Select Status</option>
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                    {errors.status && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.status}
                        </p>
                    )}
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
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: errors.startDate ? '1px solid red' : '1px solid #ddd',
                        }}
                        required
                    />
                    {errors.startDate && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.startDate}
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>End Date:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={room.endDate}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: errors.endDate ? '1px solid red' : '1px solid #ddd',
                        }}
                        required
                    />
                    {errors.endDate && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.endDate}
                        </p>
                    )}
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