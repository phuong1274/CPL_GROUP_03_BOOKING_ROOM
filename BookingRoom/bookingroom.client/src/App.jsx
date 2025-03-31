// App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
//import Rooms from './pages/Rooms.jsx';
import Booking from './pages/Booking.jsx';
//import Login from './pages/Login.jsx';

function App() {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                {/*<Route path="/rooms" element={<Rooms />} />*/}
                <Route path="/booking" element={<Booking />} />
                {/*    <Route path="/login" element={<Login />} />*/}
            </Routes>
        </div>
    );
}

export default App;