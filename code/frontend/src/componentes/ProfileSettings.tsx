'use client';

import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthContext';
import { LoadingSpinner } from '@/componentes/LoadingComponents';
import { TokenService } from '@/modules/auth/tokenService';
import { apiRequest } from '@/modules/auth/axiosConfig';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettings({ isOpen, onClose }: ProfileSettingsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    timezone: 'America/Lima',
    language: 'es'
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      inApp: true
    },
    theme: 'light',
    autoSave: true,
    compactView: false
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const token = TokenService.getToken();
      if (!token) {
        alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
        return;
      }

      console.log('👤 Guardando perfil...');
      
      const response = await apiRequest.patch('/auth/profile', {
        name: profileData.name,
        email: profileData.email,
      });

      if (response.success) {
        alert('Perfil actualizado exitosamente');
        console.log('✅ Perfil guardado:', response.data);
      } else {
        throw new Error(response.message || 'Error actualizando perfil');
      }
    } catch (error: any) {
      console.error('❌ Error guardando perfil:', error);
      alert(error.message || 'Error guardando perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const token = TokenService.getToken();
      if (!token) {
        alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
        return;
      }

      console.log('💾 Guardando preferencias...');
      
      const response = await apiRequest.patch('/auth/preferences', preferences);
      
      if (response.success) {
        alert('Preferencias actualizadas exitosamente');
        console.log('✅ Preferencias guardadas:', response.data);
      } else {
        throw new Error(response.message || 'Error guardando preferencias');
      }
    } catch (error: any) {
      console.error('❌ Error guardando preferencias:', error);
      alert(error.message || 'Error guardando preferencias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (securityData.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = TokenService.getToken();
      if (!token) {
        alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
        return;
      }

      console.log('🔒 Cambiando contraseña...');
      
      const response = await apiRequest.patch('/auth/change-password', {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      });

      if (response.success) {
        alert('Contraseña cambiada exitosamente');
        console.log('✅ Contraseña cambiada exitosamente');
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactor: securityData.twoFactor
        });
      } else {
        throw new Error(response.message || 'Error cambiando contraseña');
      }
    } catch (error: any) {
      console.error('❌ Error cambiando contraseña:', error);
      alert(error.message || 'Error cambiando contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                ⚙️ Configuración de Perfil
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'profile', name: '👤 Perfil', icon: '👤' },
                  { id: 'preferences', name: '🎛️ Preferencias', icon: '🎛️' },
                  { id: 'security', name: '🔒 Seguridad', icon: '🔒' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            {/* Tab: Perfil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{user?.name}</h4>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role === 'admin' ? '👑 Administrador' : '👨‍💻 Usuario'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zona horaria
                    </label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/Lima">América/Lima (UTC-5)</option>
                      <option value="America/Mexico_City">América/Ciudad_de_México (UTC-6)</option>
                      <option value="America/New_York">América/Nueva_York (UTC-5)</option>
                      <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biografía
                    </label>
                    <textarea
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Guardando...</span>
                      </>
                    ) : (
                      '💾 Guardar Perfil'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Preferencias */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">📧 Notificaciones</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'email', label: 'Notificaciones por email', description: 'Recibir actualizaciones por correo electrónico' },
                      { key: 'push', label: 'Notificaciones push', description: 'Recibir notificaciones en el navegador' },
                      { key: 'inApp', label: 'Notificaciones en la app', description: 'Mostrar notificaciones dentro de la aplicación' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={preferences.notifications[item.key as keyof typeof preferences.notifications]}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [item.key]: e.target.checked
                              }
                            }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label className="font-medium text-gray-700">{item.label}</label>
                          <p className="text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">🎨 Interfaz</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Tema</label>
                        <p className="text-sm text-gray-500">Selecciona el tema de la interfaz</p>
                      </div>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="light">🌞 Claro</option>
                        <option value="dark">🌙 Oscuro</option>
                        <option value="auto">🔄 Automático</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Guardado automático</label>
                        <p className="text-sm text-gray-500">Guardar cambios automáticamente</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.autoSave}
                          onChange={(e) => setPreferences(prev => ({ ...prev, autoSave: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Guardando...</span>
                      </>
                    ) : (
                      '💾 Guardar Preferencias'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Seguridad */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">🔒 Cambiar Contraseña</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva contraseña
                        </label>
                        <input
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar contraseña
                        </label>
                        <input
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading || !securityData.currentPassword || !securityData.newPassword}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Cambiando...</span>
                        </>
                      ) : (
                        '🔐 Cambiar Contraseña'
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">🛡️ Seguridad Adicional</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Autenticación de dos factores</label>
                      <p className="text-sm text-gray-500">Añade una capa extra de seguridad</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securityData.twoFactor}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, twoFactor: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
