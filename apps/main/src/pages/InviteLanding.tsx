import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@taskflow/ui';
import { InvitationService, type InvitationDetails } from '../services/invitationService';
import { useAuth } from '../hooks/useAuth';

const InviteLanding: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [submitting, setSubmitting] = useState<'accept' | 'decline' | null>(null);

  // Fetch invitation details
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await InvitationService.getByToken(token);
        if (mounted) setInvitation(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load invitation');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (token) run();
    return () => {
      mounted = false;
    };
  }, [token]);

  const invitedEmail = invitation?.invitedBy ? undefined : undefined; // placeholder if we later show inviter info
  const targetName = invitation?.targetEntity?.name || 'Workspace';

  const requireAuthAndReturn = useCallback(() => {
    // Store desired return path and send to landing (sign-in is accessible from landing)
    try {
      localStorage.setItem('postLoginRedirect', `/invite/${token}`);
    } catch {}
    navigate('/', { replace: true });
  }, [navigate, token]);

  const handleAccept = async () => {
    if (!isAuthenticated) return requireAuthAndReturn();
    setSubmitting('accept');
    setError(null);
    try {
      await InvitationService.accept(token);
      // Navigate to workspace/space
      if (invitation?.targetEntity?.type === 'Workspace') {
        navigate(`/workspace?id=${invitation.targetEntity.id}`, { replace: true });
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
        <p className="text-muted-foreground mb-6">Join {invitation.targetEntity.type.toLowerCase()} “{targetName}” as {invitation.role}.</p>

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
