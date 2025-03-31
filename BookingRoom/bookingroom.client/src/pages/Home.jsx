// pages/Home.jsx
//import './styles/Home.css';

//function Home() {
//    return (
//        <div className="home-page">
//            {/* Hero Section */}
//            <section className="hero-section">
//                <div className="hero-overlay"></div>
//                <div className="hero-content">
//                    <h1>Welcome to Your Perfect Stay</h1>
//                    <p>Discover luxury and comfort at its finest. Book your stay today!</p>
//                </div>
//            </section>
//        </div>
//    );
//}

//export default Home;

// pages/Home.jsx
import './styles/Home.css';

function Home() {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Welcome to Your Perfect Stay</h1>
                    <p>Discover luxury and comfort at its finest. Book your stay today!</p>
                </div>
            </section>

            {/* Featured Section */}
            <section className="featured-section">
                <h2>Explore Our Offerings</h2>
                <div className="featured-grid">
                    <div className="featured-item">
                        <img
                            src="https://images.unsplash.com/photo-1611892440504-42a792e24c48?q=80&w=2070&auto=format&fit=crop"
                            alt="Deluxe Room"
                        />
                        <div className="featured-content">
                            <h3>Luxurious Rooms</h3>
                            <p>Experience comfort and elegance in our beautifully designed rooms.</p>
                            <a href="/rooms">View Rooms</a>
                        </div>
                    </div>
                    <div className="featured-item">
                        <img
                            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
                            alt="Dining"
                        />
                        <div className="featured-content">
                            <h3>Exquisite Dining</h3>
                            <p>Savor world-class cuisine at our award-winning restaurants.</p>
                            <a href="#">Learn More</a>
                        </div>
                    </div>
                    <div className="featured-item">
                        <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
                            alt="Spa"
                        />
                        <div className="featured-content">
                            <h3>Relaxing Spa</h3>
                            <p>Unwind with a rejuvenating spa experience tailored to your needs.</p>
                            <a href="#">Learn More</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;