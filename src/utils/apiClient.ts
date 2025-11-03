import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCurrentEnvironment } from '../config/environment';

export const apiClient = axios.create({
    baseURL: getCurrentEnvironment().apiUrl,
    timeout: 60000, // Increased to 60 seconds for video uploads
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method?.toUpperCase(), config.url, token ? 'with token' : 'no token');
        return config;
    },
    (error: AxiosError) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error: AxiosError) => {
        console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
        if (error.response?.status === 401) {
            console.log('401 Error: Clearing auth data');
            // Clear auth data - let react-admin handle the redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('otpData');
            // Don't redirect here - let react-admin's authProvider handle it
        }
        return Promise.reject(error);
    }
);
