import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@taskflow/ui';
import { useAuth } from '../hooks/useAuth';
import { useWorkspace } from '../hooks/useWorkspace';
import { InvitationService, type InvitationDetails } from '../services/invitationService';

const InviteLanding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setWorkspaceId } = useWorkspace();
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<'accept' | 'decline' | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    const loadInvitation = async () => {
      try {
        const data = await InvitationService.getByToken(token);
        setInvitation(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const requireAuthAndReturn = () => {
    navigate('/signin', { 
      state: { 
        returnTo: `/invite/${token}`,
        message: 'Please sign in to accept this invitation'
      } 
    });
  };

  const handleAccept = async () => {
    if (!isAuthenticated) return requireAuthAndReturn();
    setSubmitting('accept');
    setError(null);
    try {
      await InvitationService.accept(token);
      // Navigate to workspace/space using Redux state
      if (invitation?.targetEntity?.type === 'Workspace') {
        // Set the workspace in Redux state first
        setWorkspaceId(invitation.targetEntity.id);
        // Navigate to workspace without query parameters
        navigate('/workspace', { replace: true });
      } else if (invitation?.targetEntity?.type === 'Space') {
        // If there is a space page, navigate accordingly; fallback to workspace
        navigate(`/space?id=${invitation.targetEntity.id}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) return requireAuthAndReturn();
    setSubmitting('decline');
    setError(null);
    try {
      await InvitationService.decline(token);
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to decline invitation');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation…</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-card border rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Invitation Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error || 'Invitation not found or expired.'}</p>
          <Button variant="default" onClick={() => navigate('/', { replace: true })}>Go Home</Button>
        </div>
      </div>
    );
  }

  const needsAuthNotice = !isAuthenticated;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2">You’re invited!</h1>
        <p className="text-muted-foreground mb-6">Join {invitation.targetEntity.type.toLowerCase()} “{invitation.targetEntity.name}” as {invitation.role}.</p>

        {invitation.message && (
          <div className="mb-6 p-3 rounded-md border bg-muted/30 text-sm">
            <div className="font-medium mb-1">Message from inviter</div>
            <div>{invitation.message}</div>
          </div>
        )}

        {needsAuthNotice && (
          <div className="mb-4 text-sm text-yellow-600">
            Please sign in to accept this invitation. You’ll be brought back here afterwards.
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleAccept} disabled={!!submitting}>
            {submitting === 'accept' ? 'Accepting…' : 'Accept invite'}
          </Button>
          <Button variant="outline" onClick={handleDecline} disabled={!!submitting}>
            {submitting === 'decline' ? 'Declining…' : 'Decline'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/', { replace: true })}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default InviteLanding;
