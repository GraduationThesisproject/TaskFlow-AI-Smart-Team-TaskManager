import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useSpaces } from '../../hooks/useSpaces';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Card, CardContent, CardHeader, CardTitle, AvatarWithFallback } from '@taskflow/ui';
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
  const workspaceId = currentWorkspace?._id;
  const { isAuthenticated, token } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  // Workspace data
  const {
    members,
    loading,
    error: apiError,
    removeWorkspaceMember,
    createInviteLink,
    inviteNewMember,
    updateWorkspaceData,
    uploadWorkspaceAvatar,
    removeWorkspaceAvatar
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
    retryLoadSpaces
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
  const [role, setRole] = useState('all');
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

  // Get current user's role in this workspace from Redux state
  const currentUserRole = useMemo(() => {
    // The Redux state already contains userRole for the current user
    // Using type assertion since the backend response includes these properties
    return (currentWorkspace as any)?.userRole || null;
  }, [currentWorkspace?._id, (currentWorkspace as any)?.userRole]);

  // Check if user can edit workspace (owner or admin)
  const canEditWorkspace = useMemo(() => {
    return currentUserRole === 'owner' || currentUserRole === 'admin';
  }, [currentUserRole]);

  // Transform WorkspaceMember to Member type for MembersTable
  const transformedMembers = useMemo(() => {
    if (!members) return [];
    return members.map(member => ({
      id: (member as any)._id || member.id || member.userId,
      name: member.user?.name || 'Unknown User',
      handle: member.user?.email?.split('@')[0] || 'user',
      email: member.user?.email || 'No email',
      role: member.role,
      status: 'active' as const, // Default to active since workspace members are active
      lastActive: member.joinedAt ? 
        (typeof member.joinedAt === 'string' ? member.joinedAt : member.joinedAt.toISOString()) : 
        'Never'
    }));
  }, [members]);

  // Filtered and sorted data
  const filteredMembers = useMemo(() => {
    if (!transformedMembers) return [];
    
    // First filter by search and role
    const filtered = transformedMembers.filter(member => {
      const memberName = member.name || '';
      const memberEmail = member.email || '';
      const matchesSearch = search === '' ||
        memberName.toLowerCase().includes(search.toLowerCase()) ||
        memberEmail.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === 'all' || member.role?.toLowerCase() === role.toLowerCase();
      return matchesSearch && matchesRole;
    });

    // Then sort by role priority: owner > admin > member > viewer
    return filtered.sort((a, b) => {
      const rolePriority = { owner: 4, admin: 3, member: 2, viewer: 1 };
      const aPriority = rolePriority[a.role as keyof typeof rolePriority] || 0;
      const bPriority = rolePriority[b.role as keyof typeof rolePriority] || 0;
      return bPriority - aPriority;
    });
  }, [transformedMembers, search, role]);

  // Get active spaces for the workspace
  const activeSpaces = useMemo(() => {
    if (!workspaceId) return [];
    return getActiveSpacesByWorkspace(workspaceId);
  }, [workspaceId, getActiveSpacesByWorkspace]);

  // Urgent tasks count
  const urgentTasksCount = useMemo(() => {
    if (!tasks) return 0;
    return tasks.filter(task =>
      task.priority && (task.priority === 'high' || task.priority === 'critical')
    ).length;
  }, [tasks]);

  // Handlers
  const handleRemoveMember = useCallback(async (memberId: string, _role: string, _password: string) => {
    try {
      if (!workspaceId) throw new Error('Workspace ID is required');
      await removeWorkspaceMember(memberId);
      setMemberToRemove(null);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `Failed to remove member: ${error.message}`
        : 'Failed to remove member: Unknown error';
      throw new Error(errorMessage);
    }
  }, [workspaceId, removeWorkspaceMember]);

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
      // Here you would call your API to change the member's role
      // For now, we'll just close the editing state
      console.log(`Changing role for member ${memberId} to ${newRole}`);
      setEditingMemberId(null);
      // You can add the actual API call here
      // await changeMemberRole(memberId, newRole);
    } catch (error) {
      console.error('Failed to change member role:', error);
    }
  }, []);

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

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (editingMemberId && !(event.target as Element).closest('.role-dropdown')) {
      setEditingMemberId(null);
    }
  }, [editingMemberId]);

  // Add click outside listener
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

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

  // Error state
  if (apiError || spacesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Error Loading Workspace</div>
          <p className="text-muted-foreground mb-4">{apiError || spacesError}</p>
          <Button
            onClick={handleRetry}
            variant="default"
            size="sm"
          >
            Retry
          </Button>
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
               <div className="mt-3">
                 <GitHubOrgBadge workspace={currentWorkspace} />
               </div>
               
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

                         {/* Quick Stats Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <Card className="hover:shadow-md transition-shadow duration-200">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm font-medium text-muted-foreground mb-1">Total Members</p>
                       <p className="text-2xl font-bold">{members?.length || 0}</p>
                     </div>
                     <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                       </svg>
                     </div>
                   </div>
                 </CardContent>
               </Card>
               
               <Card className="hover:shadow-md transition-shadow duration-200">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm font-medium text-muted-foreground mb-1">Active Spaces</p>
                       <p className="text-2xl font-bold">{workspaceId ? getActiveSpacesByWorkspace(workspaceId).length : 0}</p>
                     </div>
                     <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                       </svg>
                     </div>
                   </div>
                 </CardContent>
               </Card>
               
               <Card className="hover:shadow-md transition-shadow duration-200">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm font-medium text-muted-foreground mb-1">Urgent Tasks</p>
                       <p className="text-2xl font-bold text-destructive">
                         {tasksLoading ? '...' : urgentTasksCount}
                       </p>
                     </div>
                     <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                       </svg>
                     </div>
                   </div>
                 </CardContent>
               </Card>
               
               <Card className="hover:shadow-md transition-shadow duration-200">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</p>
                       <p className="text-2xl font-bold">
                         {tasksLoading ? '...' : (tasks?.length || 0)}
                       </p>
                     </div>
                     <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                       </svg>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>

            {/* Spaces Section - Overview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Workspace Spaces</h2>
                  <p className="text-muted-foreground mt-1">Organize your work into focused spaces for better collaboration</p>
                </div>
                <Button 
                  onClick={() => navigate(`/workspace/spaces`)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Manage Spaces
                </Button>
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
                    <Button 
                      onClick={() => navigate(`/workspace/${workspaceId}/spaces`)}
                      variant="default"
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Your First Space
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSpaces.slice(0, 6).map((space) => (
                    <Card 
                      key={space._id}
                      className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20 cursor-pointer"
                      onClick={() => {
                        selectSpace(space);
                        navigate('/space');
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate mb-2">{space.name}</h4>
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
                          <div className="text-xs text-muted-foreground">
                            Last activity: {new Date(space.stats.lastActivityAt).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {activeSpaces.length > 6 && (
                    <Card className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20 cursor-pointer">
                      <CardContent className="p-6 flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">View All Spaces</p>
                          <p className="text-xs text-muted-foreground">+{activeSpaces.length - 6} more</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
                         {/* Invite Section */}
             {workspaceId && currentWorkspace && (
               <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm hover:shadow-md transition-shadow duration-200">
                 <CardContent className="p-6">
                   <InviteSection
                     onGenerateInvite={handleGenerateInvite}
                     onInviteUser={inviteNewMember}
                   />
                 </CardContent>
               </Card>
             )}

             {/* Team Members Section - Compact */}
             <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
               <CardHeader className="pb-4">
                 <div className="flex items-center justify-between">
                   <CardTitle className="text-lg font-semibold text-foreground">Team Members</CardTitle>
                   <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                     {filteredMembers.length}
                   </span>
                 </div>
               </CardHeader>
              <CardContent className="space-y-4">
                                 {/* Compact Search */}
                 <div className="space-y-3">
                   <input
                     type="text"
                     placeholder="Search members..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                   />
                   <select
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                     className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                   >
                     <option value="all">All Roles</option>
                     <option value="admin">Admin</option>
                     <option value="member">Member</option>
                     <option value="viewer">Viewer</option>
                   </select>
                 </div>

                                 {/* Compact Members List */}
                 {filteredMembers.length === 0 ? (
                   <div className="text-center py-8">
                     <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                       <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                       </svg>
                     </div>
                     <p className="text-sm text-muted-foreground">
                       {search || role !== 'all' 
                         ? 'No members found'
                         : 'No members yet'
                       }
                     </p>
                   </div>
                 ) : (
                                       <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredMembers.slice(0, 8).map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-muted-foreground">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                                                     <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                               <div className="flex items-center gap-1">
                                 <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                                 {member.role === 'owner' && (
                                   <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                     <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                   </svg>
                                 )}
                               </div>
                               {member.id === token && (
                                 <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                   You
                                 </span>
                               )}
                             </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
                                member.role === 'owner' 
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                  : member.role === 'admin'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                  : member.role === 'member'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {member.role}
                              </span>
                            </div>
                          </div>
                          
                                                     {/* Role Change Dropdown - Only for owners and admins */}
                           {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                             <div className="relative">
                               {editingMemberId === member.id ? (
                                 <div className="role-dropdown absolute right-0 top-8 z-10 bg-background border border-border rounded-lg shadow-lg p-2 min-w-32">
                                   <div className="space-y-1">
                                     {/* Owner can promote members to admin */}
                                     {currentUserRole === 'owner' && member.role === 'member' && (
                                       <button
                                         onClick={() => handleRoleChange(member.id, 'admin')}
                                         className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors"
                                       >
                                         Promote to Admin
                                       </button>
                                     )}
                                     
                                     {/* Owner can demote admins to member */}
                                     {currentUserRole === 'owner' && member.role === 'admin' && (
                                       <button
                                         onClick={() => handleRoleChange(member.id, 'member')}
                                         className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors"
                                       >
                                         Demote to Member
                                       </button>
                                       )}
                                     
                                     {/* Owner can transfer ownership (except to themselves) */}
                                     {currentUserRole === 'owner' && member.id !== token && (
                                       <button
                                         onClick={() => {
                                           setTransferOwnershipMember({ id: member.id, name: member.name });
                                           setEditingMemberId(null);
                                         }}
                                         className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors text-primary"
                                       >
                                         Transfer Ownership
                                       </button>
                                     )}
                                     
                                     {/* Admin can promote members to admin */}
                                     {currentUserRole === 'admin' && member.role === 'member' && (
                                       <button
                                         onClick={() => handleRoleChange(member.id, 'admin')}
                                         className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors"
                                       >
                                         Promote to Admin
                                       </button>
                                     )}
                                     
                                     {/* Admin can demote other admins to member */}
                                     {currentUserRole === 'admin' && member.role === 'admin' && member.id !== token && (
                                       <button
                                         onClick={() => handleRoleChange(member.id, 'member')}
                                         className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors"
                                       >
                                         Demote to Member
                                       </button>
                                     )}
                                     
                                     <button
                                       onClick={() => setEditingMemberId(null)}
                                       className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors text-muted-foreground"
                                     >
                                       Cancel
                                     </button>
                                   </div>
                                 </div>
                               ) : (
                                 <button
                                   onClick={() => setEditingMemberId(member.id)}
                                   className="p-1 hover:bg-muted rounded transition-colors"
                                   title="Change role"
                                 >
                                   <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                   </svg>
                                 </button>
                               )}
                             </div>
                           )}
                        </div>
                      ))}
                      {filteredMembers.length > 8 && (
                        <div className="text-center py-2">
                          <p className="text-xs text-muted-foreground">
                            +{filteredMembers.length - 8} more members
                          </p>
                        </div>
                      )}
                    </div>
                 )}
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>

                           {/* Modals */}
        <ConfirmRemoveMemberDialog
         isOpen={!!memberToRemove}
         onClose={() => setMemberToRemove(null)}
         member={memberToRemove}
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
                   handleRoleChange(transferOwnershipMember.id, 'owner');
                   setTransferOwnershipMember(null);
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
     </div>
   );
 });

export default MainPage;