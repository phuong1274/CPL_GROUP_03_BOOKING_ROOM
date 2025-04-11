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
import { addRoom, getRoomTypes, addMedia, uploadMedia } from '../services/roomService';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        <Container fluid className="add-room-container py-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <Row className="mb-4">
                        <Col>
                            <h2 className="mb-0">Add New Room</h2>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
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
                                <Form.Group controlId="roomTypeID">
                                    <Form.Label>Room Type</Form.Label>
                                    <Form.Select
                                        name="roomTypeID"
                                        value={room.roomTypeID}
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

                            {/* Description */}
                            <Col xs={12} className="mb-3">
                                <Form.Group controlId="description">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="description"
                                        value={room.description}
                                        onChange={handleChange}
                                        placeholder="Enter room description"
                                        required
                                    />
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

                            {/* Media Upload */}
                            <Col xs={12} className="mb-4">
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
                            </Col>

                            {/* Buttons */}
                            <Col xs={12} className="text-end">
                                <Button
                                    variant="success"
                                    type="submit"
                                    className="me-2"
                                    disabled={isUploading}
                                >
                                    Add Room
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/rooms')}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AddRoom;