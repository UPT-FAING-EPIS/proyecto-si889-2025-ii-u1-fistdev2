import React, { useState, useEffect } from 'react';
import { UserGroupIcon, WifiIcon } from '@heroicons/react/24/outline';

interface PresenceIndicatorProps {
  projectId: string;
  socket?: any;
}

interface PresenceUpdate {
  projectId: string;
  onlineCount: number;
  action: 'user_joined' | 'user_left';
  userId?: string;
  userName?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  projectId,
  socket,
}) => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    // Escuchar eventos de presencia
    const handlePresenceUpdate = (data: PresenceUpdate) => {
      if (data.projectId === projectId) {
        setOnlineCount(data.onlineCount);
        
        // Mostrar actividad reciente
        if (data.action === 'user_joined' && data.userName) {
          setRecentActivity(`${data.userName} se conectó`);
        } else if (data.action === 'user_left') {
          setRecentActivity('Un usuario se desconectó');
        }
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setRecentActivity(''), 3000);
      }
    };

    const handleJoinedProject = (data: any) => {
      if (data.projectId === projectId) {
        setOnlineCount(data.onlineCount);
        setIsConnected(true);
      }
    };

    const handleConnect = () => {
      setIsConnected(true);
      // Re-unirse al proyecto cuando se reconecta
      socket.emit('join_project', { projectId });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setOnlineCount(0);
    };

    // Registrar listeners
    socket.on('presence_update', handlePresenceUpdate);
    socket.on('joined_project', handleJoinedProject);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Unirse al proyecto al montar
    if (socket.connected) {
      socket.emit('join_project', { projectId });
      setIsConnected(true);
    }

    // Cleanup
    return () => {
      socket.off('presence_update', handlePresenceUpdate);
      socket.off('joined_project', handleJoinedProject);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      
      // Salir del proyecto al desmontar
      socket.emit('leave_project', { projectId });
    };
  }, [socket, projectId]);

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    if (onlineCount > 1) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Desconectado';
    if (onlineCount === 0) return 'Solo tú';
    if (onlineCount === 1) return 'Solo tú conectado';
    return `${onlineCount} usuarios conectados`;
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {/* Indicador de conexión */}
      <div className="flex items-center space-x-1">
        <WifiIcon className={`h-4 w-4 ${getStatusColor()}`} />
        <span className={`${getStatusColor()} font-medium`}>
          {isConnected ? 'En línea' : 'Desconectado'}
        </span>
      </div>

      {/* Contador de usuarios */}
      {isConnected && (
        <div className="flex items-center space-x-1 text-gray-600">
          <UserGroupIcon className="h-4 w-4" />
          <span>{getStatusText()}</span>
        </div>
      )}

      {/* Actividad reciente */}
      {recentActivity && (
        <div className="text-xs text-blue-600 animate-pulse">
          {recentActivity}
        </div>
      )}

      {/* Indicador visual de pulso para múltiples usuarios */}
      {onlineCount > 1 && (
        <div className="relative">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 h-2 w-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
        </div>
      )}
    </div>
  );
};
