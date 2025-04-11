import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Welcome, {user?.username || 'Guest'}!</h2>

            {/* User Profile Button with Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    onClick={toggleDropdown}
                    style={{ padding: '10px', cursor: 'pointer' }}
                >
                    User Profile
                </button>
                {dropdownOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            zIndex: 1,
                        }}
                    >
                        <button
                            onClick={() => {
                                navigate('/change-password');
                                setDropdownOpen(false);
                            }}
                            style={{ display: 'block', padding: '10px', width: '100%', textAlign: 'left' }}
                        >
                            Change Password
                        </button>
                        <button
                            onClick={() => {
                                navigate('/update-profile');
                                setDropdownOpen(false);
                            }}
                            style={{ display: 'block', padding: '10px', width: '100%', textAlign: 'left' }}
                        >
                            Update Profile
                        </button>
                    </div>
                )}
            </div>

            <button onClick={handleLogout} style={{ marginLeft: '20px', padding: '10px' }}>
                Logout
            </button>
        </div>
    );
};

export default Home;