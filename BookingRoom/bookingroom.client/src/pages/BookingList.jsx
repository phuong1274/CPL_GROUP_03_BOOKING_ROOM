import React, { useEffect, useState } from 'react';
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
    Toast,
    ToastContainer,
} from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import {
    getAllBookings,
    checkInBooking,
    checkOutBooking,
} from '../services/bookingService';
import { getUserById } from '../services/authService';
import { getRoomById } from '../services/roomService';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './BookingList.module.css';

export default function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [noResults, setNoResults] = useState(false);
    const [filters, setFilters] = useState({
        roomNumber: '',
        username: '',
        checkInDate: '',
        checkOutDate: '',
        status: '',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [checkingInId, setCheckingInId] = useState(null);
    const [checkingOutId, setCheckingOutId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 30;

    useEffect(() => {
        fetchBookings();
    }, [page, filters]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            setNoResults(false);
            const params = {
                page,
                pageSize,
                ...filters,
            };

            const response = await getAllBookings(params);
            const bookingsData = response.bookings || [];
            const totalCount = response.totalRecords || 0;

            const enriched = await Promise.all(
                bookingsData.map(async (b) => {
                    const [room, user] = await Promise.all([
                        getRoomById(b.roomID),
                        getUserById(b.userID),
                    ]);
                    return {
                        ...b,
                        roomNumber: room?.roomNumber || 'N/A',
                        username: user?.username || 'N/A',
                    };
                })
            );

            setBookings(enriched);
            setTotalPages(Math.ceil(totalCount / pageSize));
            setNoResults(enriched.length === 0);
            setError(null);
            setSuccessMessage(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch bookings');
            setBookings([]);
            setNoResults(false);
            setSuccessMessage(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({
            roomNumber: '',
            username: '',
            checkInDate: '',
            checkOutDate: '',
            status: '',
        });
        setPage(1);
    };

    const handleCheckIn = async () => {
        try {
            setCheckingInId(selectedBookingId);
            setError(null);
            setSuccessMessage(null);

            const response = await checkInBooking(selectedBookingId);
            setSuccessMessage(response.message || 'Booking checked in successfully!');
            setShowModal(false);
            await fetchBookings();
        } catch (err) {
            setError(err.message);
        } finally {
            setCheckingInId(null);
        }
    };

    const handleCheckOut = async () => {
        try {
            setCheckingOutId(selectedBookingId);
            setError(null);
            setSuccessMessage(null);

            const response = await checkOutBooking(selectedBookingId);
            setSuccessMessage(response.message || 'Booking checked out successfully!');
            setShowModal(false);
            await fetchBookings();
        } catch (err) {
            setError(err.message);
        } finally {
            setCheckingOutId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'Pending':
                return <Badge bg="warning">Pending</Badge>;
            case 'Confirmed':
                return <Badge bg="success">Confirmed</Badge>;
            case 'Completed':
                return <Badge bg="secondary">Completed</Badge>;
            case 'Cancelled':
                return <Badge bg="danger">Cancelled</Badge>;
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
                                    {bookings.length > 0 ? ` (Showing ${bookings.length} of ${totalPages * pageSize} bookings)` : ''}
                                </small>
                            </h2>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}
                    {successMessage && (
                        <ToastContainer position="top-end" className="p-3">
                            <Toast
                                show={!!successMessage}
                                onClose={() => setSuccessMessage(null)}
                                delay={3000}
                                autohide
                            >
                                <Toast.Header>
                                    <strong className="me-auto">Success</strong>
                                </Toast.Header>
                                <Toast.Body>{successMessage}</Toast.Body>
                            </Toast>
                        </ToastContainer>
                    )}
                    {noResults && !error && (
                        <Alert variant="warning">No bookings found matching your filter criteria.</Alert>
                    )}

                    <Row className="mb-4 align-items-end">
                        <Col md={2} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="roomNumber">
                                <Form.Label>Room Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="roomNumber"
                                    value={filters.roomNumber}
                                    onChange={handleInputChange}
                                    placeholder="Search room number..."
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={filters.username}
                                    onChange={handleInputChange}
                                    placeholder="Search username..."
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="checkInDate">
                                <Form.Label>Check-in Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="checkInDate"
                                    value={filters.checkInDate}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="checkOutDate">
                                <Form.Label>Check-out Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="checkOutDate"
                                    value={filters.checkOutDate}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-3">
                            <Form.Group controlId="status">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="">All</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </Form.Select>
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
                                    <th>Username</th>
                                    <th>Created At</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Updated At</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan="10" className="text-center text-muted">
                                            No bookings to display.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((b) => (
                                        <tr key={b.bookingID} className={styles.tableRow}>
                                            <td>{b.bookingID}</td>
                                            <td>{b.roomNumber}</td>
                                            <td>{b.username}</td>
                                            <td>{formatDate(b.createdAt)}</td>
                                            <td>{formatDate(b.checkInDate)}</td>
                                            <td>{formatDate(b.checkOutDate)}</td>
                                            <td>{formatDate(b.updatedAt)}</td>
                                            <td>{b.totalAmount || 'N/A'}</td>
                                            <td>{renderStatusBadge(b.bookingStatus)}</td>
                                            <td className="text-center">
                                                {b.bookingStatus === 'Pending' && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBookingId(b.bookingID);
                                                            setModalAction('checkin');
                                                            setShowModal(true);
                                                        }}
                                                        disabled={checkingInId === b.bookingID}
                                                        className="me-2"
                                                    >
                                                        <FaSignInAlt />{' '}
                                                        {checkingInId === b.bookingID ? 'Checking In...' : 'Check-in'}
                                                    </Button>
                                                )}
                                                {b.bookingStatus === 'Confirmed' && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBookingId(b.bookingID);
                                                            setModalAction('checkout');
                                                            setShowModal(true);
                                                        }}
                                                        disabled={checkingOutId === b.bookingID}
                                                    >
                                                        <FaSignOutAlt />{' '}
                                                        {checkingOutId === b.bookingID ? 'Checking Out...' : 'Check-out'}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                        {isLoading && <Spinner animation="border" variant="primary" />}
                        <Button
                            variant="outline-primary"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className={styles.actionButton}
                        >
                            Prev
                        </Button>
                        <span>
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline-primary"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isLoading}
                            className={styles.actionButton}
                        >
                            Next
                        </Button>
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
                        onClick={modalAction === 'checkin' ? handleCheckIn : handleCheckOut}
                        disabled={checkingInId || checkingOutId}
                    >
                        {modalAction === 'checkin' ? 'Check In' : 'Check Out'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}