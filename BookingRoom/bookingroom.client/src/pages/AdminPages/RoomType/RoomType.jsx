import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { getRoomTypes, deleteRoomType, addRoomType, updateRoomType, getRoomTypeById } from '../../../services/roomService';
import styles from './RoomType.module.css';

function RoomType() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [filteredRoomTypes, setFilteredRoomTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomTypeId, setRoomTypeId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [roomType, setRoomType] = useState({
        roomTypeName: '',
        description: '',
        price: '',
        validDate: '',
    });
    const navigate = useNavigate();

    // Fetch all room types
    const fetchRoomTypes = async () => {
        try {
            const data = await getRoomTypes();
            setRoomTypes(data);
            setFilteredRoomTypes(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = roomTypes.filter(type =>
            type.roomTypeName.toLowerCase().includes(term)
        );
        setFilteredRoomTypes(filtered);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room type?')) {
            try {
                await deleteRoomType(id);
                setRoomTypes(roomTypes.filter((type) => type.roomTypeID !== id));
                setFilteredRoomTypes(filteredRoomTypes.filter((type) => type.roomTypeID !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // Handle edit
    const handleEdit = async (id) => {
        setIsLoading(true);
        try {
            const data = await getRoomTypeById(id);
            setRoomType({
                roomTypeName: data.roomTypeName,
                description: data.description,
                price: data.price,
                validDate: data.validDate.split('T')[0]
            });
            setRoomTypeId(id);
            setIsModalOpen(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle add
    const handleAdd = () => {
        setRoomType({
            roomTypeName: '',
            description: '',
            price: '',
            validDate: '',
        });
        setRoomTypeId(null);
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRoomTypeId(null);
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomType(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedDate = new Date(roomType.validDate);
            if (selectedDate <= new Date()) {
                setError("Valid date must be in the future");
                return;
            }

            if (roomTypeId) {
                await updateRoomType(roomTypeId, {
                    roomTypeName: roomType.roomTypeName,
                    description: roomType.description,
                    price: roomType.price,
                    validDate: roomType.validDate
                });
            } else {
                await addRoomType({
                    roomTypeName: roomType.roomTypeName,
                    description: roomType.description,
                    price: roomType.price,
                    validDate: roomType.validDate
                });
            }
            fetchRoomTypes();
            handleCloseModal();
        } catch (err) {
            setError(err.message);
            console.error('Operation error:', err);
        }
    };

    // Load room types on component mount
    useEffect(() => {
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null); 
            }, 3000);

            
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <Container className={styles.roomTypeContainer}>
            <Row>
                <h1 className={styles.roomTypeTitle}>Room Type List</h1>
            </Row>
            <Row>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {isLoading && <p className={styles.loadingMessage}>Loading...</p>}
            </Row>
            <div className={styles.searchFilter}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.addButtonWrapper}>
                    <button
                        onClick={handleAdd}
                        className={styles.addButton}
                    >
                        Add New Room Type
                    </button>
                </div>
            </div>
            <Row>
                {filteredRoomTypes.map((type) => (
                    <Col xs={12} sm={6} md={6} lg={3} className="mt-3" key={type.roomTypeID}>
                        <Card className={styles.roomTypeCard}>
                            <Card.Body>
                                <Card.Title className={styles.cardTitle}>{type.roomTypeName}</Card.Title>
                                <Card.Text className={styles.cardText}>
                                    <hr />
                                    <div className={styles.cardDescription}>Description: {type.description}</div>
                                    <hr />
                                    <div className={styles.cardPrice}>Price: {type.price}</div>
                                    <hr />
                                    <div className={styles.cardValidDate}>Valid Date: {new Date(type.validDate).toLocaleDateString()}</div>
                                    <hr />
                                </Card.Text>
                                <div className={styles.cardActions}>
                                    <Button
                                        variant="warning"
                                        className="mx-2"
                                        onClick={() => handleEdit(type.roomTypeID)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(type.roomTypeID)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>


            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>{roomTypeId ? 'Edit Room Type' : 'Add Room Type'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Name:</label>
                                <input
                                    type="text"
                                    name="roomTypeName"
                                    value={roomType.roomTypeName}
                                    onChange={handleChange}
                                    required
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description:</label>
                                <textarea
                                    name="description"
                                    value={roomType.description}
                                    onChange={handleChange}
                                    className={styles.formTextarea}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Price:</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={roomType.price}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Valid Date:</label>
                                <input
                                    type="date"
                                    name="validDate"
                                    value={roomType.validDate}
                                    onChange={handleChange}
                                    required
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={roomTypeId ? styles.updateButton : styles.saveButton}
                                >
                                    {roomTypeId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Container>
    );
}

export default RoomType;