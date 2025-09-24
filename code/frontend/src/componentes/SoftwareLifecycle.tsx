'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop' | 'api';
  methodology: 'agile' | 'waterfall' | 'kanban';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  budget: string;
  team: string[];
  currentPhase: number;
  createdAt: Date;
}

interface SoftwareLifecycleProps {
  project: Project;
  onPhaseSelect: (phase: number) => void;
}

const lifecyclePhases = [
  {
    id: 1,
    name: '📋 Planificación',
    description: 'Definición de requisitos, alcance y planificación del proyecto',
    status: 'active',
    color: 'blue',
    activities: [
      'Análisis de requisitos',
      'Planificación de sprints',
      'Definición de arquitectura',
      'Estimación de tiempos'
    ]
  },
  {
    id: 2,
    name: '🔍 Análisis',
    description: 'Análisis detallado de requisitos y modelado del sistema',
    status: 'pending',
    color: 'purple',
    activities: [
      'Diagramas UML',
      'Casos de uso',
      'Especificación técnica',
      'Análisis de riesgos'
    ]
  },
  {
    id: 3,
    name: '🎨 Diseño',
    description: 'Diseño de la interfaz de usuario y arquitectura del sistema',
    status: 'pending',
    color: 'pink',
    activities: [
      'Wireframes y mockups',
      'Sistema de diseño',
      'Prototipado',
      'Diseño de base de datos'
    ]
  },
  {
    id: 4,
    name: '💻 Codificación',
    description: 'Desarrollo e implementación del código fuente',
    status: 'pending',
    color: 'green',
    activities: [
      'Desarrollo frontend',
      'Desarrollo backend',
      'Integración de APIs',
      'Control de versiones'
    ]
  },
  {
    id: 5,
    name: '🧪 Pruebas',
    description: 'Testing exhaustivo del sistema desarrollado',
    status: 'pending',
    color: 'yellow',
    activities: [
      'Tests unitarios',
      'Tests de integración',
      'Tests E2E',
      'Tests de rendimiento'
    ]
  },
  {
    id: 6,
    name: '🚀 Despliegue',
    description: 'Deployment y puesta en producción del sistema',
    status: 'pending',
    color: 'indigo',
    activities: [
      'CI/CD Pipeline',
      'Deployment en producción',
      'Configuración de servidores',
      'Migración de datos'
    ]
  },
  {
    id: 7,
    name: '📊 Monitoreo',
    description: 'Monitoreo continuo y mantenimiento del sistema',
    status: 'pending',
    color: 'red',
    activities: [
      'Métricas de rendimiento',
      'Logs y alertas',
      'Mantenimiento',
      'Soporte técnico'
    ]
  }
];

export default function SoftwareLifecycle({ project, onPhaseSelect }: SoftwareLifecycleProps) {
  const router = useRouter();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const handlePhaseClick = (phaseId: number) => {
    setSelectedPhase(phaseId);
    onPhaseSelect(phaseId);

    // Solo la planificación está completamente implementada
    if (phaseId === 1) {
      router.push('/planificacion');
    }
  };

  const getPhaseStatus = (phaseId: number) => {
    if (phaseId === 1) return 'active'; // Planificación disponible
    if (phaseId <= project.currentPhase) return 'completed';
    if (phaseId === project.currentPhase + 1) return 'current';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-500 text-green-800';
      case 'current': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'active': return 'bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-200';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '🔄';
      case 'active': return '🎯';
      default: return '⏳';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header del Proyecto */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {project.name}
            </h1>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="font-medium">Tipo:</span>
                <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {project.type === 'web' ? '🌐 Web' :
                   project.type === 'mobile' ? '📱 Móvil' :
                   project.type === 'desktop' ? '🖥️ Desktop' : '🔌 API'}
                </span>
              </span>
              <span className="flex items-center">
                <span className="font-medium">Metodología:</span>
                <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {project.methodology === 'agile' ? '🔄 Ágil' :
                   project.methodology === 'kanban' ? '📋 Kanban' : '🌊 Cascada'}
                </span>
              </span>
              <span className="flex items-center">
                <span className="font-medium">Prioridad:</span>
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  project.priority === 'high' ? 'bg-red-100 text-red-800' :
                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {project.priority === 'high' ? '🔴 Alta' :
                   project.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                </span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              <p>Duración: {project.estimatedDuration}</p>
              {project.budget && <p>Presupuesto: {project.budget}</p>}
              <p>Equipo: {project.team.length} miembros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Título del Ciclo de Vida */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔄 Ciclo de Vida de Desarrollo de Software
        </h2>
        <p className="text-gray-600">
          Haz clic en cualquier fase para acceder a sus herramientas y funcionalidades
        </p>
      </div>

      {/* Fases del Ciclo de Vida */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {lifecyclePhases.map((phase, index) => {
          const status = phase.id === 1 ? 'active' : getPhaseStatus(phase.id);
          const isClickable = phase.id === 1; // Solo planificación es clickeable

          return (
            <div
              key={phase.id}
              onClick={() => isClickable && handlePhaseClick(phase.id)}
              className={`
                relative bg-white rounded-lg border-2 p-6 transition-all duration-200
                ${getStatusColor(status)}
                ${isClickable ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1' : 'cursor-not-allowed opacity-75'}
                ${selectedPhase === phase.id ? 'ring-4 ring-blue-300' : ''}
              `}
            >
              {/* Estado de la fase */}
              <div className="absolute top-2 right-2 text-2xl">
                {getStatusIcon(status)}
              </div>

              {/* Número de fase */}
              <div className="text-xs font-bold text-gray-500 mb-2">
                FASE {phase.id}
              </div>

              {/* Nombre de la fase */}
              <h3 className="text-lg font-bold mb-2">
                {phase.name}
              </h3>

              {/* Descripción */}
              <p className="text-sm text-gray-600 mb-4">
                {phase.description}
              </p>

              {/* Actividades */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 mb-2">Actividades:</p>
                {phase.activities.map((activity, idx) => (
                  <div key={idx} className="text-xs text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                    {activity}
                  </div>
                ))}
              </div>

              {/* Indicador de disponibilidad */}
              {phase.id === 1 && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✨ Disponible
                  </span>
                </div>
              )}

              {phase.id !== 1 && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    🔒 Próximamente
                  </span>
                </div>
              )}

              {/* Flecha de conexión (excepto la última fase) */}
              {index < lifecyclePhases.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📌 Estado Actual del Proyecto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded p-4">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Fase Actual</h4>
            <p className="text-blue-600 font-semibold">
              {lifecyclePhases[0].name} - Disponible
            </p>
          </div>
          <div className="bg-white rounded p-4">
            <h4 className="font-medium text-gray-900 mb-2">👥 Equipo</h4>
            <div className="flex flex-wrap gap-1">
              {project.team.slice(0, 3).map((member, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {member}
                </span>
              ))}
              {project.team.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  +{project.team.length - 3} más
                </span>
              )}
            </div>
          </div>
          <div className="bg-white rounded p-4">
            <h4 className="font-medium text-gray-900 mb-2">📅 Progreso</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(1 / lifecyclePhases.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              1 de {lifecyclePhases.length} fases disponibles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
