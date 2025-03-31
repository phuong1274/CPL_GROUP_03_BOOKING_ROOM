// components/BookingForm.jsx
import { useState } from 'react';
import './styles/BookingForm.css';

function BookingForm() {
    const [formData, setFormData] = useState({
        checkInDate: '',
        checkOutDate: '',
        adults: 1,
        children: 0,
        rooms: 1,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Checking availability... (This is a placeholder)');
        console.log(formData);
    };

    return (
        <div className="booking-form">
            <form onSubmit={handleSubmit} className="booking-form-inner">
                <div className="form-group">
                    <label>Check-in Date</label>
                    <input
                        type="date"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Check-out Date</label>
                    <input
                        type="date"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Adults</label>
                    <select name="adults" value={formData.adults} onChange={handleChange} required>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Children</label>
                    <select name="children" value={formData.children} onChange={handleChange}>
                        {[0, 1, 2, 3, 4].map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Rooms</label>
                    <select name="rooms" value={formData.rooms} onChange={handleChange} required>
                        {[1, 2, 3, 4].map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="check-availability-btn">Check Availability</button>
            </form>
        </div>
    );
}

export default BookingForm;