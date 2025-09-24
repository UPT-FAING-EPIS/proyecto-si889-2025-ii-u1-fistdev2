'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectStorage } from '../projects/projectStorage'
import { TokenService } from './tokenService'
import { apiRequest } from './axiosConfig'
import { logger } from '@/utils/logger'

interface User {
  id: string
  email: string
  username: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, name: string, password: string) => Promise<boolean>
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar token al cargar (solo si es válido)
  useEffect(() => {
    const checkAuthToken = async () => {
      // Limpiar datos globales corruptos al inicializar la aplicación
      ProjectStorage.clearGlobalProjects()
      
      const token = TokenService.getToken()
      if (token && !TokenService.isTokenExpired()) {
        try {
          // Verificar que el token siga siendo válido con el backend
          const userData = await apiRequest.get('/auth/profile')
          
          if (userData) {
            const user: User = {
              id: userData.id,
              email: userData.email,
              username: userData.username,
              name: userData.name,
              role: userData.role || (userData.email === 'admin@devflow.com' ? 'admin' : 'user'),
              avatar: userData.avatar || '👤'
            }
            
            TokenService.setUser(user)
            setUser(user)
          }
        } catch (error) {
          console.error('❌ Error verificando token:', error)
          // Token inválido, limpiar
          TokenService.clearAuth()
        }
      } else {
        // Token expirado o no existe, limpiar
        TokenService.clearAuth()
      }
      setIsLoading(false)
    }
    
    checkAuthToken()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      logger.authInfo('Iniciando proceso de login desde AuthContext', { email });
      
      const data = await apiRequest.post('/auth/login', { 
        identifier: email, 
        password 
      })
      
      logger.authDebug('Respuesta de login recibida', { 
        hasData: !!data,
        hasAccessToken: !!(data?.accessToken),
        hasUser: !!(data?.user)
      });
      
      if (data && data.accessToken) {
        // Guardar token usando el servicio unificado
        TokenService.setToken(data.accessToken)
        
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          name: data.user.name,
          role: data.user.role || (data.user.email === 'admin@devflow.com' ? 'admin' : 'user'),
          avatar: data.user.avatar || '👤'
        }
        
        TokenService.setUser(userData)
        setUser(userData)
        
        logger.authInfo('Login exitoso en AuthContext', { 
          userId: userData.id,
          email: userData.email,
          role: userData.role 
        });
        return true
      } else {
        logger.authWarn('Login fallido - datos incompletos', { 
          hasData: !!data,
          hasAccessToken: !!(data?.accessToken),
          hasUser: !!(data?.user)
        });
        return false
      }
    } catch (error: any) {
      logger.authError('Error en login desde AuthContext', { 
        error: error?.message || error,
        errorType: typeof error,
        email: email
      }, error);
      return false
    } finally {
      setIsLoading(false)
      logger.authDebug('Login process completed en AuthContext');
    }
  }

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const data = await apiRequest.post('/auth/register', { 
        email, 
        name, 
        password 
      })

      if (data) {
        console.log('✅ Registro exitoso, iniciando sesión automáticamente')
        // Después del registro exitoso, hacer login automático
        return await login(email, password)
      }
      return false
    } catch (error) {
      console.error('❌ Error en registro:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('🚪 Cerrando sesión...')
    
    // Limpiar toda la autenticación usando el servicio unificado
    TokenService.clearAuth()
    setUser(null)
    
    // Redirigir al login
    router.push('/auth/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
