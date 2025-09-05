import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Card, CardContent, Badge } from '@taskflow/ui';
import type { Space } from '../../types/space.types';

interface BoardsLayoutProps {
  currentSpace: Space;
}

const BoardsLayout: React.FC<BoardsLayoutProps> = React.memo(({ currentSpace }) => {
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
    editBoard,
    removeBoard,
    getActiveBoardsBySpace,
    getBoardsBySpace
  } = useSpaceManager();

  // Local UI state
  const [search, setSearch] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardType, setNewBoardType] = useState<'kanban' | 'list' | 'calendar' | 'timeline'>('kanban');
  const [isCreatingBoardLoading, setIsCreatingBoardLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Get boards based on current tab and space
  const currentBoards = useMemo(() => {
    if (!spaceId) return [];
    if (activeTab === 'active') {
      return getActiveBoardsBySpace(spaceId);
    } else {
      return getBoardsBySpace(spaceId).filter(board => board.archived);
    }
  }, [spaceId, activeTab, getActiveBoardsBySpace, getBoardsBySpace]);

  const filteredBoards = useMemo(() => {
    if (!search) return currentBoards;
    return currentBoards.filter(board => 
      board.name.toLowerCase().includes(search.toLowerCase()) ||
      (board.description?.toLowerCase() || '').includes(search.toLowerCase())
    );
  }, [currentBoards, search]);

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
        description: newBoardDescription,
        type: newBoardType,
        spaceId: spaceId,
        visibility: 'public',
        settings: { color: '#3B82F6' }
      });
      
      setNewBoardName('');
      setNewBoardDescription('');
      setNewBoardType('kanban');
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
  }, [newBoardName, newBoardDescription, newBoardType, spaceId, addBoard, success, showError, loadBoardsBySpace]);

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  const handleArchiveBoard = useCallback(async (boardId: string) => {
    try {
      await editBoard(boardId, { archived: true });
      success('Board archived successfully!');
      loadBoardsBySpace(spaceId!);
    } catch (error) {
      console.error('Failed to archive board:', error);
      showError('Failed to archive board');
    }
  }, [editBoard, success, showError, loadBoardsBySpace, spaceId]);

  const handleUnarchiveBoard = useCallback(async (boardId: string) => {
    try {
      await editBoard(boardId, { archived: false });
      success('Board unarchived successfully!');
      loadBoardsBySpace(spaceId!);
    } catch (error) {
      console.error('Failed to unarchive board:', error);
      showError('Failed to unarchive board');
    }
  }, [editBoard, success, showError, loadBoardsBySpace, spaceId]);

  const handleDeleteBoard = useCallback(async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }
    
    try {
      await removeBoard(boardId);
      success('Board deleted successfully!');
      loadBoardsBySpace(spaceId!);
    } catch (error) {
      console.error('Failed to delete board:', error);
      showError('Failed to delete board');
    }
  }, [removeBoard, success, showError, loadBoardsBySpace, spaceId]);

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
          <p className="text-muted-foreground">Loading boards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Error Loading Boards</div>
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
                onClick={() => navigate('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Space Boards</h1>
                <p className="text-muted-foreground">Manage and organize your space boards</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentSpace.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            size="sm"
          >
            Active ({getActiveBoardsBySpace(spaceId!).length})
          </Button>
          <Button
            variant={activeTab === 'archived' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('archived')}
            size="sm"
          >
            Archived ({getBoardsBySpace(spaceId!).filter(board => board.archived).length})
          </Button>
        </div>

        {/* Search and Create */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
            </div>
          </div>
          
          {activeTab === 'active' && (
            <Button
              onClick={() => setIsCreatingBoard(true)}
              variant="default"
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Board
            </Button>
          )}
        </div>

        {/* Boards List */}
        {filteredBoards.length > 0 ? (
          <div className="space-y-4">
            {filteredBoards.map((board) => (
              <Card 
                key={board._id}
                className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground truncate">{board.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {board.type}
                        </Badge>
                        {board.isTemplate && (
                          <Badge variant="outline" className="text-xs">
                            Template
                          </Badge>
                        )}
                      </div>
                      {board.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {board.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created {new Date(board.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated {new Date(board.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBoardClick(board._id)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open
                      </Button>
                      
                      {activeTab === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveBoard(board._id)}
                        >
                          Archive
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnarchiveBoard(board._id)}
                          >
                            Unarchive
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBoard(board._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No {activeTab} boards found
            </h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Try adjusting your search' : `No ${activeTab} boards in this space`}
            </p>
            {!search && activeTab === 'active' && (
              <Button onClick={() => setIsCreatingBoard(true)}>
                Create Board
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {isCreatingBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Board</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  placeholder="Enter board description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Board Type
                </label>
                <select
                  value={newBoardType}
                  onChange={(e) => setNewBoardType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="kanban">Kanban</option>
                  <option value="list">List</option>
                  <option value="calendar">Calendar</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreatingBoard(false);
                    setNewBoardName('');
                    setNewBoardDescription('');
                    setNewBoardType('kanban');
                  }}
                  disabled={isCreatingBoardLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim() || isCreatingBoardLoading}
                >
                  {isCreatingBoardLoading ? 'Creating...' : 'Create Board'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

BoardsLayout.displayName = 'BoardsLayout';

export default BoardsLayout;
