'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/modules/auth/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  PlusIcon, 
  UserIcon, 
  TrashIcon,
  ArrowLeftIcon,
  Bars3Icon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { boardApi, taskApi, membersApi, Task, Column, Board, ProjectMember } from '@/modules/boards/boardApi';
import { useCollaborationSocket } from '@/hooks/useCollaborationSocket';

function PlanificacionContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  // Estado del tablero
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de UI
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  // Estado de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Estado de miembros
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  // Colaboración en tiempo real
  const { 
    isConnected: socketConnected, 
    joinProject, 
    leaveProject, 
    onBoardEvent, 
    onMemberEvent,
    onPresenceUpdate 
  } = useCollaborationSocket({ projectId: projectId || undefined });
  
  // Estado del formulario de nueva tarea
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    estimatedHours: 1,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  // Función helper para manejar el estado de guardado
  const handleSaveState = (status: 'saving' | 'saved' | 'error') => {
    setSaveStatus(status);
    if (status === 'saving') {
      setIsSaving(true);
    } else {
      setIsSaving(false);
      if (status === 'saved') {
        setLastSaved(new Date());
        // Auto-ocultar el mensaje después de 3 segundos
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!projectId) {
      router.push('/dashboard');
      return;
    }

    loadBoard();
    loadProjectMembers();
  }, [user, router, projectId]);

  // Configurar colaboración en tiempo real
  useEffect(() => {
    if (!projectId || !socketConnected) return;

    // Unirse al proyecto
    joinProject(projectId);

    // Escuchar eventos del tablero
    const unsubscribeBoardEvent = onBoardEvent((event: any) => {
      console.log('📋 Evento del tablero recibido:', event);
      
      switch (event.type) {
        case 'task_moved':
        case 'task_updated':
        case 'task_created':
        case 'task_deleted':
          // Recargar el tablero para mostrar cambios
          loadBoard();
          break;
        default:
          console.log('Evento de tablero no manejado:', event.type);
      }
    });

    // Escuchar eventos de miembros
    const unsubscribeMemberEvent = onMemberEvent((event: any) => {
      console.log('👥 Evento de miembros recibido:', event);
      
      switch (event.type) {
        case 'member_added':
        case 'member_removed':
        case 'member_role_updated':
          // Recargar miembros
          loadProjectMembers();
          break;
        default:
          console.log('Evento de miembros no manejado:', event.type);
      }
    });

    // Escuchar actualizaciones de presencia
    const unsubscribePresence = onPresenceUpdate((data: any) => {
      console.log('👋 Actualización de presencia:', data);
      // Aquí podrías mostrar qué usuarios están activos
    });

    // Cleanup
    return () => {
      unsubscribeBoardEvent();
      unsubscribeMemberEvent();
      unsubscribePresence();
      leaveProject(projectId);
    };
  }, [projectId, socketConnected, joinProject, leaveProject, onBoardEvent, onMemberEvent, onPresenceUpdate]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      setError(null);

      let boardData;
      
      try {
        // Intentar obtener el tablero existente
        boardData = await boardApi.getBoardByProject(projectId || '');
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Si no existe, crear uno nuevo
          boardData = await boardApi.createBoard(projectId || '', {
            name: 'Tablero Principal',
            description: 'Tablero principal del proyecto',
          });
        } else {
          throw err;
        }
      }
      
      // Establecer el tablero con las columnas del backend
      setBoard(boardData);
      
      // Establecer la primera columna como seleccionada por defecto
      if (boardData.columns && boardData.columns.length > 0) {
        setSelectedColumn(boardData.columns[0].id);
      }
    } catch (err: any) {
      console.error('Error loading board:', err);
      setError(err.message || 'Error al cargar el tablero');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMembers = async () => {
    if (!projectId) return;
    
    try {
      const members = await membersApi.getProjectMembers(projectId);
      setProjectMembers(members || []);
    } catch (err) {
      console.error('Error loading project members:', err);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !board) return;

    const { source, destination } = result;

    try {
      handleSaveState('saving');
      
      // Optimistic update - actualizar UI inmediatamente
      const updatedBoard = { ...board };
      const sourceColumn = updatedBoard.columns?.find(col => col.id === source.droppableId);
      const destColumn = updatedBoard.columns?.find(col => col.id === destination.droppableId);

      if (!sourceColumn || !destColumn) return;

      let movedTask: Task;

      if (source.droppableId === destination.droppableId) {
        // Reordenar dentro de la misma columna
        const newTasks = Array.from(sourceColumn.tasks);
        [movedTask] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, movedTask);
        sourceColumn.tasks = newTasks;
      } else {
        // Mover entre columnas
        const sourceTasks = Array.from(sourceColumn.tasks);
        const destTasks = Array.from(destColumn.tasks);
        [movedTask] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, movedTask);
        
        sourceColumn.tasks = sourceTasks;
        destColumn.tasks = destTasks;
        movedTask.status = destColumn.title.toLowerCase().replace(/[^a-z-]/g, '');
      }

      // Actualizar posiciones
      sourceColumn.tasks.forEach((task, index) => {
        task.position = index;
      });
      
      if (destColumn !== sourceColumn) {
        destColumn.tasks.forEach((task, index) => {
          task.position = index;
        });
      }

      setBoard(updatedBoard);

      // Hacer la llamada al backend para persistir el cambio
      await taskApi.moveTask(movedTask.id, destination.droppableId, destination.index);

      handleSaveState('saved');

    } catch (err: any) {
      console.error('Error moving task:', err);
      handleSaveState('error');
      // Revertir cambios optimistas si hay error
      loadBoard();
      setError('Error al mover la tarea');
    }
  };

  const handleCreateTask = async () => {
    if (!board || !newTask.title.trim()) return;

    try {
      handleSaveState('saving');
      
      const taskData = {
        ...newTask,
        columnId: selectedColumn,
        boardId: board.id,
        status: board.columns?.find(col => col.id === selectedColumn)?.title.toLowerCase().replace(/[^a-z-]/g, '') || 'backlog',
        position: board.columns?.find(col => col.id === selectedColumn)?.tasks.length || 0,
      };

      const createdTask = await taskApi.createTask(selectedColumn, taskData);

      // Actualizar el estado local
      const updatedBoard = { ...board };
      const targetColumn = updatedBoard.columns?.find(col => col.id === selectedColumn);
      if (targetColumn) {
        targetColumn.tasks.push(createdTask);
      }
      setBoard(updatedBoard);

      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        estimatedHours: 1,
        tags: []
      });
      setShowCreateTask(false);

      handleSaveState('saved');

    } catch (err: any) {
      console.error('Error creating task:', err);
      handleSaveState('error');
      setError(err.message || 'Error al crear la tarea');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!board || !confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      handleSaveState('saving');
      
      await taskApi.deleteTask(taskId);

      // Actualizar estado local
      const updatedBoard = { ...board };
      updatedBoard.columns?.forEach(column => {
        column.tasks = column.tasks.filter(task => task.id !== taskId);
      });
      setBoard(updatedBoard);

      handleSaveState('saved');

    } catch (err: any) {
      console.error('Error deleting task:', err);
      handleSaveState('error');
      setError('Error al eliminar la tarea');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newTask.tags.includes(newTag.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getColumnColor = (color: string) => {
    const colors = {
      gray: 'border-gray-200 bg-gray-50',
      blue: 'border-blue-200 bg-blue-50',
      yellow: 'border-yellow-200 bg-yellow-50',
      purple: 'border-purple-200 bg-purple-50',
      green: 'border-green-200 bg-green-50',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🔴',
    };
    return icons[priority as keyof typeof icons] || icons.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tablero de planificación...</p>
        </div>
      </div>
    );
  };

  if (error && !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  };

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se encontró el tablero</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Volver al Dashboard
              </button>
              <div className="flex items-center space-x-2">
                <Bars3Icon className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Planificación - {board.name}
                </h1>
                
                {/* Indicadores de estado */}
                <div className="flex items-center space-x-4 ml-4">
                  {/* Indicador de conexión en tiempo real */}
                  <div className="flex items-center space-x-1">
                    <div className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-600">
                      {socketConnected ? 'En línea' : 'Desconectado'}
                    </span>
                  </div>

                  {/* Indicador de guardado */}
                  {saveStatus !== 'idle' && (
                    <div className="flex items-center space-x-2">
                      {saveStatus === 'saving' && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Guardando...</span>
                        </div>
                      )}
                      {saveStatus === 'saved' && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm">
                            Guardado {lastSaved && new Date(lastSaved).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {saveStatus === 'error' && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm">Error al guardar</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMembersModal(true)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
              >
                <UserIcon className="h-4 w-4" />
                <span>Miembros ({projectMembers.length})</span>
              </button>
              
              <button
                onClick={() => setShowCreateTask(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Nueva Tarea</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">👋 {user?.name || user?.username}</span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 text-sm underline ml-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {board.columns?.map((column) => (
            <div key={column.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm">
                  {column.title.replace(/[📋📝🔄👀✅]/g, '').trim()}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  column.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  column.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  column.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                  column.color === 'green' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {column.tasks.length}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">
                  {column.tasks.length}
                </div>
                <div className="text-xs text-gray-500">
                  {column.tasks.reduce((acc, task) => acc + task.estimatedHours, 0)}h estimadas
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tablero Kanban */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {board.columns?.map((column) => (
              <div key={column.id} className={`rounded-lg border-2 ${getColumnColor(column.color)}`}>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900 flex items-center justify-between">
                    <span>{column.title}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded">
                      {column.tasks.length}
                    </span>
                  </h2>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg border p-4 mb-3 shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-gray-900 text-sm leading-tight flex-1">
                                  {task.title}
                                </h3>
                                <div className="flex items-center space-x-1 ml-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                    {getPriorityIcon(task.priority)}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                    title="Eliminar tarea"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                {task.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {task.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{task.estimatedHours}h</span>
                                {task.assignedTo && (
                                  <span className="flex items-center">
                                    <UserIcon className="h-3 w-3 mr-1" />
                                    {task.assignedTo}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modal para crear nueva tarea */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nueva Tarea</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Columna
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {board?.columns?.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title.replace(/[📋📝🔄👀✅]/g, '').trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título de la tarea"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción de la tarea"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🟡 Media</option>
                    <option value="high">🔴 Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas estimadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asignado a
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin asignar</option>
                  {projectMembers.map((member) => (
                    <option key={member.id} value={member.user?.name || member.userId}>
                      {member.user?.name || `Usuario ${member.userId}`} ({member.user?.email || 'Sin email'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nueva etiqueta"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newTask.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateTask(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de miembros */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Miembros del Proyecto</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {projectMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay miembros en este proyecto</p>
              ) : (
                projectMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{member.user?.name || `Usuario ${member.userId}`}</div>
                      <div className="text-sm text-gray-500">{member.user?.email || 'Sin email'}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.role.toLowerCase() === 'owner' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'owner' || member.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                      member.role.toLowerCase() === 'member' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Planificacion() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PlanificacionContent />
    </Suspense>
  );
}
