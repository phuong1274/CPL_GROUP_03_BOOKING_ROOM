// components/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Contact Info */}
                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <p><strong>Phone:</strong> +84 24 3698 8888</p>
                    <p><strong>Email:</strong> <a href="mailto:info@intercontinentalhanoi.com">info@intercontinentalhanoi.com</a></p>
                    <p><strong>Address:</strong> Keangnam Hanoi Landmark Tower, Plot E6, Cau Giay Urban Area, Hanoi, Vietnam</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2025 InterContinental Hanoi Landmark72. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;