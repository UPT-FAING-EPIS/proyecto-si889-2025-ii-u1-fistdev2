import React, { useState, useEffect, useCallback } from 'react';
import { BellIcon, XMarkIcon, CheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { TokenService } from '../modules/auth/tokenService';
import { apiRequest } from '../modules/auth/axiosConfig';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

interface NotificationProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
    loadUnreadCount();
  }, [isOpen]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔔 Cargando notificaciones...');
      
      const response = await apiRequest.get('/notifications');

      if (response.success && response.data) {
        setNotifications(response.data);
        console.log('✅ Notificaciones cargadas exitosamente');
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = async () => {
    try {
      console.log('🔢 Cargando contador de notificaciones no leídas...');
      
      const response = await apiRequest.get('/notifications/unread/count');

      if (response.success && response.data) {
        setUnreadCount(response.data.count);
        console.log('✅ Contador de notificaciones cargado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log(`📖 Marcando notificación ${notificationId} como leída...`);
      
      const response = await apiRequest.patch(`/notifications/${notificationId}/read`);

      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('📚 Marcando todas las notificaciones como leídas...');
      
      const response = await apiRequest.patch('/notifications/read-all');

      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
        console.log('✅ Todas las notificaciones marcadas como leídas');
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      console.log(`🗑️ Eliminando notificación ${notificationId}...`);
      
      const response = await apiRequest.delete(`/notifications/${notificationId}`);

      if (response.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        console.log('✅ Notificación eliminada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace un momento';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_INVITATION':
        return '📧';
      case 'INVITATION_ACCEPTED':
        return '✅';
      case 'INVITATION_REJECTED':
        return '❌';
      case 'MEMBER_ADDED':
        return '👥';
      case 'MEMBER_REMOVED':
        return '👤';
      default:
        return '📄';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Marcar todas</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Cargando notificaciones...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Marcar como leída"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar notificación"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
