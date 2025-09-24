'use client';

import { useAuth } from '@/modules/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateProjectModal from '../../componentes/CreateProjectModal';
import EditProjectModal from '../../componentes/EditProjectModal';
import DeleteProjectModal from '../../componentes/DeleteProjectModal';
import SharedProjects from '../../componentes/SharedProjects';
import { ShareProjectModal } from '../../componentes/ShareProjectModal';
import { PendingInvitations } from '../../componentes/PendingInvitations';
import { NotificationCenter } from '../../componentes/NotificationCenter';
import ProfileSettings from '../../componentes/ProfileSettings';
import { LoadingSpinner } from '../../componentes/LoadingComponents';
import SoftwareLifecycle from '../../componentes/SoftwareLifecycle';
import { LoadingOverlay } from '../../componentes/LoadingComponents';
import { ProjectStorage } from '@/modules/projects/projectStorage';
import { projectApiService, CreateProjectRequest } from '@/modules/projects/projectApi';
import { Project } from '@/modules/projects/project';
import { CollaborationProvider } from '@/contexts/CollaborationContext';
import { ShareIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function DashboardPageContent() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<'dashboard' | 'project'>('dashboard');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [projectToShare, setProjectToShare] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadProjects();
    }
  }, [user, isLoading, router]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      // Intentar cargar desde API primero
      const apiProjects = await projectApiService.getProjects();
      setProjects(apiProjects);
      console.log(`Cargados ${apiProjects.length} proyectos desde la API`);
      
      // Cargar proyectos compartidos
      await loadSharedProjects();
    } catch (apiError) {
      console.warn('Error cargando desde API, usando localStorage como fallback:', apiError);
      // Fallback a localStorage si falla la API
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const localProjects = ProjectStorage.loadProjects(user?.id);
        setProjects(localProjects);
        console.log(`Cargados ${localProjects.length} proyectos desde localStorage para usuario: ${user?.id}`);
      } catch (localError) {
        console.error('Error cargando proyectos:', localError);
        setProjects([]);
      }
      // Intentar cargar proyectos compartidos incluso con fallback
      await loadSharedProjects();
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadSharedProjects = async () => {
    try {
      const { TokenService } = await import('../../modules/auth/tokenService');
      const { apiRequest } = await import('../../modules/auth/axiosConfig');
      
      const response = await apiRequest.get('/membership/my-projects');
      const shared = response.success ? response.data : [];
      setSharedProjects(shared);
      console.log(`Cargados ${shared.length} proyectos compartidos`);
    } catch (error) {
      console.warn('Error cargando proyectos compartidos:', error);
      setSharedProjects([]);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    setIsCreatingProject(true);
    try {
      const createProjectData: CreateProjectRequest = {
        name: projectData.name,
        descripcion: projectData.description,
        tipo: projectData.type,
        prioridad: projectData.priority,
        presupuesto: parseFloat(projectData.budget) || 0,
        cliente: projectData.client || '',
        tecnologias: projectData.technologies || [],
        equipo: projectData.team || [],
        repositorio: projectData.repository || '',
        notas: projectData.notes || ''
      };

      // Intentar crear en la API primero
      try {
        const newProject = await projectApiService.createProject(createProjectData);
        
        // Actualizar estado local
        setProjects(prev => [...prev, newProject]);
        setSelectedProject(newProject);
        setView('project');
        
        console.log('Proyecto creado exitosamente en la API');
      } catch (apiError) {
        console.warn('Error creando en API, usando localStorage como fallback:', apiError);
        
        // Fallback: crear proyecto localmente
        const newProject: Project = {
          id: `project-${Date.now()}`,
          name: createProjectData.name,
          descripcion: createProjectData.descripcion || '',
          tipo: createProjectData.tipo as 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack',
          estado: 'planificacion',
          prioridad: createProjectData.prioridad || 'media',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          progreso: 0,
          presupuesto: createProjectData.presupuesto || 0,
          cliente: createProjectData.cliente || '',
          tecnologias: createProjectData.tecnologias || [],
          equipo: (createProjectData.equipo || []).map((name, index) => ({
            id: `member-${index}`,
            name: name,
            email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
            rol: 'developer' as const
          })),
          tareas: [],
          fases: [],
          repositorio: createProjectData.repositorio || '',
          notas: createProjectData.notas || '',
          userId: user?.id || 'local-user'
        };

        // Guardar en localStorage como fallback con userId
        ProjectStorage.addProject(newProject, user?.id);
        
        // Actualizar estado local
        setProjects(prev => [...prev, newProject]);
        setSelectedProject(newProject);
        setView('project');
      }
    } catch (error) {
      console.error('Error creando proyecto:', error);
      alert('Error al crear el proyecto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView('project');
  };

  const handlePhaseSelect = (phaseId: number) => {
    console.log(`Seleccionada fase ${phaseId}`);
    // Solo la planificación está implementada
    if (phaseId === 1) {
      router.push('/planificacion');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleShareProject = (project: Project) => {
    setProjectToShare(project);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setProjectToShare(null);
    // Recargar proyectos para reflejar cambios
    loadSharedProjects();
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setProjectToEdit(null);
    // Recargar proyectos para reflejar cambios
    loadProjects();
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
    // Recargar proyectos para reflejar cambios
    loadProjects();
  };

  const handleSaveEditProject = async (projectData: Partial<Project>) => {
    if (!projectToEdit) return;

    try {
      setIsLoadingProjects(true);
      
      // Intentar actualizar en el backend primero
      if (user?.id) {
        // Transformar los datos para que sean compatibles con CreateProjectRequest
        const updateData: Partial<CreateProjectRequest> = {
          name: projectData.name,
          descripcion: projectData.descripcion,
          tipo: projectData.tipo,
          prioridad: projectData.prioridad,
          presupuesto: projectData.presupuesto,
          cliente: projectData.cliente,
          tecnologias: projectData.tecnologias,
          equipo: projectData.equipo?.map(member => member.name) || [], // Convertir ProjectMember[] a string[]
          repositorio: projectData.repositorio,
          notas: projectData.notas
        };
        
        await projectApiService.updateProject(projectToEdit.id, updateData);
      } else {
        // Fallback a localStorage si no hay usuario autenticado
        const updatedProject = { ...projectToEdit, ...projectData, fechaActualizacion: new Date() };
        ProjectStorage.updateProject(updatedProject);
      }
      
      // Recargar proyectos
      await loadProjects();
      
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      // En caso de error, intentar actualizar en localStorage como fallback
      try {
        const updatedProject = { ...projectToEdit, ...projectData, fechaActualizacion: new Date() };
        ProjectStorage.updateProject(updatedProject);
        await loadProjects();
      } catch (localError) {
        console.error('Error al actualizar proyecto en localStorage:', localError);
        alert('Error al actualizar el proyecto. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setIsLoadingProjects(true);
      
      // Intentar eliminar en el backend primero
      if (user?.id) {
        await projectApiService.deleteProject(projectToDelete.id);
      } else {
        // Fallback a localStorage si no hay usuario autenticado
        ProjectStorage.deleteProject(projectToDelete.id, user?.id);
      }
      
      // Recargar proyectos
      await loadProjects();
      
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      // En caso de error, intentar eliminar en localStorage como fallback
      try {
        ProjectStorage.deleteProject(projectToDelete.id, user?.id);
        await loadProjects();
      } catch (localError) {
        console.error('Error al eliminar proyecto en localStorage:', localError);
        alert('Error al eliminar el proyecto. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoadingProjects(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingOverlay 
        isVisible={true} 
        text="Cargando DevFlow..."
        subtext="Inicializando el sistema de gestión de proyectos"
      />
    );
  }

  if (!user) {
    return null;
  }

  if (view === 'project' && selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header simplificado para vista de proyecto */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setView('dashboard')}
                  className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
                >
                  ← Volver al Dashboard
                </button>
                <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-lg">
                  DevFlow
                </div>
                <span className="ml-4 text-gray-600">/ {selectedProject.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowProfileSettings(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ⚙️ Perfil
                </button>
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido del ciclo de vida */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
                <p className="text-gray-600 mt-1">{selectedProject.descripcion}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedProject.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                  selectedProject.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                  selectedProject.prioridad === 'critica' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedProject.prioridad === 'alta' ? '🔴 Alta' :
                   selectedProject.prioridad === 'media' ? '🟡 Media' : 
                   selectedProject.prioridad === 'critica' ? '🟣 Crítica' : '🟢 Baja'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedProject.estado === 'activo' ? 'bg-green-100 text-green-800' :
                  selectedProject.estado === 'completado' ? 'bg-blue-100 text-blue-800' :
                  selectedProject.estado === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedProject.estado}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">
                  {selectedProject.tipo === 'web' ? '🌐 Web' :
                   selectedProject.tipo === 'mobile' ? '📱 Móvil' :
                   selectedProject.tipo === 'desktop' ? '🖥️ Desktop' : 
                   selectedProject.tipo === 'fullstack' ? '⚡ Full Stack' : '🔌 API'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Progreso:</span>
                <p className="font-medium">{selectedProject.progreso}%</p>
              </div>
              <div>
                <span className="text-gray-500">Equipo:</span>
                <p className="font-medium">{selectedProject.equipo.length} miembros</p>
              </div>
              <div>
                <span className="text-gray-500">Creado:</span>
                <p className="font-medium">{selectedProject.fechaCreacion.toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Herramientas específicas del proyecto */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Planificación del Proyecto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                � Planificación
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Proyecto
                </span>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Accede al sistema Kanban y gestión de tareas específicas de este proyecto.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/planificacion?projectId=${selectedProject.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  📋 Planificación
                </button>
              </div>
            </div>

            {/* Ciclo de Vida del Proyecto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">🔄 Ciclo de Vida</h3>
              <p className="text-gray-600 text-sm mb-4">
                Visualiza las fases del desarrollo de software para este proyecto.
              </p>
              <button
                onClick={() => handlePhaseSelect(1)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                🔄 Ver Fases
              </button>
            </div>

            {/* Configuración del Proyecto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">⚙️ Configuración</h3>
              <p className="text-gray-600 text-sm mb-4">
                Edita los detalles, equipo y configuración específica del proyecto.
              </p>
              <button
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                disabled
              >
                🔧 Próximamente
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-lg">
                DevFlow
              </div>
              <nav className="ml-10 flex space-x-8">
                {/* Solo mostrar Sistema si es admin */}
                {user.role === 'admin' && (
                  <a href="/sistema/salud" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    🏥 Sistema
                  </a>
                )}
                {/* Para usuarios comunes, solo mostrar Dashboard como navegación */}
                {user.role !== 'admin' && (
                  <span className="text-gray-500 px-3 py-2 text-sm font-medium">
                    📊 Dashboard
                  </span>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {/* Centro de Notificaciones */}
              <NotificationCenter />
              
              <button
                onClick={() => setShowProfileSettings(true)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
                title="Configuración de perfil"
              >
                ⚙️
              </button>
              <div className="text-sm">
                <span className="text-gray-700">Bienvenido, </span>
                <span className="font-medium text-gray-900">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    👑 Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* VISTA DIFERENCIADA POR ROLES */}
          {user.role === 'admin' ? (
            /* ====== VISTA DE ADMINISTRADOR ====== */
            <>
              {/* Hero Section - Panel de Administración */}
              <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-lg shadow-xl p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      👑 Panel de Administración - DevFlow
                    </h1>
                    <p className="text-red-100 text-lg">
                      Monitorea y administra todo el sistema DevFlow
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push('/sistema/salud')}
                      className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                    >
                      🏥 Estado del Sistema
                    </button>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                    >
                      ➕ Nuevo Proyecto
                    </button>
                  </div>
                </div>
              </div>

              {/* Métricas del Sistema para Administrador */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        🟢
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Estado del Sistema</p>
                      <p className="text-2xl font-semibold text-gray-900">Activo</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        📊
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Proyectos Totales</p>
                      <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        👥
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Usuarios Activos</p>
                      <p className="text-2xl font-semibold text-gray-900">2</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        🔧
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Servicios</p>
                      <p className="text-2xl font-semibold text-gray-900">5/5</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ====== VISTA DE USUARIO COMÚN ====== */
            <>
              {/* Hero Section - Gestión de Proyectos */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-xl p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      🚀 DevFlow - Mis Proyectos
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Gestiona el ciclo completo de desarrollo de tus proyectos de software
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                  >
                    ➕ Nuevo Proyecto
                  </button>
                </div>
              </div>

              {/* Sección de Invitaciones Pendientes */}
              <div className="mb-8">
                <PendingInvitations />
              </div>
            </>
          )}

          {/* Proyectos Existentes */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">📁 Mis Proyectos</h2>
              {isLoadingProjects && (
                <LoadingSpinner size="sm" text="Cargando proyectos..." />
              )}
            </div>
            
            {isLoadingProjects ? (
              <div className="px-6 py-12 text-center">
                <LoadingSpinner size="lg" text="Cargando proyectos..." subtext="Obteniendo información de tus proyectos" />
              </div>
            ) : projects.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4 text-4xl">
                  📂
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes proyectos aún
                </h3>
                <p className="text-gray-500 mb-6">
                  Crea tu primer proyecto para comenzar con el desarrollo
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  🚀 Crear Mi Primer Proyecto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                        {project.name}
                      </h3>
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-all duration-200"
                          title="Editar proyecto"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareProject(project);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200"
                          title="Compartir proyecto con colaboradores"
                        >
                          <ShareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Eliminar proyecto"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                          project.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                          project.prioridad === 'critica' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.prioridad === 'alta' ? '🔴 Alta' :
                           project.prioridad === 'media' ? '🟡 Media' : 
                           project.prioridad === 'critica' ? '🟣 Crítica' : '🟢 Baja'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.descripcion}
                    </p>
                    
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span className="font-medium">
                          {project.tipo === 'web' ? '🌐 Web' :
                           project.tipo === 'mobile' ? '📱 Móvil' :
                           project.tipo === 'desktop' ? '🖥️ Desktop' : 
                           project.tipo === 'fullstack' ? '⚡ Full Stack' : '🔌 API'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipo:</span>
                        <span className="font-medium">{project.equipo.length} miembros</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <span className={`font-medium ${
                          project.estado === 'activo' ? 'text-green-600' :
                          project.estado === 'completado' ? 'text-blue-600' :
                          project.estado === 'pausado' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {project.estado === 'activo' ? '▶️ Activo' :
                           project.estado === 'completado' ? '✅ Completado' :
                           project.estado === 'pausado' ? '⏸️ Pausado' :
                           project.estado === 'cancelado' ? '❌ Cancelado' : '📋 Planificación'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Creado:</span>
                        <span className="font-medium">{project.fechaCreacion.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progreso</span>
                        <span>{project.progreso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progreso}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareProject(project);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <ShareIcon className="h-4 w-4" />
                        <span>Compartir</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project);
                        }}
                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200 flex items-center justify-center"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proyectos Compartidos */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">🤝 Proyectos Compartidos</h2>
              <p className="text-sm text-gray-600 mt-1">Proyectos donde participas como colaborador</p>
            </div>
            <div className="p-6">
              <SharedProjects 
                sharedProjects={sharedProjects}
                onSelectProject={handleSelectProject}
                onShareProject={handleShareProject}
              />
            </div>
          </div>

          {/* Dashboard basado en roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Estadísticas de Proyectos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Estadísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de proyectos:</span>
                  <span className="text-blue-600 font-bold text-lg">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Activos:</span>
                  <span className="text-green-600 font-medium">{projects.filter(p => p.estado === 'activo').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completados:</span>
                  <span className="text-blue-600 font-medium">{projects.filter(p => p.estado === 'completado').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">En planificación:</span>
                  <span className="text-gray-600 font-medium">{projects.filter(p => p.estado === 'planificacion').length}</span>
                </div>
              </div>
            </div>

            {/* Enlaces Rápidos - Diferentes para admin/usuario */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔗 Accesos Rápidos
              </h3>
              <div className="space-y-3">
                {user.role === 'admin' ? (
                  // Vista de administrador
                  <>
                    <a 
                      href="/sistema/salud" 
                      className="block text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      🏥 Salud del Sistema
                    </a>
                    <a 
                      href="http://localhost:8000/docs" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      🔧 API Documentation
                    </a>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="block text-blue-600 hover:text-blue-800 font-medium transition-colors w-full text-left"
                    >
                      ➕ Crear Nuevo Proyecto
                    </button>
                    <button
                      onClick={() => setShowProfileSettings(true)}
                      className="block text-blue-600 hover:text-blue-800 font-medium transition-colors w-full text-left"
                    >
                      ⚙️ Configuración Avanzada
                    </button>
                  </>
                ) : (
                  // Vista de usuario común - Solo acciones básicas
                  <>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="block text-blue-600 hover:text-blue-800 font-medium transition-colors w-full text-left"
                    >
                      ➕ Crear Nuevo Proyecto
                    </button>
                    <button
                      onClick={() => setShowProfileSettings(true)}
                      className="block text-blue-600 hover:text-blue-800 font-medium transition-colors w-full text-left"
                    >
                      👤 Mi Perfil
                    </button>
                    <div className="text-gray-500 text-sm italic">
                      💡 Crea un proyecto para acceder a más herramientas
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                👤 Mi Perfil
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
                  <p className="text-gray-600">{user.email}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? '👑 Administrador' : '👨‍💻 Usuario'}
                  </span>
                </div>
                <button
                  onClick={() => setShowProfileSettings(true)}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ⚙️ Configurar Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Panel de Estado del Sistema - Solo Admin */}
          {user.role === 'admin' && (
            <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                👑 Panel de Administrador
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  Acceso Completo
                </span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h5 className="font-medium text-red-800 mb-2">🖥️ Estado del Sistema</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-700">Backend:</span>
                      <span className="text-green-600 font-medium">✅ Operativo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Base de Datos:</span>
                      <span className="text-green-600 font-medium">✅ Conectada</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Autenticación:</span>
                      <span className="text-green-600 font-medium">✅ Funcionando</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-red-800 mb-2">📈 Métricas</h5>
                  <div className="space-y-2 text-sm text-red-700">
                    <div className="flex justify-between">
                      <span>Usuarios activos:</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyectos totales:</span>
                      <span className="font-medium">{projects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Última actualización:</span>
                      <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="http://localhost:8000/docs" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  🔧 FastAPI Docs
                </a>
                <a 
                  href="/sistema/salud" 
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  🏥 Monitoreo Sistema
                </a>
                <button
                  onClick={() => ProjectStorage.clearProjects()}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  🗑️ Limpiar Datos
                </button>
              </div>
            </div>
          )}


        </div>
      </main>

      {/* Modales */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />

      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />

      {/* Modal de compartir proyecto */}
      {projectToShare && (
        <ShareProjectModal
          projectId={projectToShare.id}
          projectName={projectToShare.name}
          currentUser={{
            id: user?.id || '',
            email: user?.email || '',
            name: user?.name || ''
          }}
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
        />
      )}

      {/* Modal de editar proyecto */}
       {projectToEdit && (
         <EditProjectModal
           project={projectToEdit}
           isOpen={showEditModal}
           onClose={handleCloseEditModal}
           onSave={handleSaveEditProject}
         />
       )}

       {/* Modal de eliminar proyecto */}
       {projectToDelete && (
         <DeleteProjectModal
           project={projectToDelete}
           isOpen={showDeleteModal}
           onClose={handleCloseDeleteModal}
           onConfirm={handleConfirmDeleteProject}
         />
       )}

      {/* Loading overlay para creación de proyectos */}
      <LoadingOverlay 
        isVisible={isCreatingProject}
        text="Creando proyecto..."
        subtext="Configurando estructura inicial y guardando datos"
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <CollaborationProvider>
      <DashboardPageContent />
    </CollaborationProvider>
  );
}
