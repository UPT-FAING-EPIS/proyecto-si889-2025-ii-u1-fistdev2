'use client';

import React, { useState } from 'react';
import { Project } from '../modules/projects/project';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  project: Project | null;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (confirmText !== project?.name) return;

    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
      setConfirmText('');
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen || !project) return null;

  const isConfirmValid = confirmText === project.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-red-600 flex items-center">
            🗑️ Eliminar Proyecto
          </h2>
        </div>

        <div className="p-6">
          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ¡Acción Irreversible!
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Esta acción eliminará permanentemente el proyecto y todos sus datos asociados:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Todas las tareas y tableros</li>
                    <li>Historial de cambios</li>
                    <li>Archivos y documentos</li>
                    <li>Configuraciones del proyecto</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Información del proyecto */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Proyecto a eliminar:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium text-gray-900">{project.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium text-gray-900">
                  {project.tipo === 'web' ? '🌐 Web' :
                   project.tipo === 'mobile' ? '📱 Móvil' :
                   project.tipo === 'desktop' ? '🖥️ Desktop' : 
                   project.tipo === 'fullstack' ? '⚡ Full Stack' : '🔌 API'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium text-gray-900">
                  {project.estado === 'activo' ? '▶️ Activo' :
                   project.estado === 'completado' ? '✅ Completado' :
                   project.estado === 'pausado' ? '⏸️ Pausado' :
                   project.estado === 'cancelado' ? '❌ Cancelado' : '📋 Planificación'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Progreso:</span>
                <span className="font-medium text-gray-900">{project.progreso}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Miembros:</span>
                <span className="font-medium text-gray-900">{project.equipo.length} personas</span>
              </div>
            </div>
          </div>

          {/* Confirmación por texto */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escribe el nombre del proyecto:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={project.name}
              autoComplete="off"
            />
            {confirmText && !isConfirmValid && (
              <p className="mt-1 text-sm text-red-600">
                El nombre no coincide
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmValid || isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar Proyecto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;