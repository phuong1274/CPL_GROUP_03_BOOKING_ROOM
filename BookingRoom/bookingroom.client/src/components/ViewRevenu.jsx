import React from 'react';
import { useAuth } from '../context/AuthContext';
import './style/ViewRevenu.css';

const ViewRevenu = () => {
    const { user } = useAuth();

    return (
        <div className="view-revenu-page">
            <h2>View Revenue</h2>
            <p>Username: {user?.username}</p>
            <p>This is a placeholder for your revenue information.</p>
        </div>
    );
};

export default ViewRevenu;