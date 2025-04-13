import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Table,
    Spinner,
    Alert,
    Card,
    Badge,
    Modal,
    OverlayTrigger,
    Tooltip,
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getRooms, deleteRoom, getRoomTypes, deleteMediaByRoomId } from '../../../services/roomService';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './RoomList.module.css';

function RoomList() {
    const [allRooms, setAllRooms] = useState([]);
    const [displayedRooms, setDisplayedRooms] = useState([]);
    const [error, setError] = useState(null);
    const [roomNumber, setRoomNumber] = useState('');
    const [status, setStatus] = useState('');
    const [roomTypeId, setRoomTypeId] = useState('');
    const [roomTypes, setRoomTypes] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const pageSize = 20;
    const navigate = useNavigate();

    // Thêm timeout cho thông báo lỗi
    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => {
                setError(null); // Tự động ẩn sau 4 giây
            }, 4000); // 4 giây (có thể điều chỉnh từ 3000 đến 5000)

            // Cleanup để tránh memory leak
            return () => clearTimeout(timeout);
        }
    }, [error]);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const roomTypesData = await getRoomTypes();
                setRoomTypes(roomTypesData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRoomTypes();
    }, []);

    const fetchRooms = useCallback(
        async (reset = false) => {
            setIsLoading(true);
            try {
                const params = { roomNumber, status, roomTypeId };
                const data = await getRooms(params);
                const newData = Array.isArray(data) ? data : [];
                setAllRooms(newData);

                if (reset) {
                    setDisplayedRooms(newData.slice(0, pageSize));
                    setPage(1);
                    setHasMore(newData.length > pageSize);
                }
            } catch (err) {
                setError(err.message);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        },
        [roomNumber, status, roomTypeId]
    );

    useEffect(() => {
        fetchRooms(true);
    }, [roomNumber, status, roomTypeId, fetchRooms]);

    const handleScroll = useCallback(() => {
        const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        if (scrollPosition + 300 >= scrollHeight && !isLoading && hasMore) {
            setPage((prev) => prev + 1);
        }
    }, [isLoading, hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (page > 1) {
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;
            const newDisplayedRooms = allRooms.slice(0, endIndex);
            setDisplayedRooms(newDisplayedRooms);
            setHasMore(endIndex < allRooms.length);
        }
    }, [page, allRooms]);

    const handleDelete = async () => {
        try {
            await deleteMediaByRoomId(roomToDelete);
            await deleteRoom(roomToDelete);
            setAllRooms((prev) => prev.filter((room) => room.roomID !== roomToDelete));
            setDisplayedRooms((prev) => prev.filter((room) => room.roomID !== roomToDelete));
            setShowDeleteModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleResetFilters = () => {
        setRoomNumber('');
        setStatus('');
        setRoomTypeId('');
    };

    return (
        <Container fluid className={styles.roomListContainer}>
            <Card className={styles.card}>
                <Card.Body>
                    <Row className="mb-4 align-items-center">
                        <Col>
                            <h2 className={styles.title}>
                                Room Management
                                <small className={styles.subtitle}>
                                    {displayedRooms.length > 0 ? ` (Showing ${displayedRooms.length} rooms)` : ''}
                                </small>
                            </h2>
                        </Col>
                        <Col className="text-end">
                            <Button
                                variant="success"
                                onClick={() => navigate('/add-room')}
                                className={styles.actionButton}
                                aria-label="Add new room"
                            >
                                <FaPlus className="me-1" /> Add New Room
                            </Button>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}

                    <Row className="mb-4 align-items-end">
                        <Col md={3} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="roomNumber">
                                <Form.Label>Room Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search room number..."
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="status">
                                <Form.Label>Status</Form.Label>
                                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="">All</option>
                                    <option value="Available">Available</option>
                                    <option value="Booked">Booked</option>
                                    <option value="Maintenance">Maintenance</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="roomType">
                                <Form.Label>Room Type</Form.Label>
                                <Form.Select value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
                                    <option value="">All</option>
                                    {roomTypes.map((type) => (
                                        <option key={type.roomTypeID} value={type.roomTypeID}>
                                            {type.roomTypeName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3} sm={6} xs={12} className="mb-3 text-md-end">
                            <Button
                                variant="outline-secondary"
                                onClick={handleResetFilters}
                                className={styles.actionButton}
                            >
                                Reset Filters
                            </Button>
                        </Col>
                    </Row>

                    <div className="table-responsive">
                        <Table hover className={styles.table}>
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Room Type</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedRooms.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">
                                            No rooms to display.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedRooms.map((room) => (
                                        <tr key={room.roomID} className={styles.tableRow}>
                                            <td>{room.roomNumber}</td>
                                            <td>{room.roomTypeName}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        room.status === 'Available'
                                                            ? 'success'
                                                            : room.status === 'Booked'
                                                                ? 'warning'
                                                                : 'danger'
                                                    }
                                                >
                                                    {room.status}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>Edit room</Tooltip>}
                                                >
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => navigate(`/edit-room/${room.roomID}`)}
                                                        aria-label={`Edit room ${room.roomNumber}`}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>Delete room</Tooltip>}
                                                >
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => {
                                                            setRoomToDelete(room.roomID);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        aria-label={`Delete room ${room.roomNumber}`}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <div className="text-center mt-3">
                        {isLoading && <Spinner animation="border" variant="primary" />}
                        {!hasMore && displayedRooms.length > 0 && !isLoading && (
                            <p className="text-muted">No more rooms to load.</p>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this room?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default RoomList;