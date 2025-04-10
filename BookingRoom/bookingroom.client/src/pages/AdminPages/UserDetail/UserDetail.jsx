import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../../../services/authService';
import styles from './UserDetail.module.css'; 

const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserById(id);
                setUser(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch user details');
            }
        };

        fetchUser();
    }, [id]);

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    if (!user) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    return (
        //<div style={{ padding: '20px' }}>
        //    <h2>User Details</h2>
        //    <div>
        //        <p><strong>ID:</strong> {user.id}</p>
        //        <p><strong>Username:</strong> {user.username}</p>
        //        <p><strong>Email:</strong> {user.email}</p>
        //        <p><strong>Full Name:</strong> {user.fullName}</p>
        //        <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
        //        <p><strong>Role:</strong> {user.role}</p>
        //        <p><strong>Points:</strong> {user.points}</p>
        //        <p><strong>Status:</strong> {user.status}</p>
        //        <p><strong>Create time:</strong> {user.createAt}</p>
        //    </div>
        //    <button onClick={() => navigate('/users')} style={{ marginTop: '10px' }}>
        //        Back to User List
        //    </button>
        //</div>
        <div className={styles.userDetailContainer}>
            <h2 className={styles.userDetailTitle}>User Details</h2>
            <div className={styles.userInfo}>
                <p className={styles.infoItem}><strong>ID:</strong> {user.id}</p>
                <p className={styles.infoItem}><strong>Username:</strong> {user.username}</p>
                <p className={styles.infoItem}><strong>Email:</strong> {user.email}</p>
                <p className={styles.infoItem}><strong>Full Name:</strong> {user.fullName}</p>
                <p className={styles.infoItem}><strong>Phone Number:</strong> {user.phoneNumber}</p>
                <p className={styles.infoItem}><strong>Role:</strong> {user.role}</p>
                <p className={styles.infoItem}><strong>Points:</strong> {user.points}</p>
                <p className={styles.infoItem}><strong>Status:</strong> {user.status}</p>
                <p className={styles.infoItem}><strong>Create time:</strong> {user.createAt}</p>
            </div>
            <button
                onClick={() => navigate('/users')}
                className={styles.backButton}
            >
                Back to User List
            </button>
        </div>
    );
};

export default UserDetail;