import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TokenService } from '../modules/auth/tokenService';

interface UseCollaborationSocketOptions {
  projectId?: string;
  autoConnect?: boolean;
}

export const useCollaborationSocket = (options: UseCollaborationSocketOptions = {}) => {
  const { projectId, autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const token = TokenService.getToken();
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }
    
    console.log('🔌 Iniciando conexión WebSocket con token...');

    // Crear conexión WebSocket
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/collaboration`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      forceNew: true,
    });

    socketRef.current = socket;

    // Event listeners
    socket.on('connect', () => {
      console.log('🔗 Conectado al servidor de colaboración');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('🔌 Desconectado del servidor:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ Error de conexión:', error);
      setError(`Error de conexión: ${error.message}`);
      setIsConnected(false);
    });

    socket.on('error', (error: any) => {
      console.error('❌ Error del socket:', error);
      setError(`Error: ${error.message || error}`);
    });

    socket.on('removed_from_project', (data: { projectId: string }) => {
      console.log('🚫 Removido del proyecto:', data.projectId);
      // Redirigir o mostrar mensaje
      alert('Has sido removido de este proyecto');
      window.location.href = '/dashboard';
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [autoConnect]);

  // Unirse a un proyecto
  const joinProject = (projectId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_project', { projectId });
    }
  };

  // Salir de un proyecto
  const leaveProject = (projectId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_project', { projectId });
    }
  };

  // Escuchar eventos del tablero
  const onBoardEvent = (callback: (event: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('board_event', callback);
      return () => socketRef.current?.off('board_event', callback);
    }
    return () => {};
  };

  // Escuchar eventos de miembros
  const onMemberEvent = (callback: (event: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('member_event', callback);
      return () => socketRef.current?.off('member_event', callback);
    }
    return () => {};
  };

  // Escuchar actualizaciones de presencia
  const onPresenceUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('presence_update', callback);
      return () => socketRef.current?.off('presence_update', callback);
    }
    return () => {};
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinProject,
    leaveProject,
    onBoardEvent,
    onMemberEvent,
    onPresenceUpdate,
  };
};
