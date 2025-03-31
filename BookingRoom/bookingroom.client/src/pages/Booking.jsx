// pages/Booking.jsx
import BookingForm from '../components/BookingForm.jsx';
import './styles/Booking.css';

function Booking() {
    return (
        <div className="booking-page">
            <div className="booking-content">
                <h1>Book Your Stay</h1>
                <p>Find the perfect room for your stay at our hotel. Enter your details below to check availability.</p>
                <BookingForm />
            </div>
        </div>
    );
}

export default Booking;