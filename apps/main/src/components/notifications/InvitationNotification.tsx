import React from 'react';
import { Button, Card } from '@taskflow/ui';
import { Check, X, UserPlus, Building2 } from 'lucide-react';
import type { Invitation } from '../../services/invitationService';

interface InvitationNotificationProps {
  invitation: Invitation;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  isLoading?: boolean;
}

const InvitationNotification: React.FC<InvitationNotificationProps> = ({
  invitation,
  onAccept,
  onDecline,
  isLoading = false
}) => {
  const getEntityIcon = () => {
    switch (invitation.targetEntity.type) {
      case 'Workspace':
        return <Building2 className="w-4 h-4" />;
      case 'Space':
        return <UserPlus className="w-4 h-4" />;
      default:
        return <UserPlus className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (invitation.status) {
      case 'pending':
        return 'border-amber-200 bg-amber-50';
      case 'accepted':
        return 'border-green-200 bg-green-50';
      case 'declined':
        return 'border-red-200 bg-red-50';
      case 'expired':
        return 'border-gray-200 bg-gray-50';
      case 'cancelled':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getStatusText = () => {
    switch (invitation.status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const canRespond = invitation.status === 'pending' && !isExpired;

  return (
    <Card className={`p-4 border ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            {getEntityIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-slate-900 truncate">
              Invitation to {invitation.targetEntity.name}
            </h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              invitation.status === 'pending' ? 'bg-amber-100 text-amber-800' :
              invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
              invitation.status === 'declined' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {getStatusText()}
            </span>
            {invitation.source === 'github_org' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                GitHub
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 mb-2">
            <strong>{invitation.invitedBy.name}</strong> invited you to join{' '}
            <strong>{invitation.targetEntity.name}</strong> as a{' '}
            <strong>{invitation.role}</strong>
            {invitation.message && (
              <span className="block mt-1 italic">"{invitation.message}"</span>
            )}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Invited: {new Date(invitation.createdAt).toLocaleDateString()}</span>
            <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
            {invitation.role && (
              <span className="capitalize">Role: {invitation.role}</span>
            )}
          </div>
          
          {isExpired && invitation.status === 'pending' && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              This invitation has expired
            </div>
          )}
        </div>
        
        {canRespond && (
          <div className="flex-shrink-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDecline(invitation.id)}
              disabled={isLoading}
              className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-3 h-3 mr-1" />
              Decline
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onAccept(invitation.id)}
              disabled={isLoading}
              className="h-8 px-3 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Accept
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InvitationNotification;
