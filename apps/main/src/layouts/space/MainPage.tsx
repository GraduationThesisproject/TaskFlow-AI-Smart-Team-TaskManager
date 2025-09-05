import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Card, CardContent, CardHeader, CardTitle, AvatarWithFallback } from '@taskflow/ui';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Activity,
  Star,
  Eye,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import type { Space } from '../../types/space.types';

interface MainPageProps {
  currentSpace: Space;
}

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

  // Local UI state
  const [search, setSearch] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingBoardLoading, setIsCreatingBoardLoading] = useState(false);

  // Get active boards for this space
  const activeBoards = useMemo(() => {
    if (!spaceId) return [];
    return getActiveBoardsBySpace(spaceId);
  }, [spaceId, getActiveBoardsBySpace, boards]);

  const filteredBoards = useMemo(() => {
    if (!search) return activeBoards;
    return activeBoards.filter(board => 
      board.name.toLowerCase().includes(search.toLowerCase()) ||
      (board.description?.toLowerCase() || '').includes(search.toLowerCase())
    );
  }, [activeBoards, search]);

  // Load boards when space changes
  React.useEffect(() => {
    if (spaceId) {
      loadBoardsBySpace(spaceId);
    }
  }, [spaceId, loadBoardsBySpace]);

  const handleCreateBoard = useCallback(async () => {
    if (!newBoardName.trim() || !spaceId) return;
    
    setIsCreatingBoardLoading(true);
    try {
      await addBoard({
        name: newBoardName,
        description: '',
        type: 'kanban',
        spaceId: spaceId,
        visibility: 'public',
        settings: { color: '#3B82F6' }
      });
      
      setNewBoardName('');
      setIsCreatingBoard(false);
      success('Board created successfully!');
      
      // Reload boards
      loadBoardsBySpace(spaceId);
    } catch (error) {
      console.error('Failed to create board:', error);
      showError('Failed to create board');
    } finally {
      setIsCreatingBoardLoading(false);
    }
  }, [newBoardName, spaceId, addBoard, success, showError, loadBoardsBySpace]);

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
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
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/space/settings')}
                variant="outline"
                size="sm"
                className="h-9 px-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => setIsCreatingBoard(true)}
                className="h-9 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Board
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-6 -mt-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Boards</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{activeBoards.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Members</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {currentSpace.members?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {activeBoards.reduce((total, board) => total + (board.taskCount || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Created</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {new Date(currentSpace.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Boards Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Recent Boards</h2>
                <p className="text-sm text-muted-foreground">Your most active project boards</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search boards..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {filteredBoards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBoards.slice(0, 6).map((board) => (
                  <Card 
                    key={board._id}
                    className="group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/30 cursor-pointer hover:-translate-y-1"
                    onClick={() => handleBoardClick(board._id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="font-semibold text-foreground truncate">{board.name}</h4>
                          </div>
                          {board.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {board.description}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {board.visibility || 'Private'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {board.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        
                        <div className="flex -space-x-2">
                          {board.members && board.members.length > 0 ? (
                            <>
                              {board.members.slice(0, 2).map((member, idx) => (
                                <AvatarWithFallback 
                                  key={idx}
                                  className="w-6 h-6 border-2 border-background"
                                  fallback={member.name?.charAt(0)?.toUpperCase() || 'U'}
                                />
                              ))}
                              {board.members.length > 2 && (
                                <div className="w-6 h-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">+{board.members.length - 2}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-6 h-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">0</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No boards found</h3>
                  <p className="text-muted-foreground mb-6">
                    {search ? 'Try adjusting your search' : 'Create your first board to get started with your space'}
                  </p>
                  {!search && (
                    <Button onClick={() => setIsCreatingBoard(true)} className="bg-gradient-to-r from-primary to-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Board
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Members */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSpace.members && currentSpace.members.length > 0 ? (
                  <>
                    {currentSpace.members.slice(0, 4).map((member, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="relative">
                          <AvatarWithFallback 
                            className="w-10 h-10"
                            fallback={member.name?.charAt(0)?.toUpperCase() || 'U'}
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-green-500"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{member.name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground truncate">{member.role || 'Member'}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {currentSpace.members.length > 4 && (
                      <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground">
                          +{currentSpace.members.length - 4} more members
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/space/members')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Members
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">No members yet</p>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/space/members')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Members
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSpace.recentActivity && currentSpace.recentActivity.length > 0 ? (
                  currentSpace.recentActivity.slice(0, 4).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                    <p className="text-xs text-muted-foreground mt-1">Activity will appear here as team members work</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/space/boards')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View All Boards
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/space/members')}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Members
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/space/analytics')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/space/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Space Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {isCreatingBoard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Create New Board</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Board Name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingBoard(false);
                    setNewBoardName('');
                  }}
                  disabled={isCreatingBoardLoading}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim() || isCreatingBoardLoading}
                  className="px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {isCreatingBoardLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Board
                    </>
                  )}
                </Button>
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
