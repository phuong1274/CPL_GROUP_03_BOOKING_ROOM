import React from 'react';
import './style/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            {/* Main Footer Content (Contact on the left, Social on the right) */}
            <div className="footer-container">
                {/* Contact Section (Left) */}
                <div className="footer-section footer-contact">
                    <h3>Contact</h3>
                    <p>
                        <i className="ri-map-pin-2-fill"></i> HaNoi, HN 2025, VietNam
                    </p>
                    <p>
                        <i className="ri-mail-fill"></i> BookingRoomG3@gmail.com
                    </p>
                    <p>
                        <i className="ri-phone-fill"></i> +84 234 567 889
                    </p>
                    <p>
                        <i className="ri-printer-fill"></i> +84 234 567 899
                    </p>
                </div>

                {/* Social Media Section (Right) */}
                <div className="footer-section footer-social-top">
                    <p>Connected With Us:</p>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <i className="ri-facebook-fill"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <i className="ri-twitter-fill"></i>
                        </a>
                        <a href="https://google.com" target="_blank" rel="noopener noreferrer" aria-label="Google">
                            <i className="ri-google-fill"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <i className="ri-instagram-fill"></i>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <i className="ri-linkedin-fill"></i>
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <i className="ri-github-fill"></i>
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <p>© 2025 Your Company Name. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;