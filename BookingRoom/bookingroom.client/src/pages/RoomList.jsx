import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const RoomList = () => {
    const location = useLocation();
    const bookingData = location.state?.bookingData || {};

    const rooms = [
        { id: 1, type: 'classic-room', name: 'Classic Room', description: 'Cozy room with a single bed.', price: 100, image: 'https://landmark72.intercontinental.com/wp-content/uploads/16-1.jpg' },
        { id: 2, type: 'premium-room', name: 'Premium Room', description: 'Spacious room with a king bed.', price: 150, image: 'https://landmark72.intercontinental.com/wp-content/uploads/14-1.jpg' },
        { id: 3, type: 'junior-suite', name: 'Junior Suite', description: 'Suite with living area and king bed.', price: 200, image: 'https://landmark72.intercontinental.com/wp-content/uploads/25.jpg' },
        { id: 4, type: 'premier-suite', name: 'Premier Suite', description: 'Luxury suite with premium amenities.', price: 250, image: 'https://landmark72.intercontinental.com/wp-content/uploads/Ambassador-Suite_Living-Room.jpg' },
        { id: 5, type: 'ambassador-suite', name: 'Ambassador Suite', description: 'Grand suite with two bedrooms.', price: 300, image: 'https://landmark72.intercontinental.com/wp-content/uploads/30.jpg' },
        { id: 6, type: 'royal-suite', name: 'Royal Suite', description: 'Top-tier suite with spa bathroom.', price: 400, image: 'https://landmark72.intercontinental.com/wp-content/uploads/intercontinental-hanoi-presidential-suite-2_2.jpg' },
    ];

    const [displayedRooms, setDisplayedRooms] = useState(rooms.slice(0, 3));
    const [hasMore, setHasMore] = useState(true);
    const lastRoomElementRef = useRef(null);

    const loadMoreRooms = () => {
        const currentLength = displayedRooms.length;
        const nextRooms = rooms.slice(currentLength, currentLength + 3);
        if (nextRooms.length > 0) {
            setDisplayedRooms((prev) => [...prev, ...nextRooms]);
        }
        if (currentLength + nextRooms.length >= rooms.length) {
            setHasMore(false);
        }
    };

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreRooms();
                }
            },
            { threshold: 1.0 }
        );

        if (lastRoomElementRef.current) {
            observer.observe(lastRoomElementRef.current);
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [displayedRooms, hasMore]);

    return (
        <div className="room-list-page">
            <h2>Room List</h2>
            <div className="rooms-grid">
                {displayedRooms.map((room, index) => {
                    const isLastElement = index === displayedRooms.length - 1;
                    return (
                        <div
                            key={room.id}
                            className="room-card"
                            ref={isLastElement ? lastRoomElementRef : null}
                        >
                            <img src={room.image} alt={room.name} />
                            <h3>{room.name}</h3>
                            <p>{room.description}</p>
                            <p className="room-price">${room.price}/night</p>
                            <Link
                                to={{
                                    pathname: '/booking',
                                    state: { bookingData, selectedRoom: room }
                                }}
                                className="book-link"
                            >
                                Book This Room
                            </Link>
                        </div>
                    );
                })}
            </div>
            {!hasMore && displayedRooms.length === rooms.length && (
                <p className="no-more-rooms">No more rooms to load</p>
            )}
        </div>
    );
};

export default RoomList;