'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProjectFormData {
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack';
  methodology: 'agile' | 'waterfall' | 'kanban';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  budget: string;
  client: string;
  technologies: string[];
  repository: string;
  notes: string;
  team: string[];
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: ProjectFormData) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: 'web',
    methodology: 'agile',
    priority: 'medium',
    estimatedDuration: '',
    budget: '',
    client: '',
    technologies: [],
    repository: '',
    notes: '',
    team: []
  });

  const [newTeamMember, setNewTeamMember] = useState('');
  const [newTechnology, setNewTechnology] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      name: '',
      description: '',
      type: 'web',
      methodology: 'agile',
      priority: 'medium',
      estimatedDuration: '',
      budget: '',
      client: '',
      technologies: [],
      repository: '',
      notes: '',
      team: []
    });
    setNewTeamMember('');
    setNewTechnology('');
  };

  const addTeamMember = () => {
    if (newTeamMember.trim() && !formData.team.includes(newTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, newTeamMember.trim()]
      }));
      setNewTeamMember('');
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(m => m !== member)
    }));
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl leading-6 font-bold text-gray-900">
                🚀 Crear Nuevo Proyecto
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Ej: Sistema de Gestión de Inventario"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    📄 Descripción del Proyecto *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Describe el objetivo y alcance del proyecto..."
                  />
                </div>

                {/* Tipo y Metodología */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      💻 Tipo de Proyecto
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProjectFormData['type'] }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="web">🌐 Aplicación Web</option>
                      <option value="mobile">📱 Aplicación Móvil</option>
                      <option value="desktop">🖥️ Aplicación Escritorio</option>
                      <option value="api">🔌 API/Backend</option>
                      <option value="fullstack">🔄 Fullstack</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-2">
                      ⚡ Metodología
                    </label>
                    <select
                      id="methodology"
                      value={formData.methodology}
                      onChange={(e) => setFormData(prev => ({ ...prev, methodology: e.target.value as ProjectFormData['methodology'] }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="agile">🔄 Ágil (Scrum)</option>
                      <option value="kanban">📋 Kanban</option>
                      <option value="waterfall">🌊 Cascada</option>
                    </select>
                  </div>
                </div>

                {/* Prioridad y Duración */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 Prioridad
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as ProjectFormData['priority'] }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="low">🟢 Baja</option>
                      <option value="medium">🟡 Media</option>
                      <option value="high">🔴 Alta</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                      ⏱️ Duración Estimada
                    </label>
                    <input
                      type="text"
                      id="estimatedDuration"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="Ej: 3 meses, 12 semanas"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Presupuesto (Opcional)
                  </label>
                  <input
                    type="text"
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Ej: $50,000, €30,000"
                  />
                </div>

                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                    🏢 Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Nombre del cliente o empresa"
                  />
                </div>

                {/* Tecnologías */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    🛠️ Tecnologías
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Agrega las tecnologías que se utilizarán en el proyecto.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        placeholder="Ej: React, Node.js, PostgreSQL"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTechnology}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                    >
                      + Agregar
                    </button>
                  </div>
                  
                  {formData.technologies.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Tecnologías seleccionadas ({formData.technologies.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechnology(tech)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="repository" className="block text-sm font-medium text-gray-700 mb-2">
                    📁 Repositorio (Opcional)
                  </label>
                  <input
                    type="url"
                    id="repository"
                    value={formData.repository}
                    onChange={(e) => setFormData(prev => ({ ...prev, repository: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="https://github.com/usuario/proyecto"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Notas, comentarios o información adicional..."
                  />
                </div>

                {/* Equipo y Colaboradores */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    👥 Equipo del Proyecto
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Agrega colaboradores por email para invitarlos automáticamente cuando se cree el proyecto.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <div className="md:col-span-3">
                      <input
                        type="email"
                        value={newTeamMember}
                        onChange={(e) => setNewTeamMember(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        placeholder="email@ejemplo.com"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                    >
                      + Agregar
                    </button>
                  </div>
                  
                  {formData.team.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Colaboradores invitados ({formData.team.length}):
                      </p>
                      <div className="space-y-2">
                        {formData.team.map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {member.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-gray-900">{member}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTeamMember(member)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formData.team.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No hay colaboradores agregados. Puedes agregar colaboradores ahora o usar el botón &quot;Compartir&quot; después de crear el proyecto.
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  🚀 Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
