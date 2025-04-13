import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getRoomById,
    updateRoom,
    getRoomTypes,
    addMedia,
    deleteMedia,
    deleteMediaByRoomId,
} from '../../../services/roomService';
import styles from './RoomDetail.module.css';

function RoomDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [newMediaLink, setNewMediaLink] = useState('');
    const [newMediaType, setNewMediaType] = useState('Image');
    const [roomTypes, setRoomTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomData, roomTypesData] = await Promise.all([
                    getRoomById(id),
                    getRoomTypes(),
                ]);
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
                    roomData.media?.map((m) => ({
                        mediaId: m.MediaID,
                        mediaLink: `https://localhost:7067${m.media_Link}`,
                        mediaType: m.mediaType || 'Image',
                    })) || []
                );
                setRoomTypes(roomTypesData);
            } catch (err) {
                setErrors({
                    general: err.response?.data?.message || err.message || 'Failed to fetch room data',
                });
            }
        };
        fetchData();
    }, [id]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!room?.roomNumber?.trim()) newErrors.roomNumber = 'Room number is required';
        else if (!/^\d+$/.test(room.roomNumber.trim()))
            newErrors.roomNumber = 'Room number must be digits only';

        if (!room?.roomTypeId) newErrors.roomTypeId = 'Room type is required';
        if (!room?.startDate) newErrors.startDate = 'Start date is required';
        if (!room?.endDate) newErrors.endDate = 'End date is required';
        else if (room.startDate && new Date(room.endDate) <= new Date(room.startDate))
            newErrors.endDate = 'End date must be after start date';

        if (!room?.status) newErrors.status = 'Status is required';

        setErrors(newErrors);
        return !Object.keys(newErrors).length;
    }, [room]);

    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setRoom((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => ({ ...prev, [name]: '' }));

            if (name === 'roomNumber') {
                if (!value.trim()) setErrors((prev) => ({ ...prev, roomNumber: 'Room number is required' }));
                else if (!/^\d+$/.test(value.trim()))
                    setErrors((prev) => ({ ...prev, roomNumber: 'Room number must be digits only' }));
            }
            if (name === 'roomTypeId' && !value)
                setErrors((prev) => ({ ...prev, roomTypeId: 'Room type is required' }));
            if (name === 'startDate') {
                if (!value) setErrors((prev) => ({ ...prev, startDate: 'Start date is required' }));
                else if (room.endDate && new Date(room.endDate) <= new Date(value))
                    setErrors((prev) => ({ ...prev, endDate: 'End date must be after start date' }));
            }
            if (name === 'endDate') {
                if (!value) setErrors((prev) => ({ ...prev, endDate: 'End date is required' }));
                else if (room.startDate && new Date(value) <= new Date(room.startDate))
                    setErrors((prev) => ({ ...prev, endDate: 'End date must be after start date' }));
            }
            if (name === 'status' && !value)
                setErrors((prev) => ({ ...prev, status: 'Status is required' }));
        },
        [room]
    );

    const handleAddMediaLink = useCallback(() => {
        if (!newMediaLink.trim()) return;
        setMediaItems((prev) => [
            ...prev,
            {
                mediaId: `temp-${Date.now()}`,
                mediaLink: newMediaLink.trim(),
                mediaType: newMediaType,
            },
        ]);
        setNewMediaLink('');
    }, [newMediaLink, newMediaType]);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        const fileType = file.type.split('/')[0];
        const mediaType =
            fileType === 'image' ? 'Image' :
                fileType === 'video' ? 'Video' :
                    fileType === 'audio' ? 'Audio' : 'File';

        setMediaItems((prev) => [
            ...prev,
            { mediaId: `temp-${Date.now()}`, mediaLink: objectUrl, file, mediaType },
        ]);
    }, []);

    const handleDeleteMedia = useCallback(
        async (index) => {
            const mediaItem = mediaItems[index];
            if (mediaItem.mediaId && !mediaItem.mediaId.toString().startsWith('temp-')) {
                try {
                    await deleteMedia(mediaItem.mediaId);
                } catch (err) {
                    setErrors({
                        general: err.response?.data?.message || err.message || 'Failed to delete media',
                    });
                    return;
                }
            }
            setMediaItems((prev) => prev.filter((_, i) => i !== index));
        },
        [mediaItems]
    );

    const handleSave = useCallback(async () => {
        if (!validateForm()) return;
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

            const updateResponse = await updateRoom(id, roomDTO);
            await deleteMediaByRoomId(id);
            for (const item of mediaItems) {
                const mediaData = item.file
                    ? { roomId: parseInt(id), file: item.file, description: '', mediaType: item.mediaType }
                    : {
                        roomId: parseInt(id),
                        mediaLink: item.mediaLink.replace('https://localhost:7067', ''),
                        description: '',
                        mediaType: item.mediaType,
                    };
                await addMedia(mediaData);
            }

            setErrors({});
            setSuccessMessage(updateResponse.message || 'Room updated successfully');
            setTimeout(() => {
                setSuccessMessage('');
                navigate('/rooms');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save changes';
            setErrors((prev) => ({
                ...prev,
                ...(errorMessage.toLowerCase().includes('room number already exists')
                    ? { roomNumber: 'Room number already exists' }
                    : { general: errorMessage }),
            }));
        }
    }, [id, room, mediaItems, navigate, validateForm]);

    const renderMediaPreview = useCallback(
        (item) => {
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
                case 'Audio':
                    return (
                        <audio controls className={styles.mediaAudio}>
                            <source src={item.mediaLink} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    );
                default:
                    return <div className={styles.mediaFile}>{item.mediaType} File</div>;
            }
        },
        []
    );

    const mediaTypes = useMemo(() => ['Image', 'Video', 'Audio', 'File'], []);

    if (!room) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Room Details</h1>

            {errors.general && (
                <div className={styles.error}>
                    <span>{errors.general}</span>
                    <button
                        onClick={() => setErrors((prev) => ({ ...prev, general: '' }))}
                        className={styles.closeButton}
                    >
                        ✕
                    </button>
                </div>
            )}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Room Number</label>
                    <input
                        type="text"
                        name="roomNumber"
                        value={room.roomNumber}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.roomNumber ? styles.inputError : ''}`}
                        required
                    />
                    {errors.roomNumber && <p className={styles.errorText}>{errors.roomNumber}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Room Type</label>
                    <select
                        name="roomTypeId"
                        value={room.roomTypeId}
                        onChange={handleChange}
                        className={`${styles.select} ${errors.roomTypeId ? styles.inputError : ''}`}
                    >
                        <option value="">Select Room Type</option>
                        {roomTypes.map((type) => (
                            <option key={type.roomTypeID} value={type.roomTypeID}>
                                {type.roomTypeName}
                            </option>
                        ))}
                    </select>
                    {errors.roomTypeId && <p className={styles.errorText}>{errors.roomTypeId}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Status</label>
                    <select
                        name="status"
                        value={room.status}
                        onChange={handleChange}
                        className={`${styles.select} ${errors.status ? styles.inputError : ''}`}
                    >
                        <option value="">Select Status</option>
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                    {errors.status && <p className={styles.errorText}>{errors.status}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={room.startDate}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
                        required
                    />
                    {errors.startDate && <p className={styles.errorText}>{errors.startDate}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={room.endDate}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.endDate ? styles.inputError : ''}`}
                        required
                    />
                    {errors.endDate && <p className={styles.errorText}>{errors.endDate}</p>}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        name="description"
                        value={room.description}
                        onChange={handleChange}
                        className={styles.textarea}
                    />
                </div>

                <div className={`${styles.mediaSection} ${styles.fullWidth}`}>
                    <h2 className={styles.subtitle}>Media</h2>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Upload File</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className={styles.input}
                        />
                    </div>

                    {mediaItems.length > 0 && (
                        <div>
                            <h4 className={styles.subtitle}>Media Preview</h4>
                            <div className={styles.mediaGrid}>
                                {mediaItems.map((item, index) => (
                                    <div key={item.mediaId} className={styles.mediaItem}>
                                        {renderMediaPreview(item)}
                                        <button
                                            onClick={() => handleDeleteMedia(index)}
                                            className={styles.deleteButton}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button onClick={handleSave} className={styles.saveButton}>
                    Save
                </button>
                <button
                    onClick={() => navigate('/rooms')}
                    className={styles.backButton}
                >
                    Back to Room List
                </button>
            </div>
        </div>
    );
}

export default RoomDetail;