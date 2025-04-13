import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    // Sample room data
    const rooms = [
        { name: 'Classic Room', description: 'Experience timeless elegance with classic decor, a plush bed, and serene ambiance for a restful stay.', image: 'https://landmark72.intercontinental.com/wp-content/uploads/16-1.jpg' },
        { name: 'Premium Room', description: 'Elevate your stay with modern luxury, featuring sleek furnishings, a spacious layout, and stunning city views.', image: 'https://landmark72.intercontinental.com/wp-content/uploads/14-1.jpg' },
        { name: 'Junior Suite', description: 'Redefine luxury with a separate living area for relaxation and a king bedroom for ultimate comfort.', image: 'https://landmark72.intercontinental.com/wp-content/uploads/25.jpg' },
        { name: 'Premier Suite', description: 'A paragon of unparalleled luxury with the finest furnishings and high-end finishes.', image: 'https://landmark72.intercontinental.com/wp-content/uploads/Ambassador-Suite_Living-Room.jpg' },
        { name: 'Ambassador Suite', description: 'A haven of tranquility with two well-appointed bedrooms, each boasting sweeping city views.', image: 'https://landmark72.intercontinental.com/wp-content/uploads/30.jpg' },
        { name: 'Royal Suite', description: 'The pinnacle of luxury with 2 king bedrooms, a spa-inspired marble bathroom, and a sophisticated living area.', image: 'https://landmark72.intercontinental.com/wp-content/uploads/intercontinental-hanoi-presidential-suite-2_2.jpg' },
    ];

    // Sample services data
    const services = [
        { icon: 'ri-football-line', title: 'Sport', description: 'Enjoy a complete experience at our hotel modern sport complex, equipped with the latest exercise equipment.' },
        { icon: 'ri-restaurant-line', title: 'Breakfast', description: 'Start your day with a delicious and varied breakfast at our hotel, with a rich buffet of oriental and international dishes.' },
        { icon: 'ri-cup-line', title: 'Rooftop Bar', description: 'Unwind at our elegant rooftop bar, offering a selection of signature cocktails and fine wines.' },
        { icon: 'ri-hotel-line', title: 'Quality Rooms', description: 'Our hotel rooms combine comfort and high quality, with elegant design and stunning views.' },
        { icon: 'ri-parking-box-line', title: 'Parking Space', description: 'Our hotel offers free parking to ensure the comfort and safety of our guest vehicles.' },
        { icon: 'ri-bus-line', title: 'Pick Up & Drop', description: 'Enjoy convenient hotel pick-up and drop-off service, including airport transfers and sightseeing tours.' },
    ];

    // Scroll-triggered animation
    useEffect(() => {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.2 }
        );

        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Luxury Awaits at InterContinental Hanoi</h1>
                    <p>Discover unparalleled elegance with world-class amenities and breathtaking views.</p>
                    <button className="hero-cta" onClick={() => navigate('/available-rooms')}>
                        Book Now
                    </button>
                </div>
            </section>

            {/* Rooms Section */}
            <section className="rooms-section">
                <h2>Exclusive Rooms</h2>
                <div className="rooms-grid">
                    {rooms.map((room, index) => (
                        <div key={index} className="room-card" style={{ '--index': index }}>
                            <div className="room-image">
                                <img src={room.image} alt={room.name} />
                            </div>
                            <div className="room-content">
                                <h3>{room.name}</h3>
                                <p>{room.description}</p>
                                <button className="room-cta" onClick={() => navigate('/available-rooms')}>
                                    Explore
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section">
                <h2>Premium Services</h2>
                <p className="services-description">
                    Experience a seamless stay with our top-tier services, designed for your comfort and convenience.
                </p>
                <div className="services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="service-card" style={{ '--index': index }}>
                            <i className={`${service.icon} service-icon`}></i>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer Section */}
            <Footer />
        </div>
    );
};

export default Home;