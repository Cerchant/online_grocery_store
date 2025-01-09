import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <nav>
        <Link to="/" className="logo">E-Shop</Link>
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              {/* <Link to="/wishlist">Wishlist</Link> */}
              <Link to="/orders">Заказы</Link>
              <Link to="/cart">Корзина</Link>
              <Link to="/delivery">Доставка</Link>
              <Link to="/profile">Профиль</Link>
              <button onClick={handleLogout} className="logout-button">Выйти</button>
            </>
          ) : (
            <Link to="/login">Войти</Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
