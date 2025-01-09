import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig';
import API_URL from '../constants';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0); // Обновляемая сумма корзины
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    fetchCart();
    fetchPaymentMethods();
  }, []);

  // Получение данных корзины
  const fetchCart = async () => {
    try {
      const response = await apiClient.get(API_URL + 'api/cart/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });

      const { items, total } = response.data; // Достаем items и total из структуры данных
      setCartItems(items || []); // Если корзина пуста, подстраховываемся
      setTotal(total || 0); // Устанавливаем общую сумму
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Получение методов оплаты
  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get(API_URL + 'api/payment-methods/');
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  // Удаление элемента корзины
  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`${API_URL}api/cart/delete/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      fetchCart(); // Обновляем корзину
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Изменение количества товара
  const handleQuantityChange = async (id, quantity) => {
    try {
      if (quantity < 1) return; // Минимальное количество - 1
      await apiClient.put(`${API_URL}api/cart/quantity/${id}/`, { quantity }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      fetchCart(); // Обновляем корзину
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Создание заказа
  const handleCreateOrder = async () => {
    try {
      await apiClient.post(`${API_URL}api/orders/create/`, {
        payment_method_id: selectedPaymentMethod,
        delivery_address: deliveryAddress,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      alert('Order created!');
      fetchCart(); // Очищаем корзину после создания заказа
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div>
      <h1>Ваша корзина</h1>
      {cartItems.length === 0 ? (
        <p>Ваша корзина пуста.</p>
      ) : (
        <div>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.product.name}</strong> - ${item.product.price} x {item.quantity}
                  <br />
                  Суммарная цена товара: ${item.subtotal}
                </div>
                <div>
                  <button onClick={() => handleDelete(item.id)}>Удалить</button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                    min="1"
                  />
                </div>
              </li>
            ))}
          </ul>
          <h3>Сумма: ${total}</h3>
        </div>
      )}

      <h3>Адрес доставки</h3>
      <input
        type="text"
        value={deliveryAddress}
        onChange={(e) => setDeliveryAddress(e.target.value)}
      />

      <h3>Способ оплаты</h3>
      <select
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
      >
        <option value="">Выбрать</option>
        {paymentMethods.map((method) => (
          <option key={method.id} value={method.id}>{method.name}</option>
        ))}
      </select>

      <button
        onClick={handleCreateOrder}
        disabled={!selectedPaymentMethod || !deliveryAddress || cartItems.length === 0}
      >
        Создать заказ
      </button>
    </div>
  );
};

export default CartPage;
