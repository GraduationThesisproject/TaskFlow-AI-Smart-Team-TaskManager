import React, { useState, useMemo, useCallback } from 'react';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@taskflow/ui';
import type { Space } from '../../types/space.types';

interface SettingsLayoutProps {
  currentSpace: Space;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = React.memo(({ currentSpace }) => {
  const spaceId = currentSpace?._id;
  const { isAuthenticated, token } = useAuth();
  const { success, error: showError } = useToast();

  // Space data
  const {
    loading,
    error: apiError,
    editSpace,
    removeSpace
  } = useSpaceManager();

  // Local UI state
  const [isEditingSpace, setIsEditingSpace] = useState(false);
  const [editingSpaceData, setEditingSpaceData] = useState({
    name: currentSpace?.name || '',
    description: currentSpace?.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveSpace = useCallback(async () => {
    if (!spaceId) return;
    
    setIsSaving(true);
    try {
      await editSpace(spaceId, editingSpaceData);
      setIsEditingSpace(false);
      success('Space updated successfully!');
    } catch (error) {
      console.error('Failed to update space:', error);
      showError('Failed to update space');
    } finally {
      setIsSaving(false);
    }
  }, [spaceId, editingSpaceData, editSpace, success, showError]);

  const handleDeleteSpace = useCallback(async () => {
    if (!spaceId) return;
    
    try {
      await removeSpace(spaceId);
      success('Space deleted successfully!');
      // Navigate back to workspace
      window.location.href = '/workspace';
    } catch (error) {
      console.error('Failed to delete space:', error);
      showError('Failed to delete space');
    } finally {
      setShowDeleteConfirm(false);
    }
  }, [spaceId, removeSpace, success, showError]);

  // Authentication check
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Authentication Required</div>
          <p className="text-muted-foreground mb-4">Please log in to access this space.</p>
          <Button
            onClick={() => window.location.href = '/login'}
            variant="default"
            size="sm"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading space settings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Error Loading Settings</div>
          <p className="text-muted-foreground mb-4">{apiError}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-muted/50 to-muted">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Space Settings</h1>
                <p className="text-muted-foreground">Manage your space configuration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Space Name
                </label>
                {isEditingSpace ? (
                  <input
                    type="text"
                    value={editingSpaceData.name}
                    onChange={(e) => setEditingSpaceData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-foreground">{currentSpace.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                {isEditingSpace ? (
                  <textarea
                    value={editingSpaceData.description}
                    onChange={(e) => setEditingSpaceData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{currentSpace.description || 'No description'}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isEditingSpace ? (
                  <>
                    <Button
                      onClick={handleSaveSpace}
                      disabled={isSaving}
                      size="sm"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditingSpace(false);
                        setEditingSpaceData({
                          name: currentSpace?.name || '',
                          description: currentSpace?.description || ''
                        });
                      }}
                      disabled={isSaving}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditingSpace(true)}
                    size="sm"
                  >
                    Edit Space
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Space Information */}
          <Card>
            <CardHeader>
              <CardTitle>Space Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Space ID
                  </label>
                  <p className="text-sm text-foreground font-mono">{currentSpace._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Created
                  </label>
                  <p className="text-sm text-foreground">
                    {new Date(currentSpace.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm text-foreground">
                    {new Date(currentSpace.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </label>
                  <p className="text-sm text-foreground">
                    {currentSpace.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Delete Space</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a space, there is no going back. Please be certain.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  size="sm"
                >
                  Delete Space
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Delete Space</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{currentSpace.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSpace}
              >
                Delete Space
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SettingsLayout.displayName = 'SettingsLayout';

export default SettingsLayout;
