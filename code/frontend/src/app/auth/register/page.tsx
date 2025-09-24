'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/modules/auth/axiosConfig'
import { logger } from '@/utils/logger'

interface RegisterForm {
  email: string
  username: string
  name: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    logger.authInfo('Iniciando proceso de registro', { 
      email: form.email, 
      username: form.username, 
      name: form.name 
    });

    // Validar que las contraseñas coincidan
    if (form.password !== form.confirmPassword) {
      const errorMsg = '❌ Las contraseñas no coinciden';
      setMessage(errorMsg);
      logger.authWarn('Validación fallida: contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      logger.authDebug('Enviando petición de registro al backend');
      
      const response = await apiRequest.post('/auth/register', {
        email: form.email,
        username: form.username,
        name: form.name,
        password: form.password
      });

      logger.authDebug('Respuesta del backend recibida', { 
        success: response?.success,
        hasMessage: !!response?.message 
      });

      if (response.success) {
        const successMsg = '✅ Registro exitoso! Redirigiendo al login...';
        setMessage(successMsg);
        logger.authInfo('Registro exitoso, redirigiendo al login');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        const errorMsg = `❌ Error: ${response.message || 'Error en el registro'}`;
        setMessage(errorMsg);
        logger.authError('Error en registro - respuesta no exitosa', { 
          response: response,
          message: response?.message 
        });
      }
    } catch (error: any) {
      logger.authError('Error en registro - excepción capturada', { 
        error: error?.message || error,
        errorType: typeof error,
        errorStack: error?.stack,
        formData: {
          email: form.email,
          username: form.username,
          name: form.name
        }
      }, error);
      
      // Determinar mensaje de error más específico
      let errorMessage = '❌ Error de conexión. Verifica que el backend esté funcionando.';
      
      if (error?.message) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = '❌ Error de conexión. Verifica que el servidor esté funcionando.';
        } else if (error.message.includes('400')) {
          errorMessage = '❌ Datos inválidos. Verifica la información ingresada.';
        } else if (error.message.includes('409') || error.message.includes('conflict')) {
          errorMessage = '❌ El usuario ya existe. Intenta con otro email o nombre de usuario.';
        } else {
          errorMessage = `❌ ${error.message}`;
        }
      }
      
      setMessage(errorMessage);
      logger.authDebug('Error message set', { errorMessage });
    } finally {
      setLoading(false);
      logger.authDebug('Registro process completed');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Crear Cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Regístrate en DevFlow System
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tu nombre completo"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="nombre_usuario"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Inicia sesión aquí
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              <Link href="/dashboard" className="font-medium text-blue-600 hover:text-blue-500">
                ← Volver al Dashboard
              </Link>
            </p>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800">ℹ️ Información:</h3>
          <p className="text-xs text-blue-700 mt-1">
            Este es un sistema de desarrollo. Los datos se almacenan en modo simulado.
          </p>
        </div>
      </div>
    </div>
  )
}
