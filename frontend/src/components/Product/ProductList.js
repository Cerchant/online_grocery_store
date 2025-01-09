import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../constants'; // Константа с базовым URL
import './ProductList.css';
import apiClient from '../axiosConfig';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');

  // Сопоставление категории и единицы измерения с фильтрами
  const categoryMap = {
    Fruits: 1,
    Vegetables: 2,
    Sausages: 3,
  };

  const unitMap = {
    Kg: 1,
    Pieces: 2,
  };

  // Получение списка продуктов
  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`${API_URL}api/products/`);
      setProducts(response.data);
      setFilteredProducts(response.data); // Изначально все продукты отображаются
    } catch (error) {
      console.error('Ошибка при загрузке продуктов:', error.response?.data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Фильтрация продуктов по категории, единице измерения и строке поиска
    let updatedProducts = products;

    if (categoryFilter !== 'All') {
      const categoryValue = categoryMap[categoryFilter];
      updatedProducts = updatedProducts.filter(
        (product) => product.category === categoryValue
      );
    }

    if (unitFilter !== 'All') {
      const unitValue = unitMap[unitFilter];
      updatedProducts = updatedProducts.filter(
        (product) => product.unit === unitValue
      );
    }

    if (searchTerm) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(updatedProducts);
  }, [categoryFilter, unitFilter, searchTerm, products]);

  // Добавление продукта в корзину
  const handleAddToCart = async (productId) => {
    const quantity = quantities[productId] || 1;
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.post(
        `${API_URL}api/cart/add/`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Товар добавлен в корзину!');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error.response?.data);
      alert('Не удалось добавить товар в корзину.');
    }
  };

  const handleQuantityChange = (productId, value) => {
    if (/^\d*$/.test(value)) {
      setQuantities((prev) => ({ ...prev, [productId]: value }));
    }
  };

  return (
    <div>
      <h2>Продукты</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск продуктов"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">Все категории</option>
          <option value="Fruits">Fruits</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Sausages">Sausages</option>
        </select>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
        >
          <option value="All">Все единицы измерения</option>
          <option value="Kg">Kg</option>
          <option value="Pieces">Pieces</option>
        </select>
      </div>
      <ul>
        {filteredProducts.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`} className="product-link">
              {product.name} - ${product.price}
            </Link>
            <input
              type="number"
              min="1"
              value={quantities[product.id] || ''}
              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
              placeholder="Кол-во"
            />
            <button onClick={() => handleAddToCart(product.id)}>
              Добавить в корзину
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
