import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRoom, getRoomTypes, addMedia, uploadMedia } from '../services/roomService';

function AddRoom() {
    const [room, setRoom] = useState({
        roomNumber: '',
        roomTypeID: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Available',
    });

    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaData, setMediaData] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const data = await getRoomTypes();
                setRoomTypes(data);
                if (data.length > 0) {
                    setRoom((prev) => ({ ...prev, roomTypeID: data[0].roomTypeID }));
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRoomTypes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoom((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const uploadedMedia = await uploadMedia(files);
            setMediaFiles((prev) => [...prev, ...files]);
            setMediaData((prev) => [...prev, ...uploadedMedia]);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveMedia = (index) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
        setMediaData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const startDate = new Date(room.startDate);
            const endDate = new Date(room.endDate);

            if (endDate < startDate) {
                setError("End Date must be on or after Start Date.");
                return;
            }

            const formattedRoom = {
                ...room,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            };

            const newRoom = await addRoom(formattedRoom);

            if (!newRoom?.roomID || newRoom.roomID <= 0) {
                throw new Error('Failed to create room: Invalid RoomID');
            }

            for (const media of mediaData) {
                await addMedia({
                    roomID: newRoom.roomID,
                    media_Link: media.url,
                    description: `Media for room ${newRoom.roomNumber}`,
                    mediaType: media.type,
                });
            }

            alert('Room added successfully!');
            setRoom({ roomNumber: '', roomTypeID: roomTypes[0]?.roomTypeID || '', description: '', startDate: '', endDate: '', status: 'Available' });
            setMediaFiles([]);
            setMediaData([]);
            navigate('/rooms');
        } catch (err) {
            console.error('Error adding room or media:', err);
            setError(err.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Add New Room</h1>

            {error && (
                <div style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
                {/* Room Number */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Room Number:</label>
                    <input
                        type="text"
                        name="roomNumber"
                        value={room.roomNumber}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                {/* Room Type */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Room Type:</label>
                    <select
                        name="roomTypeID"
                        value={room.roomTypeID}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        {roomTypes.map((type) => (
                            <option key={type.roomTypeID} value={type.roomTypeID}>
                                {type.roomTypeName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Description:</label>
                    <input
                        type="text"
                        name="description"
                        value={room.description}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                {/* Start Date */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Start Date:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={room.startDate}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                {/* End Date */}
                <div style={{ marginBottom: '15px' }}>
                    <label>End Date:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={room.endDate}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>

                {/* Status */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Status:</label>
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

                {/* Media Upload */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Add Media (Images/Videos):</label>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    {mediaFiles.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                            <h4>Uploaded Media:</h4>
                            <ul>
                                {mediaFiles.map((file, index) => {
                                    const media = mediaData[index];
                                    return (
                                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            {media?.type === 'Image' ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Preview"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <video
                                                    src={URL.createObjectURL(file)}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                    controls
                                                />
                                            )}
                                            <span>{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedia(index)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Add Room
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/rooms')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddRoom;
