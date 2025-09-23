import React, { useState, useEffect } from 'react';
import { useInvitations } from '../hooks/useInvitations';
import { useToast } from '../hooks/useToast';
import { useWorkspaceSocket } from '../contexts/SocketContext';
import InvitationNotification from '../components/notifications/InvitationNotification';
import { Button, Card, Tabs, TabsContent, TabsList, TabsTrigger, Badge } from '@taskflow/ui';
import { Bell, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [hasNewInvitations, setHasNewInvitations] = useState(false);
  
  const {
    invitations,
    isLoading,
    error,
    fetchInvitations,
    acceptInvitation,
    declineInvitation,
    clearError
  } = useInvitations();
  
  const { success, error: showError } = useToast();
  const workspaceSocket = useWorkspaceSocket();

  // Filter invitations by status
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const acceptedInvitations = invitations.filter(inv => inv.status === 'accepted');
  const declinedInvitations = invitations.filter(inv => inv.status === 'declined');
  const expiredInvitations = invitations.filter(inv => inv.status === 'expired');

  const handleAcceptInvitation = async (invitationId: string) => {
    setIsResponding(invitationId);
    try {
      const success = await acceptInvitation(invitationId);
      if (success) {
        success('Invitation accepted successfully!', 'Success');
        // Refresh invitations
        await fetchInvitations();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setIsResponding(null);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    setIsResponding(invitationId);
    try {
      const success = await declineInvitation(invitationId);
      if (success) {
        success('Invitation declined', 'Info');
        // Refresh invitations
        await fetchInvitations();
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setIsResponding(null);
    }
  };

  const getTabCount = (status: string) => {
    switch (status) {
      case 'pending':
        return pendingInvitations.length;
      case 'accepted':
        return acceptedInvitations.length;
      case 'declined':
        return declinedInvitations.length;
      case 'expired':
        return expiredInvitations.length;
      default:
        return 0;
    }
  };

  const renderInvitationsList = (invitations: any[]) => {
    if (invitations.length === 0) {
      return (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No invitations</h3>
          <p className="text-slate-500">
            {activeTab === 'pending' 
              ? "You don't have any pending invitations"
              : `You don't have any ${activeTab} invitations`
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <InvitationNotification
            key={invitation.id}
            invitation={invitation}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
            isLoading={isResponding === invitation.id}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchInvitations();
  }, []); // Empty dependency array to run only on mount

  // Track new invitations for real-time updates
  useEffect(() => {
    if (pendingInvitations.length > 0) {
      setHasNewInvitations(true);
    }
  }, [pendingInvitations.length]);

  // Clear new invitation indicator when user switches to pending tab
  useEffect(() => {
    if (activeTab === 'pending') {
      setHasNewInvitations(false);
    }
  }, [activeTab]);

  // Real-time workspace access events
  useEffect(() => {
    if (!workspaceSocket) return;

    // Listen for workspace access granted (when user accepts invitation)
    const handleAccessGranted = (data: any) => {
      console.log('Workspace access granted:', data);
      success(`You now have access to ${data.workspaceName} as ${data.role}`);
      // Refresh invitations to update status
      fetchInvitations();
    };

    // Listen for workspace access revoked (when user is removed)
    const handleAccessRevoked = (data: any) => {
      console.log('Workspace access revoked:', data);
      showError(`Your access to ${data.workspaceName} has been revoked`);
      // Refresh invitations to update status
      fetchInvitations();
    };

    // Add event listeners
    workspaceSocket.on('workspace:access_granted', handleAccessGranted);
    workspaceSocket.on('workspace:access_revoked', handleAccessRevoked);

    // Cleanup
    return () => {
      workspaceSocket.off('workspace:access_granted', handleAccessGranted);
      workspaceSocket.off('workspace:access_revoked', handleAccessRevoked);
    };
  }, [workspaceSocket, success, showError, fetchInvitations]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Notifications</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => { clearError(); fetchInvitations(); }}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Notifications</h1>
        <p className="text-slate-600">Manage your workspace and space invitations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
            {getTabCount('pending') > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">
                {getTabCount('pending')}
              </span>
            )}
            {hasNewInvitations && (
              <Badge variant="destructive" className="ml-1 animate-pulse">
                New
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Accepted
            {getTabCount('accepted') > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                {getTabCount('accepted')}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="declined" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Declined
            {getTabCount('declined') > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                {getTabCount('declined')}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Expired
            {getTabCount('expired') > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                {getTabCount('expired')}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading pending invitations...</p>
            </div>
          ) : (
            renderInvitationsList(pendingInvitations)
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading accepted invitations...</p>
            </div>
          ) : (
            renderInvitationsList(acceptedInvitations)
          )}
        </TabsContent>

        <TabsContent value="declined" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading declined invitations...</p>
            </div>
          ) : (
            renderInvitationsList(declinedInvitations)
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading expired invitations...</p>
            </div>
          ) : (
            renderInvitationsList(expiredInvitations)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
