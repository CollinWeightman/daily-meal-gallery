import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
});

// Request interceptor — 帶 Bearer token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — 已登入狀態下的 401(工作階段過期)才自動登出並導向 /login
// 登入請求本身的 401 代表帳密錯誤,交給 LoginPage 顯示錯誤訊息
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith('/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;