/**
 * Servicio unificado para el manejo de tokens JWT
 * Centraliza el almacenamiento y recuperación de tokens
 */

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'user-data';

export class TokenService {
  /**
   * Obtiene el token de autenticación
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Prioridad: localStorage > cookies
    let token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      // Fallback a cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${TOKEN_KEY}=`)
      );
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }
    
    return token;
  }

  /**
   * Guarda el token de autenticación
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Guardar en localStorage
    localStorage.setItem(TOKEN_KEY, token);
    
    // También guardar en cookies para compatibilidad
    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 horas
    
    document.cookie = `${TOKEN_KEY}=${token}; path=/; expires=${expires.toUTCString()}; secure=false; samesite=lax`;
  }

  /**
   * Elimina el token de autenticación
   */
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    
    // Limpiar cookies
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  /**
   * Obtiene los datos del usuario
   */
  static getUser(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Guarda los datos del usuario
   */
  static setUser(user: any): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Elimina los datos del usuario
   */
  static removeUser(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Limpia toda la información de autenticación
   */
  static clearAuth(): void {
    this.removeToken();
    this.removeUser();
    
    // Limpiar otros tokens que puedan existir (legacy)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('devflow_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Obtiene los headers de autorización para las peticiones
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    
    if (!token) {
      return {
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Verifica si el token está expirado (básico)
   */
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      // Decodificar el payload del JWT (sin verificar la firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}