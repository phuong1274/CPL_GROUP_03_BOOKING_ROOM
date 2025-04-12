import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomById, getUserById, getMyBookings, cancelBooking } from '../../../services/customerService';
import styles from './MyBooking.module.css';

export default function MyBooking() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [noResults, setNoResults] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        checkInDate: '',
        checkOutDate: '',
        status: ''
    });
    const [cancellingId, setCancellingId] = useState(null);
    const pageSize = 30;
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyBookings();
    }, [page, filters]);

    const fetchMyBookings = async () => {
        try {
            setNoResults(false);
            const params = {
                page,
                pageSize,
                ...filters,
            };

            const response = await getMyBookings(params);
            console.log('Response from getMyBookings:', response);

            const bookingsData = Array.isArray(response) ? response : response.bookings || [];
            console.log('Bookings Data:', bookingsData);

            const totalCount = Array.isArray(response) ? bookingsData.length : response.totalRecords || 0;
            console.log('Total Count:', totalCount);

            const enriched = await Promise.all(
                bookingsData.map(async (b) => {
                    const [room, user] = await Promise.all([getRoomById(b.roomID), getUserById(b.userID)]);
                    return {
                        ...b,
                        roomNumber: room?.roomNumber || 'N/A',
                        username: user?.username || 'N/A',
                    };
                })
            );

            console.log('Enriched Bookings:', enriched);
            setBookings(enriched);
            setTotalPages(Math.ceil(totalCount / pageSize));
            setNoResults(enriched.length === 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            if (err.message.includes('401')) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError(err.message || 'Failed to fetch your bookings');
                setBookings([]);
                setNoResults(false);
            }
        }
    };

    const handleCancel = async (bookingId) => {
        const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
        if (!confirmCancel) return;

        try {
            setCancellingId(bookingId); // Set loading state
            await cancelBooking(bookingId);
            await fetchMyBookings();
            setError(null);
        } catch (err) {
            console.error('Error cancelling booking:', err);
            setError(err.message || 'Failed to cancel the booking');
        } finally {
            setCancellingId(null); // Clear loading state
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <h2 className={styles.title}>My Bookings</h2>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {noResults && !error && (
                    <p className={styles.noResultsMessage}>
                        You have no bookings.
                    </p>
                )}
                <br></br>
                <div className={styles.filterGrid}>
                    <label htmlFor="checkInDate">Check-in Date:</label>
                    <input type="date" id="checkInDate" name="checkInDate" value={filters.checkInDate} onChange={handleInputChange} className={styles.inputField} />

                    <label htmlFor="checkOutDate">Check-out Date:</label>
                    <input type="date" id="checkOutDate" name="checkOutDate" value={filters.checkOutDate} onChange={handleInputChange} className={styles.inputField} />

                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleInputChange}
                        className={styles.inputField}
                    >
                        <option value="">All</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <br></br>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Room Number</th>
                            <th>Created At</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Updated At</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.bookingID}>
                                <td>{b.bookingID}</td>
                                <td>{b.roomNumber}</td>
                                <td>{formatDate(b.createdAt)}</td>
                                <td>{formatDate(b.checkInDate)}</td>
                                <td>{formatDate(b.checkOutDate)}</td>
                                <td>{formatDate(b.updatedAt)}</td>
                                <td>{b.totalAmount}</td>
                                <td>{b.bookingStatus}</td>
                                <td>
                                    {b.bookingStatus === 'Pending' && (
                                        <button
                                            onClick={() => handleCancel(b.bookingID)}
                                            className={styles.cancelButton}
                                            disabled={cancellingId === b.bookingID}
                                        >
                                            {cancellingId === b.bookingID ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.pagination}>
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={styles.pageButton}
                    >
                        Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={styles.pageButton}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
