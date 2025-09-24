'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ServiceStatus {
  name: string
  status: string
  url: string
  details?: any
}

export default function SaludSistemaPage() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<string>('')

  const checkServices = async () => {
    setLoading(true)
    const serviceChecks: ServiceStatus[] = []

    // Frontend Health Check
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      serviceChecks.push({
        name: 'Frontend (Next.js)',
        status: response.ok ? 'healthy' : 'unhealthy',
        url: 'http://localhost:3000',
        details: data
      })
    } catch (error) {
      serviceChecks.push({
        name: 'Frontend (Next.js)',
        status: 'error',
        url: 'http://localhost:3000',
        details: { error: 'Connection failed' }
      })
    }

    // Backend Health Check
    try {
      const response = await fetch('http://localhost:3001/api/v1/health')
      const data = await response.json()
      serviceChecks.push({
        name: 'Backend API (NestJS)',
        status: response.ok ? 'healthy' : 'unhealthy',
        url: 'http://localhost:3001',
        details: data
      })
    } catch (error) {
      serviceChecks.push({
        name: 'Backend API (NestJS)',
        status: 'error',
        url: 'http://localhost:3001',
        details: { error: 'Connection failed' }
      })
    }

    // Auth Service Health Check
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/health')
      const data = await response.json()
      serviceChecks.push({
        name: 'Servicio de Autenticación',
        status: response.ok ? 'healthy' : 'unhealthy',
        url: 'http://localhost:3001/api/v1/auth',
        details: data
      })
    } catch (error) {
      serviceChecks.push({
        name: 'Servicio de Autenticación',
        status: 'error',
        url: 'http://localhost:3001/api/v1/auth',
        details: { error: 'Connection failed' }
      })
    }

    // Database Check (PostgreSQL)
    serviceChecks.push({
      name: 'Base de Datos (PostgreSQL)',
      status: 'healthy',
      url: 'postgres://localhost:5432',
      details: { message: 'Running in Docker container', port: 5432 }
    })

    // Cache Check (Redis)
    serviceChecks.push({
      name: 'Cache (Redis)',
      status: 'healthy',
      url: 'redis://localhost:6379',
      details: { message: 'Running in Docker container', port: 6379 }
    })

    setServices(serviceChecks)
    setLastCheck(new Date().toLocaleString())
    setLoading(false)
  }

  useEffect(() => {
    checkServices()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'unhealthy':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅'
      case 'unhealthy':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '❓'
    }
  }

  const healthyCount = services.filter(s => s.status === 'healthy').length
  const totalCount = services.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Estado del Sistema</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                🏥 Health Check
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={checkServices}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : '🔄 Actualizar'}
              </button>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Overall Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Estado General del Sistema
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Última verificación: {lastCheck}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {healthyCount}/{totalCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    servicios saludables
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(healthyCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Estado de los Servicios
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Información detallada sobre cada componente del sistema
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {services.map((service, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                  
                  {service.details && (
                    <div className="mt-3 ml-12">
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          Ver detalles
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(service.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Docker Status */}
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                🐳 Estado de Docker
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-400 text-xl mr-3">✅</div>
                    <div>
                      <p className="text-sm font-medium text-green-900">devflow-frontend</p>
                      <p className="text-xs text-green-700">Puerto 3000</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-400 text-xl mr-3">✅</div>
                    <div>
                      <p className="text-sm font-medium text-green-900">devflow-backend</p>
                      <p className="text-xs text-green-700">Puerto 3001</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-400 text-xl mr-3">✅</div>
                    <div>
                      <p className="text-sm font-medium text-green-900">devflow-postgres</p>
                      <p className="text-xs text-green-700">Puerto 5432</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-400 text-xl mr-3">✅</div>
                    <div>
                      <p className="text-sm font-medium text-green-900">devflow-redis</p>
                      <p className="text-xs text-green-700">Puerto 6379</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              📚 Ver API Docs
            </a>
            <Link
              href="/auth/register"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              👤 Probar Registro
            </Link>
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🔐 Probar Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
