import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Body/Header';
import Footer from './components/Body/Footer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProductList from './components/Product/ProductList';
import ProductDetails from './components/Product/ProductDetails';
import CartPage from './components/Cart/CartPage';
import OrderHistory from './components/Order/Order';
import OrderDetails from './components/Order/OrderDetails';
import Wishlist from './components/Wishlist/Wishlist';

const App = () => {
  return (
    <Router>
      <div>
        {/* Header для навигации */}
        <Header />

        <main>
          <Routes>
            {/* Маршруты авторизации */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Страница деталей продукта */}
            <Route path="/products/:productId" element={<ProductDetails />} />
            {/* Главная страница со списком продуктов */}
            <Route path="/products" element={<ProductList />} />
            

            {/* Маршруты корзины */}
            <Route path="/cart" element={<CartPage />} />

            {/* Маршруты заказов */}
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />

            {/* Маршрут списка желаемого */}
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </main>

        {/* Footer для дополнительной информации */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
