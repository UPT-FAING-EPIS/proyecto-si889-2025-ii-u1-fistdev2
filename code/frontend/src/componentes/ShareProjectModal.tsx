import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, UserPlusIcon, UserIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { TokenService } from '../modules/auth/tokenService';
import { apiRequest } from '../modules/auth/axiosConfig';

interface User {
  id: string;
  email: string;
  name: string;
}

interface ProjectMember {
  id: string;
  userId: string;
  user: User;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
  joinedAt: Date;
}

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentUser: User;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentUser
}) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'VIEWER'>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    message: string;
    isChecking: boolean;
  }>({ isValid: false, message: '', isChecking: false });

  // Cargar miembros del proyecto
  useEffect(() => {
    if (isOpen && projectId) {
      loadMembers();
    }
  }, [isOpen, projectId]);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`👥 Cargando miembros del proyecto ${projectId}...`);
      
      const response = await apiRequest.get(`/projects/${projectId}/members`);
      
      // El backend retorna { success: boolean, data: array }
      const data = response.data;
      setMembers(Array.isArray(data) ? data : []);
      setMessage('');
      setMessageType('success');
      console.log('✅ Miembros cargados exitosamente');
    } catch (error: any) {
      console.error('❌ Error loading members:', error);
      setMembers([]);
      setMessage(error.message || 'Error cargando miembros del proyecto');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const validateEmail = useCallback(async (email: string) => {
    if (!email.trim()) {
      setEmailValidation({ isValid: false, message: '', isChecking: false });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({ isValid: false, message: 'Formato de email inválido', isChecking: false });
      return;
    }

    setEmailValidation({ isValid: false, message: '', isChecking: true });

    try {
      console.log(`🔍 Validando email: ${email}...`);
      
      const response = await apiRequest.get(`/auth/validate-user?email=${encodeURIComponent(email)}`);

      if (response.success && response.data) {
        const userData = response.data;
        if (userData.exists) {
          setEmailValidation({ 
            isValid: true, 
            message: `Usuario encontrado: ${userData.name || userData.email}`, 
            isChecking: false 
          });
          console.log('✅ Usuario validado exitosamente');
        } else {
          setEmailValidation({ 
            isValid: false, 
            message: 'Usuario no encontrado en el sistema', 
            isChecking: false 
          });
        }
      } else {
        setEmailValidation({ 
          isValid: false, 
          message: 'Error verificando usuario', 
          isChecking: false 
        });
      }
    } catch (error) {
      setEmailValidation({ 
        isValid: false, 
        message: 'Error verificando usuario', 
        isChecking: false 
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inviteEmail) {
        validateEmail(inviteEmail);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inviteEmail, validateEmail]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setMessage('Por favor ingresa un email válido');
      setMessageType('error');
      return;
    }

    // Validar que no se invite a sí mismo
    if (inviteEmail.trim().toLowerCase() === currentUser.email.toLowerCase()) {
      setMessage('No puedes invitarte a ti mismo al proyecto');
      setMessageType('error');
      return;
    }

    // Validar que el email no esté ya en el proyecto
    const existingMember = members.find(member => 
      member.user.email.toLowerCase() === inviteEmail.trim().toLowerCase()
    );
    if (existingMember) {
      setMessage('Este usuario ya es miembro del proyecto');
      setMessageType('error');
      return;
    }

    // Validar que el email tenga formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setMessage('El formato del email no es válido');
      setMessageType('error');
      return;
    }

    // Validar que el email esté verificado por el sistema
    if (!emailValidation.isValid) {
      setMessage('Debes verificar que el email existe en el sistema antes de enviar la invitación');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setMessageType('success');
      
      console.log(`📧 Enviando invitación a ${inviteEmail} con rol ${inviteRole}...`);

      const response = await apiRequest.post(`/projects/${projectId}/invite`, {
        emails: [inviteEmail.trim()],
        role: inviteRole,
      });

      if (!response.success) {
        throw new Error(response.message || 'Error enviando invitación');
      }

      setInviteEmail('');
      setInviteRole('MEMBER');
      setEmailValidation({ isValid: false, message: '', isChecking: false });
      
      // Recargar miembros
      await loadMembers();
      
      setMessage(response.message || 'Invitación enviada exitosamente. El usuario recibirá una notificación.');
      setMessageType('success');
      console.log('✅ Invitación enviada exitosamente');
    } catch (error: any) {
      console.error('❌ Error inviting member:', error);
      setMessage(error.message || 'Error enviando invitación');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover este miembro?')) {
      return;
    }

    try {
      console.log(`🗑️ Removiendo miembro ${memberId}...`);
      
      const response = await apiRequest.delete(`/projects/${projectId}/members/${memberId}`);

      if (!response.success) {
        throw new Error(response.message || 'Error removiendo miembro');
      }

      await loadMembers();
      console.log('✅ Miembro removido exitosamente');
    } catch (error: any) {
      console.error('❌ Error removing member:', error);
      alert(error.message || 'Error removiendo miembro');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Propietario';
      case 'MEMBER':
        return 'Miembro';
      case 'VIEWER':
        return 'Visualizador';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'MEMBER':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Usuario siempre puede invitar (simplificamos la lógica)
  const isOwner = true; // Por ahora permitimos que cualquier usuario pueda invitar

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Compartir Proyecto
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Invite Form - Siempre visible */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Invitar Nuevo Miembro
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Invita usuarios por email al proyecto. El email debe existir en el sistema.
          </p>
          
          <form onSubmit={handleInviteMember}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del usuario
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                      emailValidation.isValid 
                        ? 'border-green-300 focus:ring-green-500' 
                        : emailValidation.message && !emailValidation.isChecking
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {emailValidation.isChecking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : emailValidation.isValid ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : emailValidation.message ? (
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {emailValidation.message && (
                  <p className={`mt-1 text-sm ${
                    emailValidation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {emailValidation.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'VIEWER')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBER">Miembro</option>
                  <option value="VIEWER">Visualizador</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading || !emailValidation.isValid || emailValidation.isChecking}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : emailValidation.isChecking ? 'Verificando...' : 'Enviar Invitación'}
              </button>
            </div>
          </form>
        </div>

        {/* Members List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Miembros del Proyecto ({members.length})
          </h3>
          
          {loading && members.length === 0 ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando miembros...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="mx-auto h-12 w-12 mb-4" />
              <p>
                {message && message.includes('Error') 
                  ? 'No se pudieron cargar los miembros. Puedes seguir invitando usuarios.' 
                  : 'No hay miembros en este proyecto'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user.name}</p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                      <p className="text-xs text-gray-400">
                        Se unió el {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                    
                    {/* Solo owners pueden remover otros miembros (excepto a sí mismos) */}
                    {isOwner && member.userId !== currentUser.id && member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                        title="Remover miembro"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
