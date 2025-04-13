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
    Pagination,
} from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import {
    getAllBookings,
    checkInBooking,
    checkOutBooking,
} from '../../../services/bookingService';
import { getUserById } from '../../../services/authService';
import { getRoomById } from '../../../services/roomService';
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

    const renderPagination = () => {
        const items = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === page}
                    onClick={() => setPage(i)}
                    disabled={isLoading}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return (
            <Pagination className={styles.pagination}>
                <Pagination.Prev
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                />
                {items}
                <Pagination.Next
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isLoading}
                />
            </Pagination>
        );
    };

    return (
        <Container fluid className={styles.bookingListContainer}>
            <Card className={styles.card}>
                <Card.Body>
                    <Row className="mb-4 align-items-center">
                        <Col>
                            <h2 className={styles.title}>
                                Booking Management
                                {bookings.length > 0 && (
                                    <small className={styles.subtitle}>
                                        Showing {bookings.length} of {totalPages * pageSize} bookings
                                    </small>
                                )}
                            </h2>
                        </Col>
                    </Row>

                    {error && (
                        <Alert
                            variant="danger"
                            onClose={() => setError(null)}
                            dismissible
                            className={styles.alert}
                        >
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
                                className={styles.toast}
                            >
                                <Toast.Header>
                                    <strong className="me-auto">Success</strong>
                                </Toast.Header>
                                <Toast.Body>{successMessage}</Toast.Body>
                            </Toast>
                        </ToastContainer>
                    )}
                    {noResults && !error && (
                        <Alert variant="warning" className={styles.alert}>
                            No bookings found matching your filter criteria.
                        </Alert>
                    )}

                    <Form className={styles.filterForm}>
                        <Row className="g-3 align-items-end">
                            <Col xs={12} sm={6} md={3} lg={2}>
                                <Form.Group controlId="roomNumber">
                                    <Form.Label>Room Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="roomNumber"
                                        value={filters.roomNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter room number"
                                        className={styles.formControl}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} md={3} lg={2}>
                                <Form.Group controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={filters.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter username"
                                        className={styles.formControl}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} md={3} lg={2}>
                                <Form.Group controlId="checkInDate">
                                    <Form.Label>Check-in Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkInDate"
                                        value={filters.checkInDate}
                                        onChange={handleInputChange}
                                        className={styles.formControl}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} md={3} lg={2}>
                                <Form.Group controlId="checkOutDate">
                                    <Form.Label>Check-out Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkOutDate"
                                        value={filters.checkOutDate}
                                        onChange={handleInputChange}
                                        className={styles.formControl}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} md={3} lg={2}>
                                <Form.Group controlId="status">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleInputChange}
                                        className={styles.formControl}
                                    >
                                        <option value="">All</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} md={3} lg={2} className="text-end">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleResetFilters}
                                    className={styles.actionButton}
                                >
                                    Reset Filters
                                </Button>
                            </Col>
                        </Row>
                    </Form>

                    <div className="table-responsive">
                        <Table hover className={styles.table}>
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <th>ID</th>
                                    <th>Room</th>
                                    <th>User</th>
                                    <th>Created</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Updated</th>
                                    <th>Total(USD)</th>
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
                                                        className={styles.actionButton}
                                                    >
                                                        <FaSignInAlt className="me-1" />
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
                                                        className={styles.actionButton}
                                                    >
                                                        <FaSignOutAlt className="me-1" />
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

                    <div className="d-flex justify-content-center align-items-center mt-4">
                        {isLoading && <Spinner animation="border" variant="primary" className="me-3" />}
                        {renderPagination()}
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className={styles.modalHeader}>
                    <Modal.Title>
                        {modalAction === 'checkin' ? (
                            <>
                                <FaSignInAlt className="me-2" /> Confirm Check-in
                            </>
                        ) : (
                            <>
                                <FaSignOutAlt className="me-2" /> Confirm Check-out
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {modalAction === 'checkin' ? 'check in' : 'check out'} this
                    booking?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
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