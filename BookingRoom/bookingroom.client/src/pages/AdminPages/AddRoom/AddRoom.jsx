import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRoom, getRoomTypes, addMedia } from '../../../services/roomService';
import styles from './AddRoom.module.css';

function AddRoom() {
    const [room, setRoom] = useState({
        roomNumber: '',
        roomTypeID: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Available',
    });
    const [mediaItems, setMediaItems] = useState([]);
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

    const handleFileChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const newMedia = files
            .filter((file) => allowedTypes.includes(file.type) && file.size <= maxSize)
            .map((file) => ({
                mediaId: `temp-${Date.now()}-${Math.random()}`,
                mediaLink: URL.createObjectURL(file),
                file,
                mediaType: file.type.startsWith('image') ? 'Image' : 'Video',
            }));

        if (newMedia.length < files.length) {
            setError('Some files were invalid (unsupported type or too large).');
        }

        setMediaItems((prev) => [...prev, ...newMedia]);
    }, []);

    const handleRemoveMedia = useCallback((index) => {
        const mediaItem = mediaItems[index];
        if (mediaItem.mediaLink.startsWith('blob:')) {
            URL.revokeObjectURL(mediaItem.mediaLink);
        }
        setMediaItems((prev) => prev.filter((_, i) => i !== index));
    }, [mediaItems]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const startDate = new Date(room.startDate);
            const endDate = new Date(room.endDate);

            if (endDate < startDate) {
                setError('End Date must be on or after Start Date.');
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

            for (const media of mediaItems) {
                if (media.file) {
                    await addMedia({
                        roomId: newRoom.roomID,
                        file: media.file,
                        description: `Media for room ${newRoom.roomNumber}`,
                        mediaType: media.mediaType,
                    });
                }
            }

            alert('Room added successfully!');
            setRoom({
                roomNumber: '',
                roomTypeID: roomTypes[0]?.roomTypeID || '',
                description: '',
                startDate: '',
                endDate: '',
                status: 'Available',
            });
            setMediaItems([]);
            navigate('/rooms');
        } catch (err) {
            console.error('Error adding room or media:', err);
            setError(err.message);
        }
    };

    const renderMediaPreview = useCallback((item) => {
        switch (item.mediaType) {
            case 'Image':
                return (
                    <img
                        src={item.mediaLink}
                        alt="Preview"
                        className={styles.mediaImage}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/200')}
                    />
                );
            case 'Video':
                return (
                    <video controls className={styles.mediaVideo}>
                        <source src={item.mediaLink} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            default:
                return <div className={styles.mediaFile}>{item.mediaType} File</div>;
        }
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Add New Room</h1>
            {error && (
                <div className={styles.error}>
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className={styles.closeButton}
                    >
                        ✕
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Room Number:</label>
                    <input
                        type="text"
                        name="roomNumber"
                        value={room.roomNumber}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Room Type:</label>
                    <select
                        name="roomTypeID"
                        value={room.roomTypeID}
                        onChange={handleChange}
                        className={styles.select}
                    >
                        {roomTypes.map((type) => (
                            <option key={type.roomTypeID} value={type.roomTypeID}>
                                {type.roomTypeName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Status:</label>
                    <select
                        name="status"
                        value={room.status}
                        onChange={handleChange}
                        className={styles.select}
                    >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Start Date:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={room.startDate}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>End Date:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={room.endDate}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Description:</label>
                    <textarea
                        name="description"
                        value={room.description}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={4}
                        required
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Add Media (Images/Videos):</label>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className={styles.input}
                    />
                </div>

                {mediaItems.length > 0 && (
                    <div className={`${styles.mediaSection} ${styles.fullWidth}`}>
                        <h4 className={styles.subtitle}>Media Preview:</h4>
                        <div className={styles.mediaGrid}>
                            {mediaItems.map((item, index) => (
                                <div key={item.mediaId} className={styles.mediaItem}>
                                    {renderMediaPreview(item)}
                                    <button
                                        onClick={() => handleRemoveMedia(index)}
                                        className={styles.deleteButton}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.saveButton}>
                        Add Room
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/rooms')}
                        className={styles.backButton}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddRoom;