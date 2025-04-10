import React, { useEffect, useState } from 'react';
import { getRevenueReport } from '../services/reportService';
import { getRooms } from '../services/roomService';

export default function RevenueReport() {
    const [reportData, setReportData] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [reportType, setReportType] = useState('Daily');
    const [status, setStatus] = useState('');
    const [roomId, setRoomId] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        fetchRevenueReport();
    }, [reportType, status, roomId]);

    const fetchRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch rooms');
        }
    };

    const fetchRevenueReport = async () => {
        try {
            const data = await getRevenueReport(
                reportType,
                status || null,
                roomId || null
            );
            setReportData(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch revenue report');
            setReportData([]);
        }
    };

    const handleReportTypeChange = (e) => {
        setReportType(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleRoomChange = (e) => {
        setRoomId(e.target.value);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Revenue Report</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="flex gap-4 mb-4">
                <div>
                    <label className="mr-2">Report Type:</label>
                    <select
                        value={reportType}
                        onChange={handleReportTypeChange}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly (Last 7 Days)</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>

                <div>
                    <label className="mr-2">Filter by Status:</label>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="">All Statuses</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancel">Cancel</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label className="mr-2">Filter by Room:</label>
                    <select
                        value={roomId}
                        onChange={handleRoomChange}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="">All Rooms</option>
                        {rooms.map((room) => (
                            <option key={room.roomID} value={room.roomID}>
                                {room.roomNumber} ({room.roomTypeName})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <table className="table-auto w-full border">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Period</th>
                        <th className="border px-4 py-2">Total Revenue</th>
                        <th className="border px-4 py-2">Booking Count</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="border px-4 py-2 text-center text-gray-500">
                                No data available.
                            </td>
                        </tr>
                    ) : (
                        reportData.map((data, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{data.period}</td>
                                <td className="border px-4 py-2">${data.totalRevenue.toFixed(2)}</td>
                                <td className="border px-4 py-2">{data.bookingCount}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}