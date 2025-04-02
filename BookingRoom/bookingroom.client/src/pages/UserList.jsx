import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUserStatus } from '../services/authService';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // Thêm trạng thái cho thông báo thành công
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const data = await getUsers(search, role, page, pageSize);
            console.log("Users data received:", data);

            setUsers(Array.isArray(data.users) ? data.users : []);
            setTotalRecords(data.totalRecords || 0);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, role]);

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const response = await updateUserStatus(userId, newStatus);
            // Cập nhật danh sách users
            setUsers(users.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            ));
            // Hiển thị thông báo thành công với username
            setSuccessMessage(`Trạng thái của ${response.username} đã được cập nhật thành ${newStatus}`);
            setError(null);

            // Tự động xóa thông báo sau 3 giây
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update user status');
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`);
    };

    const statusOptions = ['Active', 'Deactive'];

    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
        <div style={{ padding: '20px' }}>
            <h2>User List</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>} 

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search by username, phone number, email or role"
                    value={search}
                    onChange={handleSearchChange}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <select value={role} onChange={handleRoleChange} style={{ padding: '5px' }}>
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Customer">Customer</option>
                </select>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Full Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Phone Number</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Points</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            onClick={() => handleUserClick(user.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.fullName || 'N/A'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.phoneNumber || 'N/A'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role || 'N/A'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.points ?? 0}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <select
                                    value={user.status}
                                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ padding: '2px' }}
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    style={{ marginRight: '10px' }}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    style={{ marginLeft: '10px' }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UserList;