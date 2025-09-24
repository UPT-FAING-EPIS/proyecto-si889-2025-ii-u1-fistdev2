import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header con login */}
      <header className="absolute top-0 right-0 p-6">
        <Link 
          href="/auth/login" 
          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
        >
          🔐 Iniciar Sesión
        </Link>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 pt-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Dev<span className="text-blue-600">Flow</span> System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema integral self-hosted para soportar el ciclo completo de desarrollo 
            de aplicaciones web, desde la planificación hasta el monitoreo.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Plataforma colaborativa para equipos de desarrollo con gestión de proyectos, 
            herramientas integradas y métricas en tiempo real.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-semibold text-gray-800">🎯 Planificación</h3>
            <p className="text-sm text-gray-600">Gestión de proyectos</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-semibold text-gray-800">📊 Análisis</h3>
            <p className="text-sm text-gray-600">Diagramas UML</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-semibold text-gray-800">🎨 Diseño</h3>
            <p className="text-sm text-gray-600">Tokens y wireframes</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-semibold text-gray-800">💻 Codificación</h3>
            <p className="text-sm text-gray-600">IDE integrado</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-semibold text-gray-800">🧪 Pruebas</h3>
            <p className="text-sm text-gray-600">Tests automatizados</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-semibold text-gray-800">🚀 Despliegue</h3>
            <p className="text-sm text-gray-600">Pipeline CI/CD</p>
          </div>
        </div>
        <div className="mt-8">
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Ver Documentación API
          </a>
        </div>
      </div>
    </div>
  )
}
