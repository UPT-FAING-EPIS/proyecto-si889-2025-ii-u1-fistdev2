import React from 'react';
import { Project } from '@/modules/projects/project';
import { 
  UserIcon, 
  ShareIcon, 
  UsersIcon, 
  ClockIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

interface SharedProjectsProps {
  sharedProjects: Project[];
  onSelectProject: (project: Project) => void;
  onShareProject: (project: Project) => void;
}

const SharedProjects: React.FC<SharedProjectsProps> = ({
  sharedProjects,
  onSelectProject,
  onShareProject
}) => {
  if (sharedProjects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <UsersIcon className="mx-auto mb-2 h-8 w-8" />
        <p>No tienes proyectos compartidos</p>
        <p className="text-sm mt-1">Los proyectos donde eres miembro aparecerán aquí</p>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'text-red-600 bg-red-100';
      case 'media':
        return 'text-yellow-600 bg-yellow-100';
      case 'baja':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planificacion':
        return 'text-blue-600 bg-blue-100';
      case 'desarrollo':
        return 'text-purple-600 bg-purple-100';
      case 'testing':
        return 'text-orange-600 bg-orange-100';
      case 'completado':
        return 'text-green-600 bg-green-100';
      case 'pausado':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <UsersIcon className="mr-2 h-5 w-5" />
          Proyectos Compartidos ({sharedProjects.length})
        </h3>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sharedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectProject(project)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 truncate flex-1">
                  {project.name}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareProject(project);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Gestionar colaboración"
                >
                  <CogIcon className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {project.descripcion || 'Sin descripción'}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.prioridad || 'media')}`}>
                  {project.prioridad || 'Media'}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.estado)}`}>
                  {project.estado}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  {formatDate(project.fechaActualizacion)}
                </div>
                <div className="flex items-center">
                  <UserIcon className="mr-1 h-3 w-3" />
                  Miembro
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progreso</span>
                  <span>{project.progreso || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progreso || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedProjects;
