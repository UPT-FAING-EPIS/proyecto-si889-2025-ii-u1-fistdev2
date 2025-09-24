'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logger } from '@/utils/logger';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    logger.authInfo('Iniciando proceso de login', { email });

    try {
      logger.authDebug('Llamando función login del contexto');
      await login(email, password);
      logger.authInfo('Login exitoso, redirigiendo al dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      logger.authError('Error en login', { 
        email, 
        error: err?.message || err,
        errorType: typeof err,
        errorStack: err?.stack 
      }, err);
      
      // Determinar mensaje de error más específico
      let errorMessage = 'Credenciales inválidas. Por favor, intenta de nuevo.';
      
      if (err?.message) {
        if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Credenciales inválidas. Por favor, intenta de nuevo.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      logger.authDebug('Error message set', { errorMessage });
    } finally {
      setIsLoading(false);
      logger.authDebug('Login process completed');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-auto flex items-center justify-center">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
              DevFlow
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu cuenta DevFlow
          </p>
        </div>

        {/* Credenciales de Demostración */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-600 mt-3">
            💡 Solo el administrador tiene acceso completo al sistema y FastAPI
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Regístrate aquí
                </Link>
              </span>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            DevFlow System v1.0 - Sistema de Gestión de Proyectos
          </p>
        </div>
      </div>
    </div>
  );
}
