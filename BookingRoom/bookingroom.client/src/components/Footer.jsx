// components/Footer.jsx
import React from 'react';
import './style/Footer.css'; // Import the corresponding CSS file

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Contact Information */}
                <div className="footer-contact">
                    <h3>Contact Us</h3>
                    <p>
                        <span className="footer-label">Phone:</span> +1-123-456-7890
                    </p>
                    <p>
                        <span className="footer-label">Email:</span> example@gmail.com
                    </p>
                </div>

                {/* Social Media Links */}
                <div className="footer-social">
                    <h3>Follow Us</h3>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            Facebook
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            Twitter
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            Instagram
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2025 Your Company Name. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;