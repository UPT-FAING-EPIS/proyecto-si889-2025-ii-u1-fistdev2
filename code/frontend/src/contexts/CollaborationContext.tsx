import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useCollaborationSocket } from '../hooks/useCollaborationSocket';

interface BoardEvent {
  type: string;
  projectId: string;
  actor: {
    id: string;
    email: string;
    name: string;
  };
  timestamp: Date;
  payload: any;
}

interface MemberEvent {
  type: 'member_added' | 'member_removed';
  projectId: string;
  actor: {
    id: string;
    email: string;
    name: string;
  };
  payload: any;
}

interface CollaborationContextType {
  isConnected: boolean;
  error: string | null;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  currentProject: string | null;
  recentEvents: BoardEvent[];
  socket: any;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<BoardEvent[]>([]);
  
  const {
    socket,
    isConnected,
    error,
    joinProject: socketJoinProject,
    leaveProject: socketLeaveProject,
    onBoardEvent,
    onMemberEvent,
  } = useCollaborationSocket();

  // Manejar eventos del tablero
  useEffect(() => {
    const cleanup = onBoardEvent((event: BoardEvent) => {
      console.log('📝 Evento del tablero:', event);
      
      // Añadir a eventos recientes (mantener solo los últimos 10)
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
      
      // Aplicar cambios localmente según el tipo de evento
      handleBoardEventLocally(event);
    });

    return cleanup;
  }, [onBoardEvent]);

  // Manejar eventos de miembros
  useEffect(() => {
    const cleanup = onMemberEvent((event: MemberEvent) => {
      console.log('👥 Evento de miembros:', event);
      
      // Mostrar notificación
      if (event.type === 'member_added') {
        showNotification(`${event.payload.memberName || 'Un nuevo miembro'} se unió al proyecto`);
      } else if (event.type === 'member_removed') {
        showNotification(`${event.payload.removedMemberName || 'Un miembro'} fue removido del proyecto`);
      }
    });

    return cleanup;
  }, [onMemberEvent]);

  const joinProject = (projectId: string) => {
    if (currentProject && currentProject !== projectId) {
      socketLeaveProject(currentProject);
    }
    
    socketJoinProject(projectId);
    setCurrentProject(projectId);
  };

  const leaveProject = (projectId: string) => {
    socketLeaveProject(projectId);
    if (currentProject === projectId) {
      setCurrentProject(null);
    }
  };

  const handleBoardEventLocally = (event: BoardEvent) => {
    // Aquí se pueden manejar los cambios locales según el tipo de evento
    switch (event.type) {
      case 'task_created':
        // Actualizar la lista de tareas localmente si es necesario
        console.log('✅ Tarea creada:', event.payload.taskTitle);
        showNotification(`${event.actor.name} creó: ${event.payload.taskTitle}`);
        break;
        
      case 'task_updated':
        console.log('📝 Tarea actualizada:', event.payload.taskTitle);
        showNotification(`${event.actor.name} actualizó: ${event.payload.taskTitle}`);
        break;
        
      case 'task_moved':
        console.log('🔄 Tarea movida:', event.payload);
        showNotification(`${event.actor.name} movió "${event.payload.taskTitle}" a ${event.payload.toColumnTitle}`);
        break;
        
      case 'task_deleted':
        console.log('🗑️ Tarea eliminada:', event.payload.taskTitle);
        showNotification(`${event.actor.name} eliminó: ${event.payload.taskTitle}`);
        break;
        
      default:
        console.log('📄 Evento desconocido:', event.type);
    }
  };

  const showNotification = (message: string) => {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const value: CollaborationContextType = {
    isConnected,
    error,
    joinProject,
    leaveProject,
    currentProject,
    recentEvents,
    socket,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = (): CollaborationContextType => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
