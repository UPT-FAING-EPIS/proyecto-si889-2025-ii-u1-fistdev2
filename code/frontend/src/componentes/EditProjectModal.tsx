'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '../modules/projects/project';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  project: Project | null;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project
}) => {
  const [formData, setFormData] = useState({
    name: '',
    descripcion: '',
    tipo: 'web' as 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack',
    estado: 'planificacion' as 'planificacion' | 'activo' | 'pausado' | 'completado' | 'cancelado',
    prioridad: 'media' as 'baja' | 'media' | 'alta' | 'critica',
    presupuesto: 0,
    cliente: '',
    tecnologias: [] as string[],
    repositorio: '',
    notas: ''
  });

  const [tecnologiaInput, setTecnologiaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        descripcion: project.descripcion || '',
        tipo: project.tipo || 'web',
        estado: project.estado || 'planificacion',
        prioridad: project.prioridad || 'media',
        presupuesto: project.presupuesto || 0,
        cliente: project.cliente || '',
        tecnologias: project.tecnologias || [],
        repositorio: project.repositorio || '',
        notas: project.notas || ''
      });
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'presupuesto' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddTecnologia = () => {
    if (tecnologiaInput.trim() && !formData.tecnologias.includes(tecnologiaInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tecnologias: [...prev.tecnologias, tecnologiaInput.trim()]
      }));
      setTecnologiaInput('');
    }
  };

  const handleRemoveTecnologia = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tecnologias: prev.tecnologias.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            ✏️ Editar Proyecto
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre del proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Sistema de Gestión de Inventario"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe brevemente el proyecto..."
            />
          </div>

          {/* Tipo y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Proyecto
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="web">🌐 Aplicación Web</option>
                <option value="mobile">📱 Aplicación Móvil</option>
                <option value="desktop">🖥️ Aplicación Desktop</option>
                <option value="api">🔌 API/Backend</option>
                <option value="fullstack">⚡ Full Stack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planificacion">📋 Planificación</option>
                <option value="activo">▶️ Activo</option>
                <option value="pausado">⏸️ Pausado</option>
                <option value="completado">✅ Completado</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>
          </div>

          {/* Prioridad y Presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
                <option value="critica">🟣 Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presupuesto (USD)
              </label>
              <input
                type="number"
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del cliente o empresa"
            />
          </div>

          {/* Tecnologías */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tecnologías
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tecnologiaInput}
                onChange={(e) => setTecnologiaInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTecnologia())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: React, Node.js, PostgreSQL"
              />
              <button
                type="button"
                onClick={handleAddTecnologia}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tecnologias.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTecnologia(tech)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Repositorio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repositorio
            </label>
            <input
              type="url"
              name="repositorio"
              value={formData.repositorio}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/usuario/proyecto"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas, comentarios o información adicional..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;