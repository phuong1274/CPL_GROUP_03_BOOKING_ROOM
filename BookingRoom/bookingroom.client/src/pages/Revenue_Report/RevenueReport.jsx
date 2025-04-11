import React, { useEffect, useState } from 'react';
import { getRevenueReport } from '../../services/reportService';
import { getRooms } from '../../services/roomService';
import './RevenueReport.css'
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';


// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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

    // Prepare data for the chart
    const chartData = {
        labels: reportData.map((data) => data.period),
        datasets: [
            {
                label: 'Total Revenue ($)',
                data: reportData.map((data) => data.totalRevenue),
                borderColor: '#b8860b',
                backgroundColor: 'rgba(184, 134, 11, 0.2)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Booking Count',
                data: reportData.map((data) => data.bookingCount),
                borderColor: '#00aced',
                backgroundColor: 'rgba(0, 172, 237, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allow the chart to fill the container
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Revenue and Booking Trends',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Period',
                },
            },
        },
    };

    return (
        <div className="p-4 flex flex-col lg:flex-row gap-6">
            {/* Left Section: Filters and Table */}
            <div className="lg:w-1/2 w-full">
                <h2 className="text-xl font-bold mb-4">Revenue Report</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

                {reportData.length === 0 ? (
                    <div className="no-data-box">
                        <p className="text-center text-gray-500">
                            No bookings found for the selected criteria.
                        </p>
                    </div>
                ) : (
                    <table className="table-auto w-full border">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Period</th>
                                <th className="border px-4 py-2">Total Revenue</th>
                                <th className="border px-4 py-2">Booking Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((data, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{data.period}</td>
                                    <td className="border px-4 py-2">
                                        ${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="border px-4 py-2">{data.bookingCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Right Section: Chart */}
            <div className="lg:w-1/2 w-full flex justify-center items-center">
                <div className="chart-container">
                    {reportData.length === 0 ? (
                        <p className="text-center text-gray-500">No data to display in chart.</p>
                    ) : (
                        <Line data={chartData} options={chartOptions} />
                    )}
                </div>
            </div>
        </div>
    );
}