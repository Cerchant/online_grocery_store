import axios from 'axios';
import API_URL from './constants';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Интерцептор для добавления accessToken в заголовки запросов
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок и обновления токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, является ли ошибка 401 и запрос не был повторен ранее
    if (
      error.response?.status === 401 && 
      !originalRequest._retry // Убеждаемся, что это первый повторный запрос
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          console.warn('No refresh token available');
          throw new Error('Refresh token is missing. Please log in again.');
        }

        // Обновляем токен
        const { data } = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        // Сохраняем новый токен
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.access);

        // Добавляем новый токен в заголовки запроса
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        // Повторяем оригинальный запрос с новым токеном
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);

        // Если обновление токена завершилось неудачей, выходим из системы
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Вместо перенаправления показываем уведомление или оставляем на текущей странице
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Если это не ошибка 401, просто отклоняем запрос
    return Promise.reject(error);
  }
);

export default apiClient;
