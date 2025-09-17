import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@taskflow/ui';
import { useAuth } from '../hooks/useAuth';
import { useWorkspace } from '../hooks/useWorkspace';
import { InvitationService, type InvitationDetails } from '../services/invitationService';

const JoinWorkspace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setWorkspaceId } = useWorkspace();
  
  const token = searchParams.get('token');

  
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
    const currentUrl = window.location.href;
    navigate('/', { 
      state: { 
        returnTo: currentUrl,
        message: 'Please sign in to accept this invitation'
      } 
    });
  };

  const handleAccept = async () => {
    if (!isAuthenticated) return requireAuthAndReturn();
    setSubmitting('accept');
    setError(null);
    try {
      await InvitationService.accept(token!);
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
      await InvitationService.decline(token!);
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
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Invalid Invitation</h2>
          <p className="text-muted-foreground mb-6">{error || 'This invitation link is invalid or has expired.'}</p>
          <Button onClick={() => navigate('/dashboard')} variant="default">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-2">
          You're invited to join a workspace!
        </h2>
        
        <div className="text-muted-foreground mb-6 space-y-2">
          <p>
            <strong>{typeof invitation.invitedBy === 'object' ? invitation.invitedBy.name : invitation.invitedBy || 'Someone'}</strong> has invited you to join{' '}
            <strong>{invitation.targetEntity?.name || 'a workspace'}</strong>.
          </p>
          {invitation.role && (
            <p className="text-sm">
              You'll be added as a <strong>{invitation.role}</strong>.
            </p>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please sign in to accept this invitation.
            </p>
            <Button onClick={requireAuthAndReturn} className="w-full">
              Sign In to Accept
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                disabled={submitting === 'accept'}
                className="flex-1"
                variant="default"
              >
                {submitting === 'accept' ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={submitting === 'decline'}
                className="flex-1"
                variant="outline"
              >
                {submitting === 'decline' ? 'Declining...' : 'Decline'}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinWorkspace;
