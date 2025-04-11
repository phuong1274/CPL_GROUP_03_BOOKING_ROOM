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
    Toast,
    ToastContainer,
} from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';
import {
    getAllBookings,
    getBookingById,
    checkInBooking,
    checkOutBooking,
} from '../../../services/bookingService'; // Đường dẫn tới file service
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './BookingList.module.css';

function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [roomNumber, setRoomNumber] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null); // 'checkin' hoặc 'checkout'
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const pageSize = 20;
    const navigate = useNavigate();

    const fetchBookings = useCallback(
        async (reset = false) => {
            if (isLoading || !hasMore) return;
            setIsLoading(true);
            try {
                const params = {
                    roomNumber: roomNumber || undefined,
                    status: status || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    page,
                    limit: pageSize,
                };
                const data = await getAllBookings(params);
                const newData = Array.isArray(data) ? data : [];
                if (reset) {
                    setBookings(newData);
                } else {
                    setBookings((prevBookings) => [
                        ...new Set([...prevBookings, ...newData].map((b) => JSON.stringify(b)))]
                        .map((b) => JSON.parse(b))
                    );
                }
                if (newData.length < pageSize) setHasMore(false);
            } catch (err) {
                setError(err.message);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        },
        [roomNumber, status, startDate, endDate, page, isLoading, hasMore]
    );

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setBookings([]);
        fetchBookings(true);
    }, [roomNumber, status, startDate, endDate]);

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
        if (page > 1) fetchBookings();
    }, [page, fetchBookings]);

    const handleResetFilters = () => {
        setRoomNumber('');
        setStatus('');
        setStartDate('');
        setEndDate('');
    };

    const handleAction = async () => {
        try {
            if (modalAction === 'checkin') {
                await checkInBooking(selectedBookingId);
                setToastMessage('Booking checked in successfully!');
            } else if (modalAction === 'checkout') {
                await checkOutBooking(selectedBookingId);
                setToastMessage('Booking checked out successfully!');
            }
            setShowToast(true);
            setBookings([]);
            setPage(1);
            setHasMore(true);
            fetchBookings(true); // Làm mới danh sách
        } catch (err) {
            setError(err.message);
        } finally {
            setShowModal(false);
        }
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'Pending':
                return <Badge bg="warning">Pending</Badge>;
            case 'CheckedIn':
                return <Badge bg="success">Checked In</Badge>;
            case 'CheckedOut':
                return <Badge bg="secondary">Checked Out</Badge>;
            default:
                return <Badge bg="info">{status}</Badge>;
        }
    };

    return (
        <Container fluid className={styles.bookingListContainer}>
            <Card className={styles.card}>
                <Card.Body>
                    <Row className="mb-4 align-items-center">
                        <Col>
                            <h2 className={styles.title}>
                                Booking Management
                                <small className={styles.subtitle}>
                                    {bookings.length > 0 ? ` (Showing ${bookings.length} bookings)` : ''}
                                </small>
                            </h2>
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
                                    <option value="Pending">Pending</option>
                                    <option value="CheckedIn">Checked In</option>
                                    <option value="CheckedOut">Checked Out</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="startDate">
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="endDate">
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-3 text-md-end">
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
                                    <th>Booking ID</th>
                                    <th>Room Number</th>
                                    <th>Customer Name</th>
                                    <th>Check-in Date</th>
                                    <th>Check-out Date</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted">
                                            No bookings to display.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr key={booking.bookingId} className={styles.tableRow}>
                                            <td>{booking.bookingId}</td>
                                            <td>{booking.roomNumber}</td>
                                            <td>{booking.customerName || 'N/A'}</td>
                                            <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                            <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                            <td>{renderStatusBadge(booking.status)}</td>
                                            <td className="text-center">
                                                {booking.status === 'Pending' && (
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Check in this booking</Tooltip>}
                                                    >
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => {
                                                                setSelectedBookingId(booking.bookingId);
                                                                setModalAction('checkin');
                                                                setShowModal(true);
                                                            }}
                                                            aria-label={`Check in booking ${booking.bookingId}`}
                                                        >
                                                            <FaSignInAlt />
                                                        </Button>
                                                    </OverlayTrigger>
                                                )}
                                                {booking.status === 'CheckedIn' && (
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Check out this booking</Tooltip>}
                                                    >
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => {
                                                                setSelectedBookingId(booking.bookingId);
                                                                setModalAction('checkout');
                                                                setShowModal(true);
                                                            }}
                                                            aria-label={`Check out booking ${booking.bookingId}`}
                                                        >
                                                            <FaSignOutAlt />
                                                        </Button>
                                                    </OverlayTrigger>
                                                )}
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>View booking details</Tooltip>}
                                                >
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => navigate(`/booking/${booking.bookingId}`)}
                                                        aria-label={`View details of booking ${booking.bookingId}`}
                                                    >
                                                        <FaInfoCircle />
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
                        {!hasMore && bookings.length > 0 && !isLoading && (
                            <p className="text-muted">No more bookings to load.</p>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Confirm {modalAction === 'checkin' ? 'Check-in' : 'Check-out'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {modalAction === 'checkin' ? 'check in' : 'check out'} this
                    booking?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant={modalAction === 'checkin' ? 'success' : 'danger'}
                        onClick={handleAction}
                    >
                        {modalAction === 'checkin' ? 'Check In' : 'Check Out'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-end" className="p-3">
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">Success</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}

export default BookingList;