import React, { useState } from 'react';
import { Button, Card, CardContent, Badge } from '@taskflow/ui';
import { useToast } from '../../../hooks/useToast';
import type { SpaceTableProps } from './types';

const SpaceTable: React.FC<SpaceTableProps> = ({
  filteredSpaces,
  isLoading,
  error,
  onAddSpace,
  onArchive,
  onUnarchive,
  onPermanentDelete,
  showArchiveActions = true,
  onSpaceClick,
}) => {
  const { success, error: showError } = useToast();
  const [archivingSpace, setArchivingSpace] = useState<string | null>(null);
  const [unarchivingSpace, setUnarchivingSpace] = useState<string | null>(null);
  const [deletingSpace, setDeletingSpace] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleArchive = async (spaceId: string, spaceName: string) => {
    setArchivingSpace(spaceId);
    try {
      await onArchive?.(spaceId);
      success(`"${spaceName}" has been archived successfully`);
    } catch (error) {
      showError(`Failed to archive "${spaceName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setArchivingSpace(null);
    }
  };

  const handleUnarchive = async (spaceId: string, spaceName: string) => {
    setUnarchivingSpace(spaceId);
    try {
      await onUnarchive?.(spaceId);
      success(`"${spaceName}" has been restored successfully`);
    } catch (error) {
      showError(`Failed to restore "${spaceName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUnarchivingSpace(null);
    }
  };

  const handlePermanentDelete = async (spaceId: string, spaceName: string) => {
    setDeletingSpace(spaceId);
    try {
      await onPermanentDelete?.(spaceId);
      success(`"${spaceName}" has been permanently deleted`);
      setShowDeleteConfirm(null);
    } catch (error) {
      showError(`Failed to permanently delete "${spaceName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingSpace(null);
    }
  };

  const formatTimeRemaining = (archiveExpiresAt: string) => {
    const now = new Date();
    const expiresAt = new Date(archiveExpiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ready for deletion';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading spaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-lg mb-2">Error Loading Spaces</div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (filteredSpaces.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No spaces found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {showArchiveActions ? 'Create your first space to start organizing your team\'s work' : 'No archived spaces found'}
        </p>
        {showArchiveActions && onAddSpace && (
          <Button 
            onClick={onAddSpace}
            variant="default"
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Space
          </Button>
        )}
      </div>
    );
  }

  // Safety check to ensure filteredSpaces is an array
  if (!Array.isArray(filteredSpaces)) {
    console.error('filteredSpaces is not an array:', filteredSpaces);
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-lg mb-2">Invalid Data</div>
        <p className="text-muted-foreground">Spaces data is corrupted</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSpaces.map((space) => (
        <Card 
          key={space._id}
          className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground truncate">{space.name}</h4>
                  {space.isArchived && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
                {space.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {space.description}
                  </p>
                )}
              </div>
            </div>

            {/* Space Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>{space.members?.length || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{space.stats?.totalBoards || 0} boards</span>
              </div>
            </div>

            {/* Last Activity */}
            {space.stats?.lastActivityAt && (
              <div className="text-xs text-muted-foreground mb-4">
                Last activity: {new Date(space.stats.lastActivityAt).toLocaleDateString()}
              </div>
            )}

            {/* Archive Expiration Timer for Archived Spaces */}
            {space.isArchived && space.archiveExpiresAt && (
              <div className="text-xs text-orange-600 mb-4 p-2 bg-orange-50 rounded-md border border-orange-200">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Auto-delete in:</span>
                </div>
                <div className="mt-1">
                  {formatTimeRemaining(space.archiveExpiresAt)}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {!space.isArchived ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 mr-2"
                  onClick={() => {
                    // Use the onSpaceClick callback if provided, otherwise fallback to direct navigation
                    if (onSpaceClick) {
                      onSpaceClick(space);
                    } else {
                      window.location.href = `/space`;
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open
                </Button>
              ) : (
                <div className="flex-1 mr-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-2"
                    onClick={() => {
                      // Use the onSpaceClick callback if provided, otherwise fallback to direct navigation
                      if (onSpaceClick) {
                        onSpaceClick(space);
                      } else {
                        window.location.href = `/space`;
                      }
                    }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View
                  </Button>
                </div>
              )}
              
              {showArchiveActions && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (space.isArchived) {
                        handleUnarchive(space._id, space.name);
                      } else {
                        handleArchive(space._id, space.name);
                      }
                    }}
                    disabled={archivingSpace === space._id || unarchivingSpace === space._id}
                    className={`px-3 ${
                      space.isArchived 
                        ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                        : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                    }`}
                  >
                    {archivingSpace === space._id || unarchivingSpace === space._id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : space.isArchived ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restore
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4m0 0l4-4m-4 4V3" />
                        </svg>
                        Archive
                      </>
                    )}
                  </Button>
                  
                  {/* Permanent Delete Button for Archived Spaces */}
                  {space.isArchived && onPermanentDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(space._id)}
                      disabled={deletingSpace === space._id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
                    >
                      {deletingSpace === space._id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
      
      {/* Permanent Delete Confirmation Dialog */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Permanently Delete Space</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              Are you sure you want to permanently delete this space? This will:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Delete all boards in this space</li>
              <li>• Delete all tasks in this space</li>
              <li>• Delete all files and attachments</li>
              <li>• Remove all space data permanently</li>
            </ul>
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This action cannot be undone!
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              disabled={deletingSpace === showDeleteConfirm}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const space = filteredSpaces.find(s => s._id === showDeleteConfirm);
                if (space) {
                  handlePermanentDelete(space._id, space.name);
                }
              }}
              disabled={deletingSpace === showDeleteConfirm}
            >
              {deletingSpace === showDeleteConfirm ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              Permanently Delete
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SpaceTable;
