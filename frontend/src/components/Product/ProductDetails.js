import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_URL from '../constants';
import apiClient from '../axiosConfig';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);

  const fetchProductDetails = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/api/products/${productId}/`);
      setProduct(response.data);
    } catch (error) {
      console.error('Ошибка загрузки деталей продукта:', error.response?.data);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/api/products/${productId}/reviews/`);
      setReviews(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error.response?.data);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await apiClient.post(
        `${API_URL}/api/products/${productId}/reviews/`,
        { comment: newReview, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReview('');
      setRating(5);
      fetchReviews(); // Обновляем список отзывов
    } catch (error) {
      console.error('Ошибка добавления отзыва:', error.response?.data);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [productId]);

  if (!product) return <p>Загрузка...</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <img src={`${API_URL}${product.image_url}`} alt={product.name} />
      <p>Цена: ${product.price}</p>
      <p>{product.description}</p>
      <h3>Отзывы</h3>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <strong>{review.user.username}</strong> ({review.rating}/5): {review.comment}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddReview}>
        <h4>Оставить отзыв</h4>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          required
          placeholder="Ваш отзыв"
        ></textarea>
        <div>
          <label>Оценка:</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

export default ProductDetails;
