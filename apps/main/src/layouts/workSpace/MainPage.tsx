import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X, Archive } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useSpaces } from '../../hooks/useSpaces';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Card, CardContent, CardHeader, CardTitle, AvatarWithFallback, Typography, Badge, Input } from '@taskflow/ui';
import InviteSection from '../../components/workspace/main_page/InviteSection';
import InfoBanner from '../../components/workspace/main_page/InfoBanner';

import ConfirmRemoveMemberDialog from '../../components/workspace/main_page/ConfirmRemoveMemberDialog';
import { GitHubOrgBadge } from '../../components/common/GitHubOrgBadge';
import RulesModal from '../../components/workspace/RulesModal';
import type { Workspace, UpdateWorkspaceData } from '../../types/workspace.types';

interface MainPageProps {
  currentWorkspace: Workspace;
}

const MainPage: React.FC<MainPageProps> = React.memo(({ currentWorkspace }) => {
  const dispatch = useAppDispatch();
  const workspaceId = currentWorkspace?._id;
  const { isAuthenticated, token, user } = useAuth();
  const { success, error: showError, warning } = useToast();
  const navigate = useNavigate();

  // Workspace data
  const {
    members,
    loading,
    error: apiError,
    removeWorkspaceMember,
    updateMemberRole,
    transferOwnership,
    createInviteLink,
    inviteNewMember,
    updateWorkspaceData,
    uploadWorkspaceAvatar,
    removeWorkspaceAvatar,
    refetchWorkspaces,
    loadWorkspace
  } = useWorkspace({
    autoFetch: true, // Let the hook handle data loading
    workspaceId
  });

  // Spaces data
  const {
    loading: spacesLoading,
    error: spacesError,
    loadSpacesByWorkspace,
    getActiveSpacesByWorkspace,
    clearSpacesData,
    retryLoadSpaces,
    addSpace,
    archiveSpaceById,
    permanentDeleteSpaceById,
    activeSpaces: allActiveSpaces
  } = useSpaces();

  // Space manager for handling space selection
  const { selectSpace } = useSpaceManager();

  // Tasks data
  const { tasks, loading: tasksLoading } = useTasks();

  // Manual retry handler
  const handleRetry = useCallback(() => {
    if (workspaceId) {
      if (spacesError) {
        retryLoadSpaces(workspaceId);
      } else {
        // For other errors, reload the page
        window.location.reload();
      }
    }
  }, [workspaceId, spacesError, retryLoadSpaces]);

  // Local UI state
  const [search, setSearch] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    role: string;
    name: string;
  } | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [transferOwnershipMember, setTransferOwnershipMember] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Workspace editing state
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [editingWorkspaceData, setEditingWorkspaceData] = useState<UpdateWorkspaceData>({
    name: currentWorkspace?.name || '',
    description: currentWorkspace?.description || ''
  });

  // Rules modal state
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Space creation state
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');

  // Space deletion state
  const [isDeleteSpaceOpen, setIsDeleteSpaceOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<{ id: string; name?: string } | null>(null);

  // Get current user's role in this workspace from Redux state
  const currentUserRole = useMemo(() => {
    // Check if current user is the workspace owner
    if (currentWorkspace?.owner?._id === user?._id) {
      return 'owner';
    }
    // Otherwise use the userRole from Redux state
    return (currentWorkspace as any)?.userRole || null;
  }, [currentWorkspace?.owner?._id, user?._id, (currentWorkspace as any)?.userRole]);

  // Check if user can edit workspace (owner or admin)
  const canEditWorkspace = useMemo(() => {
    return currentUserRole === 'owner' || currentUserRole === 'admin';
  }, [currentUserRole]);

  // Transform WorkspaceMember to Member type for MembersTable
  const transformedMembers = useMemo(() => {
    if (!members) return [];
    return members.map(member => {
      // Check if this member is the workspace owner
      const isOwner = currentWorkspace?.owner?._id === member.user?._id;
      
      return {
        id: member.user?._id || member.user, // Use the actual user ID as string, not the member record ID
      name: member.user?.name || 'Unknown User',
      handle: member.user?.email?.split('@')[0] || 'user',
      email: member.user?.email || 'No email',
        role: isOwner ? 'owner' : member.role, // Show owner role for workspace owner
      status: 'active' as const, // Default to active since workspace members are active
      lastActive: member.joinedAt ? 
        (typeof member.joinedAt === 'string' ? member.joinedAt : member.joinedAt.toISOString()) : 
        'Never'
      };
    });
  }, [members, currentWorkspace?.owner]);

  // Filtered and sorted data
  const filteredMembers = useMemo(() => {
    if (!transformedMembers) return [];
    
    // Filter by search only
    const filtered = transformedMembers.filter(member => {
      const memberName = member.name || '';
      const memberEmail = member.email || '';
      const matchesSearch = search === '' ||
        memberName.toLowerCase().includes(search.toLowerCase()) ||
        memberEmail.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });

    // Sort by role priority: owner > admin > member > viewer
    return filtered.sort((a, b) => {
      const rolePriority = { owner: 4, admin: 3, member: 2, viewer: 1 };
      const aPriority = rolePriority[a.role as keyof typeof rolePriority] || 0;
      const bPriority = rolePriority[b.role as keyof typeof rolePriority] || 0;
      return bPriority - aPriority;
    });
  }, [transformedMembers, search]);

  // Get active spaces for the workspace
  const activeSpaces = useMemo(() => {
    if (!workspaceId || !allActiveSpaces) return [];
    
    // Try different possible field names for workspace reference
    const filtered = allActiveSpaces.filter(space => {
      // Handle both string and object workspace references
      let spaceWorkspaceId: string | undefined;
      
      if (typeof space.workspace === 'string') {
        spaceWorkspaceId = space.workspace;
      } else if (space.workspace && typeof space.workspace === 'object') {
        spaceWorkspaceId = (space.workspace as any)._id || (space.workspace as any).id;
      }
      
      return spaceWorkspaceId === workspaceId;
    });
    
    console.log('MainPage - activeSpaces computed:', {
      workspaceId,
      allActiveSpacesLength: allActiveSpaces.length,
      filteredLength: filtered.length,
      allActiveSpaces: allActiveSpaces,
      filtered: filtered,
      spaceWorkspaceIds: allActiveSpaces.map(s => ({ 
        id: s._id, 
        workspace: s.workspace, 
        workspaceObject: s.workspace,
        workspaceId
      }))
    });
    return filtered;
  }, [workspaceId, allActiveSpaces]);

  // Urgent tasks count
  const urgentTasksCount = useMemo(() => {
    if (!tasks) return 0;
    return tasks.filter(task =>
      task.priority && (task.priority === 'high' || task.priority === 'critical')
    ).length;
  }, [tasks]);

  // Real-time workspace event listeners

  // Handlers
  const handleRemoveMember = useCallback(async (memberId: string, _role: string, _password: string) => {
    try {
      if (!workspaceId) throw new Error('Workspace ID is required');
      
      // Check if member still exists in the current members list
      const memberExists = members?.some(member => 
        member.user?._id === memberId || member.user === memberId
      );
      
      if (!memberExists) {
        console.log('Member not found in current members list, skipping removal');
        setMemberToRemove(null);
        success('Member is no longer in the workspace');
        return;
      }
      
      console.log('Removing member with ID:', memberId, 'Type:', typeof memberId);
      await removeWorkspaceMember(memberId);
      setMemberToRemove(null);
      success('Member removed successfully!');
      
      // Refresh workspace data to get updated member list
      refetchWorkspaces();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `Failed to remove member: ${error.message}`
        : 'Failed to remove member: Unknown error';
      throw new Error(errorMessage);
    }
  }, [workspaceId, removeWorkspaceMember, success, members]);

  const handleGenerateInvite = useCallback(async () => {
    try {
      const result = await createInviteLink();
      return result;
    } catch (error) {
      throw error;
    }
  }, [createInviteLink]);


  const handleRoleChange = useCallback(async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole);
      setEditingMemberId(null);
      success(`Member role updated to ${newRole} successfully!`);
      
      // Refresh workspace data to get updated member list
      refetchWorkspaces();
    } catch (error) {
      console.error('Failed to change member role:', error);
      showError(`Failed to update member role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [updateMemberRole, success, showError, refetchWorkspaces]);

  const handleTransferOwnership = useCallback(async (newOwnerId: string) => {
    try {
      await transferOwnership(newOwnerId);
      setTransferOwnershipMember(null);
      success('Workspace ownership transferred successfully!');
      
      // Refresh workspace data to get updated member list
      refetchWorkspaces();
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      showError(`Failed to transfer ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [transferOwnership, success, showError, refetchWorkspaces]);

  // Workspace editing handlers
  const handleEditWorkspace = useCallback(() => {
    setEditingWorkspaceData({
      name: currentWorkspace?.name || '',
      description: currentWorkspace?.description || ''
    });
    setIsEditingWorkspace(true);
  }, [currentWorkspace]);

  const handleSaveWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      await updateWorkspaceData(workspaceId, editingWorkspaceData);
      setIsEditingWorkspace(false);
      // The Redux state will automatically update the currentWorkspace
      // No need to manually update or reload
    } catch (error) {
      console.error('Failed to update workspace:', error);
    }
  }, [workspaceId, editingWorkspaceData, updateWorkspaceData]);

  const handleCancelEditWorkspace = useCallback(() => {
    setIsEditingWorkspace(false);
    setEditingWorkspaceData({
      name: currentWorkspace?.name || '',
      description: currentWorkspace?.description || ''
    });
  }, [currentWorkspace]);

  // Avatar upload handlers
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!workspaceId) return;
    
    setIsUploadingAvatar(true);
    try {
      await uploadWorkspaceAvatar(workspaceId, file);
      success('Workspace avatar updated successfully!');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showError(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [workspaceId, uploadWorkspaceAvatar]);

  const handleAvatarRemove = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      await removeWorkspaceAvatar(workspaceId);
      success('Workspace avatar removed successfully!');
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      showError(`Failed to remove avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [workspaceId, removeWorkspaceAvatar]);

  const handleAvatarFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
      }
      handleAvatarUpload(file);
    }
  }, [handleAvatarUpload]);

  // Space creation handlers
  const handleCreateSpace = useCallback(async () => {
    if (!newSpaceName.trim() || !workspaceId) return;
    
    // Check if user has permission to create spaces
    if (!canEditWorkspace) {
      showError('Only workspace owners and admins can create spaces');
      return;
    }
    
    try {
      console.log('MainPage - Creating space:', {
        name: newSpaceName.trim(),
        workspaceId: workspaceId,
        allActiveSpacesBefore: allActiveSpaces
      });
      
      await addSpace({
        name: newSpaceName.trim(),
        description: '',
        workspaceId: workspaceId
      });
      
      console.log('MainPage - Space created, allActiveSpaces after:', allActiveSpaces);
      
      setNewSpaceName('');
      setIsCreatingSpace(false);
      success('Space created successfully!');
    } catch (error: any) {
      console.error('Failed to create space:', error);
      
      // Handle specific error messages with user-friendly messages
      if (error?.response?.data?.message) {
        const serverMessage = error.response.data.message;
        
        // Check for space limit error
        if (serverMessage.includes('space limit') || serverMessage.includes('limit reached')) {
          // Use warning variant for space limit to make it less alarming
          warning(
            'You\'ve reached your workspace space limit. Upgrade to Premium to create unlimited spaces and unlock advanced features.',
            'Space Limit Reached'
          );
        } else {
          showError(serverMessage);
        }
      } else if (error?.message) {
        showError(error.message);
      } else {
        showError('Failed to create space. Please try again.');
      }
      setNewSpaceName('');
      setIsCreatingSpace(false);
    }
  }, [newSpaceName, workspaceId, addSpace, allActiveSpaces, success, showError, canEditWorkspace]);

  const handleCancelCreateSpace = useCallback(() => {
    setNewSpaceName('');
    setIsCreatingSpace(false);
  }, []);

  // Space archive and delete handlers
  const handleArchiveSpace = useCallback(async (spaceId: string) => {
    // Check if user has permission to archive spaces
    if (!canEditWorkspace) {
      showError('Only workspace owners and admins can archive spaces');
      return;
    }
    
    try {
      await archiveSpaceById(spaceId);
      success('Space archived successfully!');
    } catch (error) {
      console.error('Failed to archive space:', error);
      showError('Failed to archive space');
    }
  }, [archiveSpaceById, success, showError, canEditWorkspace]);

  const handleDeleteSpace = useCallback(async (spaceId: string) => {
    // Check if user has permission to delete spaces
    if (!canEditWorkspace) {
      showError('Only workspace owners and admins can delete spaces');
      return;
    }
    
    try {
      // First archive the space, then permanently delete it
      await archiveSpaceById(spaceId);
      await permanentDeleteSpaceById(spaceId);
      setSpaceToDelete(null);
      setIsDeleteSpaceOpen(false);
      success('Space deleted permanently!');
    } catch (error) {
      console.error('Failed to delete space:', error);
      showError('Failed to delete space');
    }
  }, [archiveSpaceById, permanentDeleteSpaceById, success, showError, canEditWorkspace]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingMemberId && !(event.target as Element).closest('.member-dropdown')) {
      setEditingMemberId(null);
    }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingMemberId]);

  // Clear spaces data when workspace changes
  React.useEffect(() => {
    if (workspaceId) {
      // Clear any previous spaces data to prevent conflicts
      clearSpacesData();
    }
  }, [workspaceId, clearSpacesData]);


  // Load spaces when workspace changes - only for overview display
  React.useEffect(() => {
    if (workspaceId) {
      // Only load spaces if we're going to display them
      // This prevents conflicts with SpacesLayout
      loadSpacesByWorkspace(workspaceId);
    }
  }, [workspaceId, loadSpacesByWorkspace]);

  // Show error toasts when errors occur
  React.useEffect(() => {
    if (apiError) {
      // Check if it's a space limit error
      if (apiError.includes('space limit') || apiError.includes('limit reached')) {
        warning(
          'You\'ve reached your workspace space limit. Upgrade to Premium to create unlimited spaces and unlock advanced features.',
          'Space Limit Reached'
        );
      } else {
        showError(`Workspace error: ${apiError}`);
      }
    }
    if (spacesError) {
      // Check if it's a space limit error
      if (spacesError.includes('space limit') || spacesError.includes('limit reached')) {
        warning(
          'You\'ve reached your workspace space limit. Upgrade to Premium to create unlimited spaces and unlock advanced features.',
          'Space Limit Reached'
        );
      } else {
        showError(`Spaces error: ${spacesError}`);
      }
    }
  }, [apiError, spacesError, showError, warning]);

  // Authentication check
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Authentication Required</div>
          <p className="text-muted-foreground mb-4">Please log in to access this workspace.</p>
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
  if (loading || spacesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-muted-foreground text-xl mb-2">No workspace selected</div>
          <p className="text-muted-foreground">Please select a workspace to continue</p>
          <p className="text-sm text-muted-foreground mt-2">URL should contain ?id=workspaceId</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-muted-foreground text-xl mb-2">No workspace found</div>
          <p className="text-muted-foreground">Workspace with ID "{workspaceId}" not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
             {/* Enhanced Header with Workspace Info */}
       <div className="border-b bg-gradient-to-r from-muted/50 to-muted">
         <div className="container mx-auto px-6 py-4">
           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                 <div className="flex items-center gap-2 ml-auto">
                   <Button
                     onClick={() => setIsRulesModalOpen(true)}
                     variant="ghost"
                     size="sm"
                     className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                   >
                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     Rules
                   </Button>
                   {canEditWorkspace && (
                     <Button
                       onClick={handleEditWorkspace}
                       variant="ghost"
                       size="sm"
                       className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                     >
                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                       Edit
                     </Button>
                   )}
                 </div>
               </div>
               
               {/* Workspace Avatar and Name */}
               <div className="flex items-center gap-4 mb-3">
                 <div className="relative group">
                   <AvatarWithFallback
                     src={currentWorkspace.avatar}
                     alt={currentWorkspace.name}
                     size="xl"
                     variant="rounded"
                     className="border-2 border-border shadow-lg"
                   />
                   {canEditWorkspace && (
                     <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                       <div className="flex gap-2">
                         <input
                           type="file"
                           accept="image/*"
                           onChange={handleAvatarFileSelect}
                           className="hidden"
                           id="avatar-upload"
                           disabled={isUploadingAvatar}
                         />
                         <label
                           htmlFor="avatar-upload"
                           className="cursor-pointer p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                           title="Upload avatar"
                         >
                           {isUploadingAvatar ? (
                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           ) : (
                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                           )}
                         </label>
                         {currentWorkspace.avatar && (
                           <button
                             onClick={handleAvatarRemove}
                             className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                             title="Remove avatar"
                           >
                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                           </button>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
                 <div>
                   <h1 className="text-2xl font-bold text-foreground mb-1">
                     {currentWorkspace.name}
                   </h1>
                 </div>
               </div>
               <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                 {currentWorkspace.description || 'Collaborate, organize, and achieve your team goals together.'}
               </p>
               
               {/* GitHub Organization Badge */}
               {currentWorkspace.githubOrg && (
                 <div className="mt-3">
                   <GitHubOrgBadge workspace={currentWorkspace} />
                 </div>
               )}
               
               <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                 <span>Created {new Date(currentWorkspace.createdAt).toLocaleDateString('en-US', {
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric'
                 })}</span>
                 <span>•</span>
                 <span>{workspaceId ? getActiveSpacesByWorkspace(workspaceId).length : 0} active spaces</span>
                 <span>•</span>
                 <span>{members?.length || 0} members</span>
               </div>
             </div>
             
           </div>
         </div>
       </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content - Spaces Focus */}
          <div className="xl:col-span-3 space-y-8">
            {/* Info Banner */}
            <InfoBanner workspaceId={currentWorkspace._id} />

            {/* Error Banner - Non-blocking */}
            {(apiError || spacesError) && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-destructive">Error Loading Data</h3>
                        <p className="text-sm text-muted-foreground">
                          {apiError || spacesError}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

                         {/* Quick Stats Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
               <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
                 <CardHeader className="flex justify-between pb-1">
                   <CardTitle className="text-xs font-medium text-muted-foreground">Total Members</CardTitle>
                   <svg className="h-3 w-3 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                   </svg>
                 </CardHeader>
                 <CardContent>
                   <Typography variant="h2" className="text-base font-bold mb-1">{members?.length || 0}</Typography>
                   <Typography variant="caption" className="text-xs text-muted-foreground">Team members</Typography>
                 </CardContent>
               </Card>
               
               <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
                 <CardHeader className="flex justify-between pb-1">
                   <CardTitle className="text-xs font-medium text-muted-foreground">Active Spaces</CardTitle>
                   <svg className="h-3 w-3 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                 </CardHeader>
                 <CardContent>
                   <Typography variant="h2" className="text-base font-bold mb-1">{workspaceId ? getActiveSpacesByWorkspace(workspaceId).length : 0}</Typography>
                   <Typography variant="caption" className="text-xs text-muted-foreground">Workspace spaces</Typography>
                 </CardContent>
               </Card>
               
               <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
                 <CardHeader className="flex justify-between pb-1">
                   <CardTitle className="text-xs font-medium text-muted-foreground">Urgent Tasks</CardTitle>
                   <svg className="h-3 w-3 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                 </CardHeader>
                 <CardContent>
                   <Typography variant="h2" className="text-base font-bold mb-1 text-destructive">
                     {tasksLoading ? '...' : urgentTasksCount}
                   </Typography>
                   <Typography variant="caption" className="text-xs text-muted-foreground">Requires attention</Typography>
                 </CardContent>
               </Card>
               
               <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
                 <CardHeader className="flex justify-between pb-1">
                   <CardTitle className="text-xs font-medium text-muted-foreground">Total Tasks</CardTitle>
                   <svg className="h-3 w-3 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                   </svg>
                 </CardHeader>
                 <CardContent>
                   <Typography variant="h2" className="text-base font-bold mb-1">
                     {tasksLoading ? '...' : (tasks?.length || 0)}
                   </Typography>
                   <Typography variant="caption" className="text-xs text-muted-foreground">All tasks</Typography>
                 </CardContent>
               </Card>
             </div>

            {/* Spaces Section - Overview */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Workspace Spaces</h2>
                  <p className="text-muted-foreground mt-1">Organize your work into focused spaces for better collaboration</p>
                </div>
                {/* Only show create button for active spaces, not archived ones */}
                {activeSpaces.length >= 0 && (
                  <>
                    {!isCreatingSpace ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreatingSpace(true)}
                        className="ml-2 flex items-center gap-1.5 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 h-7 px-2 transition-all duration-200 hover:scale-105"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="text-xs">New Space</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 ml-2">
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Enter space name..."
                            value={newSpaceName}
                            onChange={(e) => setNewSpaceName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateSpace();
                              if (e.key === 'Escape') handleCancelCreateSpace();
                            }}
                            className="h-7 w-48 text-xs border-dashed border-2 border-accent/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
                            autoFocus
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCreateSpace}
                          disabled={!newSpaceName.trim()}
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                          title="Create space"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelCreateSpace}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Spaces Overview */}
              {activeSpaces.length === 0 ? (
                <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors duration-200">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No spaces yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first space to start organizing your team's work and projects
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 grid-cols-4">
                  {activeSpaces.slice(0, 4).map((space) => (
                    <div
                      key={space._id}
                      className="relative overflow-hidden group border rounded-md p-3 cursor-pointer flex flex-col ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.06)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.12)] transition-all"
                      onClick={() => {
                        selectSpace(space);
                        navigate('/space');
                      }}
                    >
                      {/* Header with icon, name and action buttons */}
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: `${(space as any).color || '#3B82F6'}20` }}
                        >
                          {(space as any).icon || '🏠'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography variant="body-medium" className="font-medium text-sm text-foreground truncate" title={space.name}>
                            {space.name}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 hover:bg-amber-50 h-6 w-6 p-0 -mt-1 -mr-1 flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); handleArchiveSpace(space._id); }}
                            title="Archive space"
                            aria-label="Archive space"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {space.description && (
                        <div className="mb-3">
                          <Typography variant="caption" className="text-muted-foreground text-xs line-clamp-2">
                            {space.description}
                          </Typography>
                        </div>
                      )}

                      {/* Badges row */}
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                          {space.members?.length || 0} members
                        </Badge>
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200">
                          {space.stats?.totalBoards || 0} boards
                        </Badge>
                      </div>

                      {/* Footer with last activity */}
                      <div className="mt-auto">
                        <Typography variant="caption" className="text-muted-foreground text-xs">
                          {space.stats?.lastActivityAt 
                            ? `Last activity ${new Date(space.stats.lastActivityAt).toLocaleDateString()}`
                            : 'No recent activity'
                          }
                        </Typography>
                      </div>
                    </div>
                  ))}
                  
                  {activeSpaces.length > 4 && (
                    <div
                      className="relative overflow-hidden group border rounded-md p-3 cursor-pointer flex flex-col ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.06)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.12)] transition-all"
                      onClick={() => navigate(`/workspace/${workspaceId}/spaces`)}
                    >
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <Typography variant="body-small" className="font-medium text-foreground mb-1">View All</Typography>
                          <Typography variant="caption" className="text-xs text-muted-foreground">+{activeSpaces.length - 4} more</Typography>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 flex flex-col h-fit">
                         {/* Invite Section */}
             {workspaceId && currentWorkspace && (
               <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm hover:shadow-md transition-shadow duration-200">
                 <CardContent className="p-6">
                   <InviteSection
                     onGenerateInvite={handleGenerateInvite}
                     onInviteUser={inviteNewMember}
                     workspace={currentWorkspace}
                   />
                 </CardContent>
               </Card>
             )}

             {/* Simple Team Members List */}
             <div className="bg-white border border-gray-200 rounded-lg p-4">
               <h3 className="text-lg font-semibold mb-4">Team Members</h3>
               
               {/* Search */}
               <div className="mb-4">
                   <input
                     type="text"
                     placeholder="Search members..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 </div>

               {/* Members List */}
               <div className="space-y-2">
                 {filteredMembers.map((member) => (
                   <div key={member.id} data-member-id={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                             <div className="flex items-center gap-2">
                       <span className="text-sm font-medium">{member.name}</span>
                       
                       {/* Role Badge */}
                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                member.role === 'owner' 
                           ? 'bg-orange-100 text-orange-700'
                                  : member.role === 'admin'
                           ? 'bg-blue-100 text-blue-700'
                                  : member.role === 'member'
                           ? 'bg-green-100 text-green-700'
                           : 'bg-gray-100 text-gray-700'
                              }`}>
                                {member.role}
                              </span>
                       
                       {/* "You" indicator */}
                       {member.id === user?._id && (
                         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                           You
                         </span>
                       )}
                          </div>
                          
                     {/* Simple Dropdown */}
                           {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                       <div className="relative member-dropdown">
                                       <button
                           onClick={() => setEditingMemberId(editingMemberId === member.id ? null : member.id)}
                           className="p-1 hover:bg-gray-200 rounded"
                                       >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                           </svg>
                                       </button>
                         
                         {/* Smart Dropdown Menu */}
                         {editingMemberId === member.id && (
                           <div 
                             className="absolute right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32"
                             style={{
                               top: (() => {
                                 const button = document.querySelector(`[data-member-id="${member.id}"] .member-dropdown button`);
                                 if (button) {
                                   const rect = button.getBoundingClientRect();
                                   const viewportHeight = window.innerHeight;
                                   const dropdownHeight = 120; // Approximate dropdown height
                                   const spaceBelow = viewportHeight - rect.bottom;
                                   
                                   // If not enough space below, position above
                                   if (spaceBelow < dropdownHeight) {
                                     return `${-dropdownHeight - 8}px`;
                                   }
                                 }
                                 return '32px'; // Default position below
                               })()
                             }}
                           >
                             <div className="py-1">
                               {/* Change to Admin - More prominent option */}
                                     {(currentUserRole === 'owner' || currentUserRole === 'admin') && member.role === 'member' && member.id !== user?._id && (
                                       <button
                                         onClick={() => {
                                     handleRoleChange(member.id, 'admin');
                                           setEditingMemberId(null);
                                         }}
                                   className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-green-600 font-medium"
                                       >
                                         Change to Admin
                                       </button>
                                       )}
                                     
                               {/* Demote to Member */}
                                     {(currentUserRole === 'owner' || currentUserRole === 'admin') && member.role === 'admin' && member.id !== user?._id && (
                                       <button
                                         onClick={() => {
                                     handleRoleChange(member.id, 'member');
                                           setEditingMemberId(null);
                                         }}
                                   className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-orange-600"
                                       >
                                         Change to Member
                                       </button>
                                     )}
                                     
                               {/* Demote Owner to Member (Owner only) */}
                                     {currentUserRole === 'owner' && member.role === 'owner' && member.id !== user?._id && (
                                       <button
                                   onClick={() => {
                                     handleRoleChange(member.id, 'member');
                                     setEditingMemberId(null);
                                   }}
                                   className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                                       >
                                         Demote to Member
                                       </button>
                                     )}
                                     
                               {/* Transfer Ownership */}
                                     {currentUserRole === 'owner' && member.id !== user?._id && (
                                       <button
                                         onClick={() => {
                                           setTransferOwnershipMember({ id: member.id, name: member.name });
                                           setEditingMemberId(null);
                                         }}
                                   className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-blue-600"
                                       >
                                         Transfer Ownership
                                       </button>
                                     )}
                                     
                               {/* Remove Member */}
                                     {(currentUserRole === 'owner' || currentUserRole === 'admin') && member.id !== user?._id && (
                                     <button
                                 onClick={() => {
                                   setMemberToRemove({ id: member.id, role: member.role, name: member.name });
                                   setEditingMemberId(null);
                                 }}
                                 className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                               >
                                 Remove Member
                                     </button>
                                     )}
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                        </div>
                      ))}
                        </div>
                    </div>

            
          </div>
        </div>
      </div>

                           {/* Modals */}
        <ConfirmRemoveMemberDialog
         isOpen={!!memberToRemove}
         onClose={() => setMemberToRemove(null)}
         memberName={memberToRemove?.name || ''}
         isOwner={memberToRemove?.role === 'owner'}
         onConfirm={async (password: string) => {
           if (!memberToRemove) return;
           try {
             await handleRemoveMember(memberToRemove.id, memberToRemove.role, password);
             // Success handling
           } catch (error) {
             const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
             // Re-throw the error to be handled by the dialog component
             throw new Error(errorMessage);
           }
         }}
       />

       {/* Ownership Transfer Confirmation Dialog */}
       {transferOwnershipMember && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
             <h3 className="text-lg font-semibold text-foreground mb-4">Transfer Ownership</h3>
             <p className="text-muted-foreground mb-6">
               Are you sure you want to transfer ownership of this workspace to{' '}
               <span className="font-medium text-foreground">{transferOwnershipMember.name}</span>?
               This action cannot be undone.
             </p>
             <div className="flex gap-3 justify-end">
               <Button
                 variant="outline"
                 onClick={() => setTransferOwnershipMember(null)}
               >
                 Cancel
               </Button>
               <Button
                 variant="destructive"
                 onClick={() => {
                   handleTransferOwnership(transferOwnershipMember.id);
                 }}
               >
                 Transfer Ownership
               </Button>
             </div>
           </div>
         </div>
       )}

       {/* Workspace Edit Modal */}
       {isEditingWorkspace && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4">
             <div className="p-6">
               <h3 className="text-lg font-semibold text-foreground mb-4">Edit Workspace</h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-foreground mb-2">
                     Workspace Name
                   </label>
                   <input
                     type="text"
                     value={editingWorkspaceData.name}
                     onChange={(e) => setEditingWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                     className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                     placeholder="Enter workspace name"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-foreground mb-2">
                     Description
                   </label>
                   <textarea
                     value={editingWorkspaceData.description || ''}
                     onChange={(e) => setEditingWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                     className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                     rows={3}
                     placeholder="Enter workspace description"
                   />
                 </div>
               </div>
               
               <div className="flex gap-3 mt-6">
                 <Button
                   onClick={handleSaveWorkspace}
                   variant="default"
                   size="sm"
                   className="flex-1"
                 >
                   Save Changes
                 </Button>
                 <Button
                   onClick={handleCancelEditWorkspace}
                   variant="outline"
                   size="sm"
                   className="flex-1"
                 >
                   Cancel
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Rules Modal */}
       <RulesModal
         isOpen={isRulesModalOpen}
         onClose={() => setIsRulesModalOpen(false)}
         workspace={currentWorkspace}
         currentUserRole={currentUserRole}
       />

       {/* Space Delete Confirmation Modal */}
       {isDeleteSpaceOpen && spaceToDelete && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
             <h3 className="text-lg font-semibold text-foreground mb-4">Delete Space Permanently</h3>
             <p className="text-muted-foreground mb-6">
               Are you sure you want to permanently delete the space{' '}
               <span className="font-medium text-foreground">"{spaceToDelete.name}"</span>?
               This action cannot be undone and will remove all data associated with this space.
             </p>
             <div className="flex gap-3 justify-end">
               <Button
                 variant="outline"
                 onClick={() => {
                   setSpaceToDelete(null);
                   setIsDeleteSpaceOpen(false);
                 }}
               >
                 Cancel
               </Button>
               <Button
                 variant="destructive"
                 onClick={() => handleDeleteSpace(spaceToDelete.id)}
               >
                 Delete Permanently
               </Button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 });

export default MainPage;