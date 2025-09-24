import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { TokenService } from './tokenService';

/**
 * Configuración unificada de axios con interceptores de autenticación
 * Maneja diferentes URLs para servidor (SSR) y cliente (browser)
 */

// Función para obtener la URL base correcta según el entorno
const getApiBaseUrl = (): string => {
  // En el servidor (SSR), usar la URL interna del contenedor
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://backend:3001/api/v1';
  }
  
  // En el cliente (browser), usar localhost
  return 'http://localhost:3001/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - agregar token automáticamente
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenService.getToken();
    
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para debugging
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response - manejar errores de autenticación
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log para debugging
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: response?.status,
      data: response?.data,
      message: error.message
    });
    
    // Manejar errores de autenticación
    if (response?.status === 401) {
      console.warn('🔒 Token inválido o expirado, limpiando autenticación');
      
      // Limpiar autenticación
      TokenService.clearAuth();
      
      // Redirigir al login solo si estamos en el browser
      if (typeof window !== 'undefined') {
        // Evitar redirección infinita si ya estamos en login
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Función helper para hacer peticiones con manejo de errores mejorado
export const apiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config).then(response => response.data);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then(response => response.data);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then(response => response.data);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then(response => response.data);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then(response => response.data);
  }
};

export default apiClient;