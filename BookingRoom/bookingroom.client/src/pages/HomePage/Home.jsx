import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import './Home.css';

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
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/25.jpg',
        },
        {
            name: 'Premier Suite',
            description: 'A paragon of unparalleled luxury with the finest furnishings and high-end finishes.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/Ambassador-Suite_Living-Room.jpg',
        },
        {
            name: 'Ambassador Suite',
            description: 'A haven of tranquility with two well-appointed bedrooms, each boasting sweeping city views.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/30.jpg',
        },
        {
            name: 'Royal Suite',
            description: 'The pinnacle of luxury with 2 king bedrooms, a spa-inspired marble bathroom, and a sophisticated living area.',
            image: 'https://landmark72.intercontinental.com/wp-content/uploads/intercontinental-hanoi-presidential-suite-2_2.jpg',
        },
    ];

    // Sample services data
    const services = [
        {
            icon: 'ri-football-line',
            title: 'Sport',
            description: 'Enjoy a complete experience at our hotel modern sport complex, equipped with the latest exercise equipment to help you stay active during your stay. The stadiums, services and devices are a modern, air-conditioned environment, with a variety of training options.',
        },
        {
            icon: 'ri-restaurant-line',
            title: 'Breakfast',
            description: 'Start your day with a delicious and varied breakfast at our hotel, where we offer a rich buffet of oriental and international dishes, with hot and cold drinks, in a comfortable and wonderful view atmosphere.',
        },
        {
            icon: 'ri-cup-line',
            title: 'Rooftop Bar',
            description: 'Unwind at our elegant rooftop bar, offering a selection of signature cocktails and fine wines, with breathtaking panoramic views of Hanoi skyline, perfect for a memorable evening.',
        },
        {
            icon: 'ri-hotel-line',
            title: 'Quality Rooms',
            description: 'Our hotel rooms combine comfort and high quality, with elegant design and a stunning view of Luxor Temple, for a unique stay in the heart of the historic city.',
        },
        {
            icon: 'ri-parking-box-line',
            title: 'Parking Space',
            description: 'Our hotel offers free parking to ensure the comfort and safety of our guest vehicles throughout their stay.',
        },
        {
            icon: 'ri-bus-line',
            title: 'Pick Up & Drop',
            description: 'Enjoy convenient hotel pick-up and drop-off service, including airport transfers and safe sightseeing tours, to ensure a smooth journey during your stay.',
        },
    ];

    // Handle quick booking form submission
    const handleQuickBook = (e) => {
        e.preventDefault();
        navigate('/booking');
    };

    return (
        <>
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
                            <div
                                key={index}
                                className={`room-card ${index % 2 === 0 ? 'row-normal' : 'row-reverse'}`}
                            >
                                <div className={`room-image ${index % 2 === 0 ? 'slide-from-left' : 'slide-from-right'}`}>
                                    <img src={room.image} alt={room.name} />
                                </div>
                                <div className="room-content">
                                    <h3>{room.name}</h3>
                                    <p>{room.description}</p>
                                    <Link to="/booking" className="book-link">Book This Room</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Services Section */}
                <section className="services-section">
                    <h2>Our Services</h2>
                    <p className="services-description">
                        Our hotel offers integrated services that combine comfort and excellence, including rooms with a charming view of Luxor Temple, a fine restaurant, a gym, a rooftop bar, and a tourist transportation service, to ensure an unforgettable stay in the heart of history.
                    </p>
                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div key={index} className="service-card">
                                <i className={`${service.icon} service-icon`}></i>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            {/* Footer Section */}
            <Footer />
        </>
    );
};

export default Home;