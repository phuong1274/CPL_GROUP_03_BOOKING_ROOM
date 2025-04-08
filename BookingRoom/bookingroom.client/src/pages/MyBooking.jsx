import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomById, getUserById, getMyBookings, cancelBooking } from '../services/customerService';

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
    const [cancellingId, setCancellingId] = useState(null); // Track which booking is being cancelled
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
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">My Bookings</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {noResults && !error && (
                <p className="text-yellow-600 mb-4">
                    You have no bookings.
                </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <label htmlFor="checkInDate">Check-in Date:</label>
                <input type="date" id="checkInDate" name="checkInDate" value={filters.checkInDate} onChange={handleInputChange} className="border px-2 py-1" />

                <label htmlFor="checkOutDate">Check-out Date:</label>
                <input type="date" id="checkOutDate" name="checkOutDate" value={filters.checkOutDate} onChange={handleInputChange} className="border px-2 py-1" />

                <label htmlFor="status">Status:</label>
                <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleInputChange}
                    className="border px-2 py-1"
                >
                    <option value="">All</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <table className="table-auto w-full border">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Booking ID</th>
                        <th className="border px-4 py-2">Room Number</th>
                        <th className="border px-4 py-2">Created At</th>
                        <th className="border px-4 py-2">Check-in</th>
                        <th className="border px-4 py-2">Check-out</th>
                        <th className="border px-4 py-2">Updated At</th>
                        <th className="border px-4 py-2">Total</th>
                        <th className="border px-4 py-2">Status</th>
                        <th className="border px-4 py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.bookingID}>
                            <td className="border px-4 py-2">{b.bookingID}</td>
                            <td className="border px-4 py-2">{b.roomNumber}</td>
                            <td className="border px-4 py-2">{formatDate(b.createdAt)}</td>
                            <td className="border px-4 py-2">{formatDate(b.checkInDate)}</td>
                            <td className="border px-4 py-2">{formatDate(b.checkOutDate)}</td>
                            <td className="border px-4 py-2">{formatDate(b.updatedAt)}</td>
                            <td className="border px-4 py-2">{b.totalAmount}</td>
                            <td className="border px-4 py-2">{b.bookingStatus}</td>
                            <td className="border px-4 py-2">
                                {b.bookingStatus === 'Pending' && (
                                    <button
                                        onClick={() => handleCancel(b.bookingID)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
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

            <div className="flex items-center gap-2 mt-4">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}