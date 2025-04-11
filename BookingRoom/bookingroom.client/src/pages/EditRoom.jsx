import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Alert,
    Spinner,
    ListGroup,
    Image,
} from 'react-bootstrap';
import {
    getRoomById,
    updateRoom,
    getRoomTypes,
    addMedia,
    deleteMedia,
    deleteMediaByRoomId,
} from '../services/roomService';
import 'bootstrap/dist/css/bootstrap.min.css';

function RoomDetail() {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [newMediaLink, setNewMediaLink] = useState('');
    const [newMediaType, setNewMediaType] = useState('Image');
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch room and room types
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
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoom((prev) => ({ ...prev, [name]: value }));
    };

    // Handle adding media via link (not used in this version but kept for compatibility)
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

    // Handle file uploads
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            const fileType = file.type.split('/')[0];
            const mediaType =
                fileType === 'image'
                    ? 'Image'
                    : fileType === 'video'
                        ? 'Video'
                        : fileType === 'audio'
                            ? 'Audio'
                            : 'File';

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

    // Handle media deletion
    const handleDeleteMedia = async (index) => {
        const mediaItem = mediaItems[index];

        if (
            mediaItem.mediaId &&
            typeof mediaItem.mediaId === 'string' &&
            !mediaItem.mediaId.startsWith('temp-')
        ) {
            try {
                await deleteMedia(mediaItem.mediaId);
            } catch (err) {
                setError(err.message);
                return;
            }
        }

        setMediaItems(mediaItems.filter((_, i) => i !== index));
    };

    // Handle saving changes
    const handleSave = async () => {
        try {
            const startDate = new Date(room.startDate);
            const endDate = new Date(room.endDate);

            if (endDate < startDate) {
                setError('End Date must be on or after Start Date.');
                return;
            }

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

            // Delete all existing media
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
                        mediaLink,
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

    // Render media preview
    const renderMediaPreview = (item) => {
        switch (item.mediaType) {
            case 'Image':
                return (
                    <Image
                        src={item.mediaLink}
                        alt="Preview"
                        style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                        }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                    />
                );
            case 'Video':
                return (
                    <video
                        controls
                        style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                        }}
                    >
                        <source src={item.mediaLink} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'Audio':
                return (
                    <audio
                        controls
                        style={{ width: '150px', marginTop: '50px' }}
                    >
                        <source src={item.mediaLink} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                );
            default:
                return (
                    <div
                        style={{
                            width: '150px',
                            height: '150px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    >
                        <span>{item.mediaType} File</span>
                    </div>
                );
        }
    };

    if (isLoading || !room) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="room-detail-container py-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <Row className="mb-4">
                        <Col>
                            <h2 className="mb-0">Edit Room Details</h2>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}

                    <Form>
                        <Row>
                            {/* Room Number */}
                            <Col md={6} xs={12} className="mb-3">
                                <Form.Group controlId="roomNumber">
                                    <Form.Label>Room Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="roomNumber"
                                        value={room.roomNumber}
                                        onChange={handleChange}
                                        placeholder="Enter room number"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            {/* Room Type */}
                            <Col md={6} xs={12} className="mb-3">
                                <Form.Group controlId="roomTypeId">
                                    <Form.Label>Room Type</Form.Label>
                                    <Form.Select
                                        name="roomTypeId"
                                        value={room.roomTypeId}
                                        onChange={handleChange}
                                    >
                                        {roomTypes.map((type) => (
                                            <option key={type.roomTypeID} value={type.roomTypeID}>
                                                {type.roomTypeName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Status */}
                            <Col md={6} xs={12} className="mb-3">
                                <Form.Group controlId="status">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={room.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Booked">Booked</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Start Date */}
                            <Col md={6} xs={12} className="mb-3">
                                <Form.Group controlId="startDate">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="startDate"
                                        value={room.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            {/* End Date */}
                            <Col md={6} xs={12} className="mb-3">
                                <Form.Group controlId="endDate">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="endDate"
                                        value={room.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            {/* Description */}
                            <Col xs={12} className="mb-3">
                                <Form.Group controlId="description">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        value={room.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Enter room description"
                                        style={{ resize: 'vertical' }}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Media Upload */}
                            <Col xs={12} className="mb-4">
                                <Form.Group controlId="media">
                                    <Form.Label>Upload Media</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*,video/*,audio/*"
                                    />
                                </Form.Group>

                                {mediaItems.length > 0 && (
                                    <div className="mt-3">
                                        <h5>Media Preview</h5>
                                        <ListGroup>
                                            {mediaItems.map((item, index) => (
                                                <ListGroup.Item
                                                    key={item.mediaId}
                                                    className="d-flex align-items-center justify-content-between"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        {renderMediaPreview(item)}
                                                        <span className="ms-3">
                                                            {item.file ? item.file.name : 'Uploaded Media'}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteMedia(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </div>
                                )}
                            </Col>

                            {/* Buttons */}
                            <Col xs={12} className="text-end">
                                <Button
                                    variant="success"
                                    onClick={handleSave}
                                    className="me-2"
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/rooms')}
                                >
                                    Back to Room List
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default RoomDetail;