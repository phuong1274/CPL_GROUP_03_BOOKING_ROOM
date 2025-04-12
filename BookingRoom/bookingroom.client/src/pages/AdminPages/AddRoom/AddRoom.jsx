import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Alert,
    ListGroup,
    Image,
    Spinner,
} from 'react-bootstrap';
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

    // Fetch room types
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

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoom((prev) => ({ ...prev, [name]: value }));
    };

    // Handle media file uploads
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

    // Remove media
    const handleRemoveMedia = (index) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
        setMediaData((prev) => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
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
            <h2 className={styles.title}>Add New Room</h2>

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

            <Form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    {/* Room Number */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Room Number</label>
                        <input
                            type="text"
                            name="roomNumber"
                            value={room.roomNumber}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Enter room number"
                            required
                        />
                    </div>

                    {/* Room Type */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Room Type</label>
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

                    {/* Description */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={room.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Enter room description"
                            required
                        />
                    </div>

                    {/* Start Date */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={room.startDate}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    {/* End Date */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={room.endDate}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    {/* Status */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Status</label>
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

                    {/* Media Upload - Giữ nguyên từ code gốc */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <Form.Group controlId="media">
                            <Form.Label>Add Media (Images/Videos)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                            {isUploading && (
                                <div className="mt-2">
                                    <Spinner animation="border" size="sm" /> Uploading...
                                </div>
                            )}
                        </Form.Group>

                        {mediaFiles.length > 0 && (
                            <div className="mt-3">
                                <h5>Uploaded Media</h5>
                                <ListGroup>
                                    {mediaFiles.map((file, index) => {
                                        const media = mediaData[index];
                                        return (
                                            <ListGroup.Item
                                                key={index}
                                                className="d-flex align-items-center justify-content-between"
                                            >
                                                <div className="d-flex align-items-center">
                                                    {media?.type === 'Image' ? (
                                                        <Image
                                                            src={URL.createObjectURL(file)}
                                                            alt="Preview"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                marginRight: '10px',
                                                            }}
                                                        />
                                                    ) : (
                                                        <video
                                                            src={URL.createObjectURL(file)}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                marginRight: '10px',
                                                            }}
                                                            controls
                                                        />
                                                    )}
                                                    <span>{file.name}</span>
                                                </div>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveMedia(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className={styles.buttonGroup}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isUploading}
                    >
                        Add Room
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/rooms')}
                        className={styles.cancelButton}
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                </div>
            </Form>
        </div>
    );
}

export default AddRoom;