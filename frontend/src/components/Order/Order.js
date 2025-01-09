import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../constants';
import apiClient from '../axiosConfig';
import './Order.css';

const Order = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get(`${API_URL}api/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setOrders(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Ошибка получения заказов:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId) => {
    try {
      await apiClient.put(`${API_URL}api/orders/update_status/${orderId}/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      // Повторная загрузка данных
      const response = await apiClient.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error);
      const errorMessage = error.response?.data?.error || 'Что-то пошло не так. Попробуйте позже.';
      alert(errorMessage);
    }
  };

  const handleRefund = async (orderId) => {
    try {
      await apiClient.put(`${API_URL}api/orders/refund/${orderId}/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const response = await apiClient.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Ошибка возврата заказа:', error);
      const errorMessage = error.response?.data?.error || 'Что-то пошло не так. Попробуйте позже.';
      alert(errorMessage);
    }
  };
  
  return (
    <div>
      <h1>Заказы</h1>
      {orders.length === 0 ? (
        <div>
          <p>Orders not found.</p>
          <Link to="/products">
            <button>Go to shopping</button>
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <h3>Заказ #{order.id}</h3>
            <p>
              <strong>Дата:</strong> {new Date(order.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Сумма:</strong> ${order.total_amount.toFixed(2)}
            </p>
            <p>
              <strong>Статус заказа:</strong> {order.order_status}
            </p>
            {order.order_status === "Not paid" && (
              <button onClick={() => handleUpdateStatus(order.id)}>Оплатить</button>
            )}
            {order.order_status !== "Refunded" && (
              <button onClick={() => handleRefund(order.id)}>Возврат</button>
            )}
            <h4>Продукты:</h4>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product ? (
                    <Link to={`/product/${item.product.id}`}>
                      {item.product.name}
                    </Link>
                  ) : (
                    'Продукт удален'
                  )}{' '}
                  - Количество: {item.quantity} - Цена: ${item.price_at_purchase.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default Order; 