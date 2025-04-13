import React, { useEffect, useState, useRef } from 'react';
import {
    getRoomTypes,
    getRoomTypeById,
    getAvailableRooms,
    getRoomById,
    bookRoom
} from '../../../services/customerService';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import styles from './AvailableRooms.module.css';

export default function AvailableRooms() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [roomTypeId, setRoomTypeId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showBookingBox, setShowBookingBox] = useState(false);
    const [bookingRoom, setBookingRoom] = useState(null);
    const navigate = useNavigate();
    const bookingBoxRef = useRef(null);

    useEffect(() => {
        const appHeader = document.querySelector('.app-header');
        if (appHeader) {
            const headerHeight = appHeader.offsetHeight;
            const pageHeader = document.querySelector(`.${styles.headerWrapper}`);
            if (pageHeader) {
                pageHeader.style.height = `calc(100vh - ${headerHeight}px)`;
                pageHeader.style.marginTop = `${headerHeight}px`;
            }
        }
    }, []);

    useEffect(() => {
        fetchRoomTypes();
        fetchAvailableRooms();
    }, []);

    useEffect(() => {
        fetchAvailableRooms();
    }, [roomTypeId, selectedDate]);

    const fetchRoomTypes = async () => {
        try {
            const types = await getRoomTypes();
            setRoomTypes(types);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchAvailableRooms = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (roomTypeId) params.roomTypeId = roomTypeId;
            if (selectedDate) params.date = selectedDate;

            const data = await getAvailableRooms(params);
            const enrichedRooms = await Promise.all(
                data.map(async (room) => {
                    try {
                        const [roomType, roomDetail] = await Promise.all([
                            getRoomTypeById(room.roomTypeID),
                            getRoomById(room.roomID)
                        ]);
                        return {
                            ...room,
                            roomTypeName: roomType?.roomTypeName || 'No type',
                            price: roomType?.price || 0,
                            media: roomDetail?.media || [],
                        };
                    } catch {
                        return {
                            ...room,
                            roomTypeName: 'No type',
                            price: 0,
                            media: [],
                        };
                    }
                })
            );
            setRooms(enrichedRooms);
        } catch (err) {
            setError(err.message);
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmBooking = async (room) => {
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to book.");
            navigate('/login');
            return;
        }

        try {
            const checkInDate = new Date(selectedDate).toISOString();
            const payload = {
                RoomID: room.roomID,
                CheckInDate: checkInDate
            };
            await bookRoom(payload);
            alert(`Booked room ${room.roomNumber} on ${selectedDate} successfully!`);
            setShowBookingBox(false);
            navigate('/my-booking');
        } catch (err) {
            alert(`Booking failed: ${err.message}`);
            if (err.message.includes('Unauthorized') || err.message.includes('Session expired')) {
                navigate('/login');
            }
        }
    };

    const renderMediaPreview = (media) => {
        if (!media || media.length === 0) {
            return (
                <div className={styles.mediaPlaceholder}>
                    <span className="text-muted">No image</span>
                </div>
            );
        }

        const first = media[0];
        const link = `https://localhost:7067${first.media_Link}`;
        const type = first.mediaType;

        return (
            <div className={styles.mediaPreview}>
                {type === 'Image' ? (
                    <img src={link} alt="Room" className="w-100 h-100 object-fit-cover" />
                ) : type === 'Video' ? (
                    <video className="w-100 h-100 object-fit-cover" controls>
                        <source src={link} type="video/mp4" />
                    </video>
                ) : (
                    <div className={styles.mediaPlaceholder}>
                        <span className="text-muted">Unsupported format</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className={styles.headerWrapper}>
                <h1 className={styles.headerText}>STAY</h1>
            </div>

            <div className={styles.roomIntroSection}>
                <h2 className={styles.roomIntroTitle}>ROOMS THAT INSPIRE</h2>
                <p className={styles.roomIntroText}>
                    Whether you are visiting the city for business or leisure, relax in the deep-soaking bathtub and sleep in ultimate comfort on a luxurious pillow top mattress of one of the finest luxury hotel rooms in Hanoi.
                </p>
                <div className={styles.roomTypeButtons}>
                    <button className={`${styles.roomTypeButton} ${roomTypeId === '' ? styles.active : ''}`} onClick={() => setRoomTypeId('')}>
                        VIEW ALL
                    </button>
                    {roomTypes.map((type) => (
                        <button
                            key={type.roomTypeID}
                            className={`${styles.roomTypeButton} ${roomTypeId === type.roomTypeID ? styles.active : ''}`}
                            onClick={() => setRoomTypeId(type.roomTypeID)}
                        >
                            {type.roomTypeName.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`container ${styles.containerWrapper}`}>
                {error && <Alert variant="danger">{error}</Alert>}

                {showBookingBox && bookingRoom && (
                    <div ref={bookingBoxRef} className={styles.bookingBox}>
                        <div className={styles.bookingRow}>
                            <Form.Control
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className={styles.bookingDateInput}
                                min={new Date().toISOString().split('T')[0]}  
                            />

                            <button
                                className={styles.bookNowButton}
                                onClick={() => handleConfirmBooking(bookingRoom)}
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                )}


                {isLoading ? (
                    <div className={styles.spinnerWrapper}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : rooms.length === 0 ? (
                    <div className={styles.emptyMessage}>No rooms available.</div>
                ) : (
                    <div className={styles.cardList}>
                        {rooms.map((room) => (
                            <Card key={room.roomID} className="shadow-sm">
                                <Row className="g-0 align-items-stretch">
                                    <Col md={6}>{renderMediaPreview(room.media)}</Col>
                                    <Col md={6}>
                                        <Card.Body className={styles.cardBody}>
                                            <h5 className={styles.roomType}>{room.roomTypeName}</h5>
                                            <br />
                                            <p className={styles.roomDesc}>{room.description || 'No description available.'}</p>
                                            <br />
                                            <div className={styles.priceText}>${room.price.toFixed(2)} / Night</div>
                                            <br />
                                            <button
                                                className={styles.bookNowButton}
                                                onClick={() => {
                                                    setBookingRoom(room);
                                                    setShowBookingBox(true);
                                                    setTimeout(() => {
                                                        if (bookingBoxRef.current) {
                                                            bookingBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                        }
                                                    }, 100);
                                                }}
                                            >
                                                Book Now
                                            </button>
                                        </Card.Body>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
//o