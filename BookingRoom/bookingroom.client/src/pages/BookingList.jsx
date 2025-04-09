import React, { useEffect, useState } from 'react';
import {
    checkInBooking,
    checkOutBooking,
    getAllBookings
} from '../services/bookingService';
import { getUserById, getRoomById } from '../services/api';

export default function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [noResults, setNoResults] = useState(false);
    const [filters, setFilters] = useState({
        roomNumber: '',
        username: '',
        checkInDate: '',
        checkOutDate: '',
        status: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [checkingInId, setCheckingInId] = useState(null); // Track check-in loading state
    const [checkingOutId, setCheckingOutId] = useState(null); // Track check-out loading state
    const pageSize = 30;

    useEffect(() => {
        fetchBookings();
    }, [page, filters]);

    const fetchBookings = async () => {
        try {
            setNoResults(false);
            const params = {
                page,
                pageSize,
                ...filters,
            };

            const response = await getAllBookings(params);
            console.log('Response from getAllBookings:', response); // Debug log
            const bookingsData = response.bookings || [];
            const totalCount = response.totalRecords || 0;
            console.log('Bookings Data:', bookingsData); // Debug log

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

            console.log('Enriched Bookings:', enriched); // Debug log
            setBookings(enriched);
            setTotalPages(Math.ceil(totalCount / pageSize));
            setNoResults(enriched.length === 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Failed to fetch bookings');
            setBookings([]);
            setNoResults(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleCheckIn = async (id) => {
        console.log('Check-in button clicked for booking ID:', id); // Debug log
        try {
            setCheckingInId(id);
            await checkInBooking(id);
            await fetchBookings();
            setError(null);
        } catch (err) {
            console.error('Error in handleCheckIn:', err);
            setError(err.message || 'Failed to check in booking');
        } finally {
            setCheckingInId(null);
        }
    };

    const handleCheckOut = async (id) => {
        console.log('Check-out button clicked for booking ID:', id); // Debug log
        try {
            setCheckingOutId(id);
            await checkOutBooking(id);
            await fetchBookings();
            setError(null);
        } catch (err) {
            console.error('Error in handleCheckOut:', err);
            setError(err.message || 'Failed to check out booking');
        } finally {
            setCheckingOutId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Booking List</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {noResults && !error && (
                <p className="text-yellow-600 mb-4">
                    No bookings found matching your filter criteria.
                </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <input name="roomNumber" value={filters.roomNumber} onChange={handleInputChange} placeholder="Room Number" className="border px-2 py-1" />
                <input name="username" value={filters.username} onChange={handleInputChange} placeholder="Username" className="border px-2 py-1" />

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
                    <option value="Completed">Completed</option> {/* Added Completed to the filter options */}
                </select>
            </div>

            <table className="table-auto w-full border">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Booking ID</th>
                        <th className="border px-4 py-2">Room Number</th>
                        <th className="border px-4 py-2">Username</th>
                        <th className="border px-4 py-2">Created At</th>
                        <th className="border px-4 py-2">Check-in</th>
                        <th className="border px-4 py-2">Check-out</th>
                        <th className="border px-4 py-2">Updated At</th>
                        <th className="border px-4 py-2">Total</th>
                        <th className="border px-4 py-2">Status</th>
                        <th className="border px-4 py-2">Actions</th> {/* Renamed column for clarity */}
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.bookingID}>
                            <td className="border px-4 py-2">{b.bookingID}</td>
                            <td className="border px-4 py-2">{b.roomNumber}</td>
                            <td className="border px-4 py-2">{b.username}</td>
                            <td className="border px-4 py-2">{formatDate(b.createdAt)}</td>
                            <td className="border px-4 py-2">{formatDate(b.checkInDate)}</td>
                            <td className="border px-4 py-2">{formatDate(b.checkOutDate)}</td>
                            <td className="border px-4 py-2">{formatDate(b.updatedAt)}</td>
                            <td className="border px-4 py-2">{b.totalAmount}</td>
                            <td className="border px-4 py-2">{b.bookingStatus}</td>
                            <td className="border px-4 py-2">
                                {b.bookingStatus === 'Pending' && (
                                    <button
                                        onClick={() => handleCheckIn(b.bookingID)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                                        disabled={checkingInId === b.bookingID}
                                    >
                                        {checkingInId === b.bookingID ? 'Checking In...' : 'Check-in'}
                                    </button>
                                )}
                                {b.bookingStatus === 'Confirmed' && (
                                    <button
                                        onClick={() => handleCheckOut(b.bookingID)}
                                        className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
                                        disabled={checkingOutId === b.bookingID}
                                    >
                                        {checkingOutId === b.bookingID ? 'Checking Out...' : 'Check-out'}
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