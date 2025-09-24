'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { TokenService } from '../modules/auth/tokenService'
import { apiRequest } from '../modules/auth/axiosConfig'

interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: string
  avatar?: string
  preferences?: {
    theme: string
    language: string
    notifications: boolean
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 Iniciando login...');
      
      const response = await apiRequest.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = response;
      
      // Guardar token y usuario usando TokenService
      TokenService.setToken(newToken);
      TokenService.setUser(userData);
      
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ Login exitoso');
      
    } catch (error) {
      console.error('❌ Error durante login:', error);
      throw new Error('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar autenticación usando TokenService
    TokenService.clearAuth();
    
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const currentToken = TokenService.getToken();
      if (!currentToken) throw new Error('No token available');
      
      const response = await apiRequest.post('/auth/refresh', { token: currentToken });
      const { token: newToken, user: userData } = response;
      
      // Actualizar token y usuario usando TokenService
      TokenService.setToken(newToken);
      TokenService.setUser(userData);
      
      setToken(newToken);
      setUser(userData);
      
      console.log('🔄 Token renovado exitosamente');
      
    } catch (error) {
      console.error('❌ Error renovando token:', error);
      logout();
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Verificando autenticación...');
        
        const savedToken = TokenService.getToken();
        const savedUser = TokenService.getUser();
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          
          // Verificar si el token sigue siendo válido
          try {
            await apiRequest.get('/auth/verify');
            console.log('✅ Token válido');
          } catch (error) {
            console.warn('⚠️ Token inválido, limpiando autenticación');
            // Token inválido, limpiar datos
            TokenService.clearAuth();
            setToken(null);
            setUser(null);
          }
        } else {
          console.log('ℹ️ No hay sesión guardada');
        }
      } catch (error) {
        console.error('❌ Error inicializando autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auto-refresh del token
  useEffect(() => {
    if (token) {
      // Configurar refresh automático cada 50 minutos (asumiendo token expira en 1 hora)
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 50 * 60 * 1000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook para rutas protegidas
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};
