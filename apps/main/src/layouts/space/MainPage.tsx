import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useBoard } from '../../hooks/useBoard';
import { Button, Card, CardContent } from '@taskflow/ui';
import { 
  Users, 
  BarChart3, 
  Clock, 
  Plus, 
  Check,
  X,
  Lock,
  Globe,
  Building2,
  UserPlus,
  Search
} from 'lucide-react';
import type { Space } from '../../types/space.types';
import { SpaceService } from '../../services/spaceService';

interface MainPageProps {
  currentSpace: Space;
}

// Utility function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo`;
  return `${Math.floor(diffInSeconds / 31536000)}y`;
};

// Get visibility icon and label
const getVisibilityInfo = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return { icon: Globe, label: 'Public', color: 'text-green-600' };
    case 'workspace':
      return { icon: Building2, label: 'Workspace', color: 'text-blue-600' };
    default:
      return { icon: Lock, label: 'Private', color: 'text-gray-600' };
  }
};

const MainPage: React.FC<MainPageProps> = React.memo(({ currentSpace }) => {
  const spaceId = currentSpace?._id;
  const { isAuthenticated, token } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  // Space data
  const {
    boards,
    loading,
    error: apiError,
    loadBoardsBySpace,
    addBoard,
    getActiveBoardsBySpace
  } = useSpaceManager();
  
  // Workspace data
  const { currentWorkspace, members: workspaceMembers, loadWorkspaceMembers } = useWorkspace();
  
  // Board data
  const { selectBoard } = useBoard();
  // Local UI state
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingBoardLoading, setIsCreatingBoardLoading] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  
  // Add member sidebar state
  const [isAddMemberSidebarOpen, setIsAddMemberSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Member data
  const [spaceMembers, setSpaceMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  // Get active boards for this space
  const activeBoards = useMemo(() => {
    if (!spaceId) return [];
    return getActiveBoardsBySpace(spaceId);
  }, [spaceId, getActiveBoardsBySpace, boards]);

  const filteredBoards = useMemo(() => {
    return activeBoards;
  }, [activeBoards]);

  // Load space members
  const loadSpaceMembers = useCallback(async () => {
    if (!spaceId) return;
    
    setLoadingMembers(true);
    try {
      const response = await SpaceService.getSpaceMembers(spaceId);
      setSpaceMembers(response.data?.members || []);
    } catch (error) {
      console.error('Error loading space members:', error);
      showError('Failed to load space members');
      setSpaceMembers([]); // Ensure it's always an array
    } finally {
      setLoadingMembers(false);
    }
  }, [spaceId, showError]);

  // Load workspace members
  const loadWorkspaceMembersData = useCallback(async () => {
    if (!currentWorkspace?._id) return;
    
    try {
      await loadWorkspaceMembers(currentWorkspace._id);
    } catch (error) {
      console.error('Error loading workspace members:', error);
      showError('Failed to load workspace members');
    }
  }, [currentWorkspace?._id, loadWorkspaceMembers, showError]);

  // Load boards when space changes
  React.useEffect(() => {
    if (spaceId) {
      loadBoardsBySpace(spaceId);
    }
  }, [spaceId, loadBoardsBySpace]);

  // Load members when sidebar opens
  useEffect(() => {
    if (isAddMemberSidebarOpen) {
      loadSpaceMembers();
      loadWorkspaceMembersData();
    }
  }, [isAddMemberSidebarOpen, loadSpaceMembers, loadWorkspaceMembersData]);

  const handleCreateBoard = useCallback(async () => {
    console.log('Creating board with:', { newBoardName, spaceId });
    
    if (!newBoardName.trim() || !spaceId) {
      console.log('Validation failed:', { hasName: !!newBoardName.trim(), hasSpaceId: !!spaceId });
      return;
    }
    
    setIsCreatingBoardLoading(true);
    try {
      // Random theme colors for variety
      const themeColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ];
      const randomColor = themeColors[Math.floor(Math.random() * themeColors.length)];
      
      const boardData = {
        name: newBoardName,
        description: '',
        type: 'kanban',
        spaceId: spaceId,
        visibility: 'public',
        settings: { color: randomColor },
        theme: {
          color: randomColor,
          opacity: 1.0
        }
      };
      
      console.log('Sending board data:', boardData);
      await addBoard(boardData);
      
      setNewBoardName('');
      setIsCreatingBoard(false);
      success('Board created successfully!');
      
      loadBoardsBySpace(spaceId);
    } catch (error) {
      console.error('Failed to create board:', error);
      showError(`Failed to create board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingBoardLoading(false);
    }
  }, [newBoardName, spaceId, addBoard, success, showError, loadBoardsBySpace]);

  const handleBoardClick = (board: any) => {
    // Set the selected board in Redux state
    selectBoard(board);
    // Navigate to board page without boardId in path
    navigate('/board');
  };

  const handleAddMemberClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent clicks
    setIsAddMemberSidebarOpen(true);
  };

  const handleCloseAddMemberSidebar = () => {
    setIsAddMemberSidebarOpen(false);
    setSearchQuery('');
  };

  // Get available members (workspace members not in space)
  const availableMembers = useMemo(() => {
    if (!workspaceMembers || !spaceMembers || !Array.isArray(spaceMembers)) return [];
    
    const spaceMemberIds = spaceMembers.map(member => 
      typeof member.user === 'string' ? member.user : member.user?._id || member.user?.id
    );
    
    return workspaceMembers.filter(workspaceMember => 
      !spaceMemberIds.includes(workspaceMember.userId || workspaceMember.id)
    );
  }, [workspaceMembers, spaceMembers]);

  // Filter available members based on search query
  const filteredAvailableMembers = useMemo(() => {
    if (!searchQuery) return availableMembers;
    
    return availableMembers.filter(member => {
      const name = member.user?.name || '';
      const email = member.user?.email || '';
      const searchLower = searchQuery.toLowerCase();
      
      return name.toLowerCase().includes(searchLower) || 
             email.toLowerCase().includes(searchLower);
    });
  }, [availableMembers, searchQuery]);

  const handleAddMember = async (userId: string) => {
    if (!currentSpace) return;
    
    setIsAddingMember(true);
    try {
      // Add member to space with default role
      await SpaceService.addSpaceMember(currentSpace._id, userId, 'member');
      success('Member added to space successfully!');
      
      // Reload space members
      await loadSpaceMembers();
      
      handleCloseAddMemberSidebar();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to add member to space');
    } finally {
      setIsAddingMember(false);
    }
  };

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
          <p className="text-muted-foreground">Loading space...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Error Loading Space</div>
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

  // Space not found
  if (!currentSpace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Space Not Found</div>
          <p className="text-muted-foreground mb-4">The space you're looking for doesn't exist or you don't have access to it.</p>
          <Button
            onClick={() => navigate('/workspace')}
            variant="default"
            size="sm"
          >
            Back to Workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">
                    {currentSpace.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">{currentSpace.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Active Space</span>
                    <span>•</span>
                    <span>Created {new Date(currentSpace.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {currentSpace.description && (
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  {currentSpace.description}
                </p>
              )}
              
              {/* Members List */}
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <div className="flex items-center gap-1">
                    {currentSpace.members && currentSpace.members.length > 0 ? (
                      <>
                        {currentSpace.members.slice(0, 4).map((member, index) => {
                          const userName = typeof member.user === 'object' 
                            ? ((member.user as any).name || (member.user as any).displayName || (member.user as any).email || 'Member')
                            : (member.user || 'Member');
                          const userInitials = typeof member.user === 'object'
                            ? ((member.user as any).initials || ((member.user as any).name || (member.user as any).displayName || 'M').charAt(0).toUpperCase())
                            : (member.user || 'M').charAt(0).toUpperCase();
                          const userAvatar = typeof member.user === 'object' 
                            ? ((member.user as any).avatar || (member.user as any).profilePicture)
                            : null;
                          
                          return (
                            <div key={index} className="relative group">
                              <div className="w-8 h-8 bg-primary/20 rounded-full border border-background flex items-center justify-center text-sm font-medium text-primary cursor-pointer hover:scale-110 transition-transform overflow-hidden">
                                {userAvatar ? (
                                  <img 
                                    src={userAvatar} 
                                    alt={userName}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  userInitials
                                )}
                              </div>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {userName}
                              </div>
                            </div>
                          );
                        })}
                        {currentSpace.members.length > 4 && (
                          <div className="w-8 h-8 bg-muted rounded-full border border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground font-medium">+{currentSpace.members.length - 4}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No members yet</span>
                    )}
                  </div>
                  {/* Add Member Button */}
                  <button
                    onClick={handleAddMemberClick}
                    className="ml-2 w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
                    title="Add member to space"
                  >
                    <UserPlus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Boards</h2>
            <p className="text-sm text-muted-foreground">Your project boards</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreatingBoard ? (
              <Button
                onClick={() => setIsCreatingBoard(true)}
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter board name..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateBoard();
                    if (e.key === 'Escape') {
                      setIsCreatingBoard(false);
                      setNewBoardName('');
                    }
                  }}
                  disabled={isCreatingBoardLoading}
                  className="h-8 w-48 text-sm border border-slate-200 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim() || isCreatingBoardLoading}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                  title="Create board"
                >
                  {isCreatingBoardLoading ? (
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingBoard(false);
                    setNewBoardName('');
                  }}
                  disabled={isCreatingBoardLoading}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>


        {filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBoards.map((board) => {
              // Get theme color or fallback to primary color
              const themeColor = board.theme?.color || '#3B82F6';
              const backgroundImage = board.theme?.background?.url;
              const opacity = board.theme?.opacity || 1;
              const visibilityInfo = getVisibilityInfo(board.visibility || 'private');
              const VisibilityIcon = visibilityInfo.icon;
              return (
                <Card 
                  key={board._id}
                  className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 cursor-pointer hover:-translate-y-1 overflow-hidden bg-white/50 backdrop-blur-sm"
                  onClick={() => handleBoardClick(board)}
                >
                  {/* Theme Header */}
                  <div 
                    className="h-12 relative overflow-hidden"
                    style={{
                      backgroundColor: themeColor,
                      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: opacity
                    }}
                  >
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/20 to-black/30"></div>
                    
                    {/* Board Icon */}
                    <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-white/25 backdrop-blur-sm rounded-md flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-white" />
                    </div>
                    
                    {/* Visibility Icon - Top Right */}
                    <div className="absolute top-1.5 right-1.5">
                      <div className="w-6 h-6 bg-white/25 backdrop-blur-sm rounded-md flex items-center justify-center">
                        <VisibilityIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {/* Board Title */}
                      <div>
                        <h4 className="font-semibold text-foreground truncate text-sm mb-1">{board.name}</h4>
                        {board.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                            {board.description}
                          </p>
                        )}
                      </div>

                      {/* Board Members */}
                      {board.members && board.members.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1">
                            {board.members.slice(0, 3).map((_, index) => {
                              // Simple fallback for member display
                              const memberInitial = `M${index + 1}`;
                              
                              return (
                                <div key={index} className="w-4 h-4 bg-primary/20 rounded-full border border-background flex items-center justify-center text-xs font-medium text-primary">
                                  {memberInitial}
                                </div>
                              );
                            })}
                            {board.members.length > 3 && (
                              <div className="w-4 h-4 bg-muted rounded-full border border-background flex items-center justify-center">
                                <span className="text-xs text-muted-foreground font-medium">+{board.members.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Board Stats - Only time */}
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {board.updatedAt ? formatTimeAgo(board.updatedAt) : 'now'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No boards found</h3>
              <p className="text-muted-foreground mb-6">
                Create your first board to get started with your space
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Member Sidebar */}
      {isAddMemberSidebarOpen && currentSpace && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseAddMemberSidebar}
          />
          
          {/* Sidebar */}
          <div className="w-96 bg-background border-l border-border shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Add Member</h3>
                  <p className="text-sm text-muted-foreground">to {currentSpace.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseAddMemberSidebar}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

                              {/* Current Space Members */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-foreground mb-3">Current Members ({Array.isArray(spaceMembers) ? spaceMembers.length : 0})</h4>
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                    {Array.isArray(spaceMembers) && spaceMembers.map((member, index) => {
                      const user = member.user || member;
                      const name = user?.name || 'Unknown User';
                      const email = user?.email || '';
                      
                      return (
                        <div
                          key={member._id || index}
                          className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-xs"
                          title={`${name}${email ? ` (${email})` : ''}`}
                        >
                          <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-foreground truncate max-w-20">{name}</span>
                        </div>
                      );
                    })}
                    {Array.isArray(spaceMembers) && spaceMembers.length === 0 && (
                      <p className="text-xs text-muted-foreground">No members yet</p>
                    )}
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search workspace members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

              {/* Available Members List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Loading members...</div>
                  </div>
                ) : filteredAvailableMembers.length > 0 ? (
                  filteredAvailableMembers.map((member) => {
                    const name = member.user?.name || 'Unknown User';
                    const email = member.user?.email || '';
                    const userId = member.userId || member.id;
                    
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleAddMember(userId)}
                      >
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{name}</p>
                          <p className="text-xs text-muted-foreground truncate">{email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isAddingMember}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No members found' : 'All workspace members are already in this space'}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
});

MainPage.displayName = 'MainPage';

export default MainPage;
