import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import './styles/main.css';
import Header from './components/Body/Header';
import Footer from './components/Body/Footer';
import ProductList from './components/Product/ProductList';
import ProductDetails from './components/Product/ProductDetails';
import CartPage from './components/Cart/CartPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OrderHistory from './components/Order/Order';
import Profile from './components/Profile/Profile';
import Delivery from './components/Delivery/Delivery';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const hideHeader = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideHeader && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<PrivateRoute><ProductList /></PrivateRoute>} />
          <Route path="/products/:productId" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/delivery" element={<PrivateRoute><Delivery /></PrivateRoute>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);
