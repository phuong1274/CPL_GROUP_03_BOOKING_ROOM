import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
    const featuredRooms = [
        {
            name: 'Classic Room',
            description: 'Experience timeless elegance with classic decor and a plush bed.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/16-1.jpg',
            type: 'classic-room',
        },
        {
            name: 'Premier Suite',
            description: 'A paragon of luxury with the finest furnishings and high-end finishes.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/Ambassador-Suite_Living-Room.jpg',
            type: 'premier-suite',
        },
        {
            name: 'Royal Suite',
            description: 'The pinnacle of luxury with 2 king bedrooms and a sophisticated living area.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/intercontinental-hanoi-presidential-suite-2_2.jpg',
            type: 'royal-suite',
        },
    ];

    return (
        <div className="home">
            <section className="hero">
                <div className="hero-content">
                    <h1>Indulge in Luxury at InterContinental Hanoi Landmark72</h1>
                    <p>Experience the highest luxury hotel in Hanoi with panoramic views and world-class amenities.</p>
                </div>
            </section>

            <section className="about-us-section">
                <h2>About Us</h2>
                <div className="about-us-content">
                    <div className="about-us-text">
                        <p>
                            Welcome to InterContinental Hanoi Landmark72, where luxury meets unparalleled hospitality.
                            Nestled in the heart of Hanoi, our hotel offers breathtaking views, world-class amenities,
                            and a commitment to making your stay unforgettable. Whether you're here for business or leisure,
                            we ensure every moment is exceptional.
                        </p>
                    </div>
                    <div className="about-us-image">
                        <img
                            src="https://landmark72.intercontinental.com/wp-content/uploads/2-1.jpg"
                            alt="About InterContinental Hanoi Landmark72"
                        />
                    </div>
                </div>
            </section>

            <section className="rooms-section">
                <h2>Our Rooms</h2>
                <h3>
                    A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring
                    which I enjoy with my whole heart.
                </h3>
                <div className="rooms-grid">
                    {featuredRooms.map((room, index) => (
                        <div key={index} className="room-card">
                            <img src={room.image} alt={room.name} />
                            <h3>{room.name}</h3>
                            <p>{room.description}</p>
                            <Link
                                to={`/room-list?roomType=${encodeURIComponent(room.type)}`}
                                className="book-link"
                            >
                                Book This Room
                            </Link>
                        </div>
                    ))}
                </div>
                <Link to="/room-list" className="view-all-btn">View All Rooms</Link>
            </section>
            <Footer />
        </div>
    );
};

export default Home;