import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRoom, getRoomTypes, addMedia, uploadMedia } from '../../../services/roomService';
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

    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaData, setMediaData] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
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

        setIsUploading(true);
        try {
            const uploadedMedia = await uploadMedia(files);
            setMediaFiles((prev) => [...prev, ...files]);
            setMediaData((prev) => [...prev, ...uploadedMedia]);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
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

            for (const media of mediaData) {
                await addMedia({
                    roomID: newRoom.roomID,
                    media_Link: media.url,
                    description: `Media for room ${newRoom.roomNumber}`,
                    mediaType: media.type,
                });
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
            setMediaFiles([]);
            setMediaData([]);
            navigate('/rooms');
        } catch (err) {
            console.error('Error adding room or media:', err);
            setError(err.message);
        }
    };

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
                        disabled={isUploading}
                    />
                    {isUploading && (
                        <div className={styles.uploadingContainer}>
                            <span>Loading...</span>
                        </div>
                    )}
                </div>

                {mediaFiles.length > 0 && (
                    <div className={`${styles.mediaSection} ${styles.fullWidth}`}>
                        <h4 className={styles.subtitle}>Media Preview:</h4>
                        <div className={styles.mediaGrid}>
                            {mediaFiles.map((file, index) => {
                                const media = mediaData[index];
                                return (
                                    <div key={index} className={styles.mediaItem}>
                                        {media?.type === 'Image' ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className={styles.mediaImage}
                                            />
                                        ) : (
                                            <video
                                                src={URL.createObjectURL(file)}
                                                className={styles.mediaVideo}
                                                controls
                                            />
                                        )}
                                        <button
                                            onClick={() => handleRemoveMedia(index)}
                                            className={styles.deleteButton}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isUploading}
                    >
                        Add Room
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/rooms')}
                        className={styles.backButton}
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddRoom;