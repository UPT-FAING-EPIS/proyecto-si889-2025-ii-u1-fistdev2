import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { TokenService } from '../modules/auth/tokenService';
import { apiRequest } from '../modules/auth/axiosConfig';

interface Invitation {
  id: string;
  projectId: string;
  email: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    description?: string;
  };
  inviter: {
    name: string;
    email: string;
  };
}

interface PendingInvitationsProps {
  className?: string;
}

export const PendingInvitations: React.FC<PendingInvitationsProps> = ({ className = '' }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      console.log('📧 Cargando invitaciones pendientes...');
      
      const response = await apiRequest.get('/membership/invitations/me');

      if (response.success && response.data) {
        setInvitations(response.data || []);
        console.log('✅ Invitaciones cargadas exitosamente');
      }
    } catch (error) {
      console.error('❌ Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      setProcessingInvitation(invitationId);
      console.log(`✅ Aceptando invitación ${invitationId}...`);
      
      const response = await apiRequest.post(`/membership/invitations/${invitationId}/accept`);

      if (response.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        
        // Mostrar mensaje de éxito
        alert(`¡Te has unido al proyecto "${response.data?.projectName || 'proyecto'}" exitosamente!`);
        console.log('✅ Invitación aceptada exitosamente');
        
        // Opcional: recargar la página para actualizar la lista de proyectos
        window.location.reload();
      } else {
        alert(`Error: ${response.message || 'No se pudo aceptar la invitación'}`);
      }
    } catch (error: any) {
      console.error('❌ Error accepting invitation:', error);
      alert(error.message || 'Error al aceptar la invitación');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    if (!confirm('¿Estás seguro de que quieres rechazar esta invitación?')) {
      return;
    }

    try {
      setProcessingInvitation(invitationId);
      console.log(`❌ Rechazando invitación ${invitationId}...`);
      
      const response = await apiRequest.post(`/membership/invitations/${invitationId}/reject`);

      if (response.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        alert('Invitación rechazada');
        console.log('✅ Invitación rechazada exitosamente');
      } else {
        alert(`Error: ${response.message || 'No se pudo rechazar la invitación'}`);
      }
    } catch (error: any) {
      console.error('❌ Error rejecting invitation:', error);
      alert(error.message || 'Error al rechazar la invitación');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInHours = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return 'Expirada';
    if (diffInHours < 24) return `${diffInHours}h restantes`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d restantes`;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando invitaciones...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-2">No tienes invitaciones pendientes</p>
          <p className="text-sm text-gray-500">
            Las invitaciones a proyectos aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Invitaciones Pendientes ({invitations.length})
      </h3>
      
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {invitation.project.name}
              </h4>
              {invitation.project.description && (
                <p className="text-gray-600 text-sm mb-2">
                  {invitation.project.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>
                  Invitado por: <strong>{invitation.inviter.name}</strong>
                </span>
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {getTimeLeft(invitation.expiresAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => rejectInvitation(invitation.id)}
              disabled={processingInvitation === invitation.id}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Rechazar
            </button>
            
            <button
              onClick={() => acceptInvitation(invitation.id)}
              disabled={processingInvitation === invitation.id}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {processingInvitation === invitation.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Aceptar
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
