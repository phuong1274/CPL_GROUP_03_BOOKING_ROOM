// pages/Home.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
    const navigate = useNavigate();

    // Sample room data inspired by InterContinental Hanoi Landmark72
    const rooms = [
        {
            name: 'Classic Room',
            description: 'Experience timeless elegance with classic decor, a plush bed, and serene ambiance for a restful stay.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/16-1.jpg',
        },
        {
            name: 'Premium Room',
            description: 'Elevate your stay with modern luxury, featuring sleek furnishings, a spacious layout, and stunning city views.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/14-1.jpg',
        },
        {
            name: 'Junior Suite',
            description: 'Redefine luxury with a separate living area for relaxation and a king bedroom for ultimate comfort.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/25.jpg', // Replace with actual image
        },
        {
            name: 'Premier Suite',
            description: 'A paragon of unparalleled luxury with the finest furnishings and high-end finishes.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/Ambassador-Suite_Living-Room.jpg', // Replace with actual image
        },
        {
            name: 'Ambassador Suite',
            description: 'A haven of tranquility with two well-appointed bedrooms, each boasting sweeping city views.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/30.jpg', // Replace with actual image
        },
        {
            name: 'Royal Suite',
            description: 'The pinnacle of luxury with 2 king bedrooms, a spa-inspired marble bathroom, and a sophisticated living area.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/intercontinental-hanoi-presidential-suite-2_2.jpg', // Replace with actual image
        },
    ];

    // Handle quick booking form submission
    const handleQuickBook = (e) => {
        e.preventDefault();
        navigate('/booking'); // Redirect to the booking page (will prompt login if not authenticated)
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Indulge in Luxury at InterContinental Hanoi Landmark72</h1>
                    <p>Experience the highest luxury hotel in Hanoi with panoramic views and world-class amenities.</p>
                </div>
            </section>

            {/* Rooms Section */}
            <section className="rooms-section">
                <h2>Discover Our Luxurious Rooms</h2>
                <div className="rooms-grid">
                    {rooms.map((room, index) => (
                        <div key={index} className="room-card">
                            <img src={room.image} alt={room.name} />
                            <h3>{room.name}</h3>
                            <p>{room.description}</p>
                            <Link to="/booking" className="book-link">Book This Room</Link>
                        </div>
                    ))}
                </div>
            </section>
            <Footer/> 
        </div>
    );
};

export default Home;