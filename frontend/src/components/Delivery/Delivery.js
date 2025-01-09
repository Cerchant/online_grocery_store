import React, { useState, useEffect } from 'react';
import API_URL from '../constants';
import apiClient from '../axiosConfig';
import './Delivery.css';

const Delivery = () => {
  const [deliveries, setDeliveries] = useState([]);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiClient.get(`${API_URL}api/deliveries/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Ошибка загрузки доставок:', error.response?.data);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div>
      <h2>Доставки</h2>
      <ul>
        {deliveries.map((delivery) => (
          <li key={delivery.id}>
            Заказ #{delivery.order.id}: {delivery.delivery_status.status} - {delivery.delivery_address}
            {delivery.delivered_at && <span> (Доставлено: {new Date(delivery.delivered_at).toLocaleString()})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Delivery;
