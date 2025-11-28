import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import RestaurantPage from './pages/RestaurantPage';
import Checkout from './pages/Checkout';
import Reels from './pages/Reels';
import QROrder from './pages/QROrder';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantLogin from './pages/RestaurantLogin';
import Settings from './pages/Settings';
import PaymentSettings from './pages/PaymentSettings';
import UserLogin from './pages/UserLogin';
import OrderHistory from './pages/OrderHistory';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-16">
            <Routes>
              <Route path="/" element={<><Navbar /><Home /><BottomNav /></>} />
              <Route path="/restaurant/:id" element={<><Navbar /><RestaurantPage /><BottomNav /></>} />
              <Route path="/checkout" element={<><Navbar /><Checkout /><BottomNav /></>} />
              <Route path="/reels" element={<><Reels /><BottomNav /></>} />
              <Route path="/qr/:restaurantId/:tableNumber" element={<QROrder />} />
              <Route path="/restaurant-login" element={<RestaurantLogin />} />
              <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
              <Route path="/payment-settings" element={<PaymentSettings />} />
              <Route path="/login" element={<><Navbar /><UserLogin /><BottomNav /></>} />
              <Route path="/orders" element={<><Navbar /><OrderHistory /><BottomNav /></>} />
              <Route path="/settings" element={<><Navbar /><Settings /><BottomNav /></>} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
