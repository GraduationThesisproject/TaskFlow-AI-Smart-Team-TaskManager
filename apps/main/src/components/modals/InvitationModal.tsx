import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Avatar, Badge } from '@taskflow/ui';
import { X, CheckCircle, XCircle, Clock, Users, Calendar, AlertTriangle } from 'lucide-react';
import { useInvitations } from '../../hooks/useInvitations';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow, isAfter, addDays } from 'date-fns';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationHandled?: () => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  isOpen,
  onClose,
  onInvitationHandled
}) => {
  const { isAuthenticated } = useAuth();
  const {
    invitations,
    isLoading,
    error,
    acceptInvitation,
    declineInvitation,
    fetchInvitations,
    cancelInvitation
  } = useInvitations();

  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());

  // Filter pending invitations and check expiration
  const pendingInvitations = invitations.filter(invitation => {
    if (invitation.status !== 'pending') return false;
    
    // Check if invitation is not expired using expiresAt field
    return isAfter(new Date(invitation.expiresAt), new Date());
  });

  const expiredInvitations = invitations.filter(invitation => {
    if (invitation.status !== 'pending') return false;
    
    // Check if invitation is expired using expiresAt field
    return !isAfter(new Date(invitation.expiresAt), new Date());
  });

  // Group invitations by target entity to avoid duplicates
  const groupedPendingInvitations = pendingInvitations.reduce((acc, invitation) => {
    const key = `${invitation.targetEntity.type}-${invitation.targetEntity.id}`;
    if (!acc[key]) {
      acc[key] = invitation; // Keep the most recent invitation for each entity
    } else if (new Date(invitation.createdAt) > new Date(acc[key].createdAt)) {
      acc[key] = invitation; // Replace with newer invitation
    }
    return acc;
  }, {} as Record<string, any>);

  const uniquePendingInvitations = Object.values(groupedPendingInvitations);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchInvitations({ status: 'pending' });
    }
  }, [isOpen, isAuthenticated, fetchInvitations]);

  // Clean up expired invitations - only run once when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && expiredInvitations.length > 0) {
      const cleanupExpired = async () => {
        for (const invitation of expiredInvitations) {
          try {
            await cancelInvitation(invitation.id);
          } catch (error) {
            console.error('Error cleaning up expired invitation:', error);
          }
        }
      };
      cleanupExpired();
    }
  }, [isOpen, isAuthenticated, expiredInvitations.length, cancelInvitation]);

  const handleAccept = async (invitationId: string) => {
    setProcessingInvitations(prev => new Set(prev).add(invitationId));
    try {
      const success = await acceptInvitation(invitationId);
      if (success) {
        onInvitationHandled?.();
      }
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  const handleDecline = async (invitationId: string) => {
    setProcessingInvitations(prev => new Set(prev).add(invitationId));
    try {
      const success = await declineInvitation(invitationId);
      if (success) {
        onInvitationHandled?.();
      }
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'contributor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (type: string) => {
    return type === 'Workspace' ? <Users size={16} /> : <Calendar size={16} />;
  };

  if (!isOpen || !isAuthenticated) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace Invitations"
      size="lg"
      className="max-h-[80vh]"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <Typography variant="body" className="ml-3 text-muted-foreground">
              Loading invitations...
            </Typography>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <Typography variant="body-small">
              {error}
            </Typography>
          </div>
        ) : uniquePendingInvitations.length === 0 && expiredInvitations.length === 0 ? (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <Typography variant="h4" className="text-muted-foreground mb-2">
              No Invitations
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              You don't have any pending invitations at the moment.
            </Typography>
          </div>
        ) : (
          <div key="invitations-container" className="space-y-4">
            {/* Pending Invitations */}
            {uniquePendingInvitations.length > 0 && (
              <div key="pending-invitations" className="space-y-3">
                <Typography variant="h4" className="font-semibold">
                  Pending Invitations ({uniquePendingInvitations.length})
                </Typography>
                {uniquePendingInvitations.map((invitation) => (
                  <div
                    key={`${invitation.targetEntity.type}-${invitation.targetEntity.id}-${invitation.id}`}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar size="sm">
                        {invitation.invitedBy.avatar && (
                          <img src={invitation.invitedBy.avatar} alt={invitation.invitedBy.name} />
                        )}
                        <div className="bg-primary text-primary-foreground text-xs font-medium">
                          {invitation.invitedBy.name?.charAt(0) || 'U'}
                        </div>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Typography variant="body" className="font-medium">
                            {invitation.invitedBy.name}
                          </Typography>
                          <Typography variant="caption" className="text-muted-foreground">
                            invited you to join
                          </Typography>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {getEntityIcon(invitation.targetEntity.type)}
                          <Typography variant="body" className="font-medium">
                            {invitation.targetEntity.name}
                          </Typography>
                          <Badge className={getRoleColor(invitation.role)}>
                            {invitation.role}
                          </Badge>
                        </div>
                        
                        {invitation.message && (
                          <Typography variant="body-small" className="text-muted-foreground mb-3">
                            "{invitation.message}"
                          </Typography>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecline(invitation.id)}
                          disabled={processingInvitations.has(invitation.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <XCircle size={16} className="mr-1" />
                          Decline
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAccept(invitation.id)}
                          disabled={processingInvitations.has(invitation.id)}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Expired Invitations */}
            {expiredInvitations.length > 0 && (
              <div key="expired-invitations" className="space-y-3">
                <Typography variant="h4" className="font-semibold text-muted-foreground">
                  Expired Invitations ({expiredInvitations.length})
                </Typography>
                <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-md text-warning-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <Typography variant="body-small">
                    These invitations have expired and will be automatically removed.
                  </Typography>
                </div>
                {expiredInvitations.map((invitation) => (
                  <div
                    key={`expired-${invitation.targetEntity.type}-${invitation.targetEntity.id}-${invitation.id}`}
                    className="border border-border rounded-lg p-4 bg-muted/30 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar size="sm">
                        {invitation.invitedBy.avatar && (
                          <img src={invitation.invitedBy.avatar} alt={invitation.invitedBy.name} />
                        )}
                        <div className="bg-muted text-muted-foreground text-xs font-medium">
                          {invitation.invitedBy.name?.charAt(0) || 'U'}
                        </div>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Typography variant="body" className="font-medium text-muted-foreground">
                            {invitation.invitedBy.name}
                          </Typography>
                          <Typography variant="caption" className="text-muted-foreground">
                            invited you to join
                          </Typography>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {getEntityIcon(invitation.targetEntity.type)}
                          <Typography variant="body" className="font-medium text-muted-foreground">
                            {invitation.targetEntity.name}
                          </Typography>
                          <Badge className="bg-muted text-muted-foreground">
                            {invitation.role}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertTriangle size={14} />
                            Expired
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
