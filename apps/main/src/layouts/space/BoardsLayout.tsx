import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaceManager } from '../../hooks/useSpaceManager';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useBoard } from '../../hooks/useBoard';
import { Button, Card, CardContent, Badge, Input } from '@taskflow/ui';
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
  
  // Board data
  const { selectBoard } = useBoard();

  // Local UI state
  const [search, setSearch] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardType, setNewBoardType] = useState<'kanban' | 'list' | 'calendar' | 'timeline'>('kanban');
  const [isCreatingBoardLoading, setIsCreatingBoardLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'list-detail'>('cards');

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
    // Find the board and set it as current
    const board = boards.find(b => b._id === boardId);
    if (board) {
      selectBoard(board);
      navigate('/board');
    }
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

  const handlePermanentDeleteBoard = useCallback(async (boardId: string) => {
    setDeletingBoard(boardId);
    try {
      await removeBoard(boardId);
      success('Board permanently deleted!');
      loadBoardsBySpace(spaceId!);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete board:', error);
      showError('Failed to delete board');
    } finally {
      setDeletingBoard(null);
    }
  }, [removeBoard, success, showError, loadBoardsBySpace, spaceId]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Space
              </Button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Boards
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Organize and manage your project boards
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Loading boards...</h3>
            <p className="text-slate-600 dark:text-slate-400">Please wait while we fetch your boards</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Space
              </Button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Boards
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Organize and manage your project boards
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Error Loading Boards</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{apiError}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
             {/* Header */}
       <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
         <div className="container mx-auto px-6 py-6">
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                 Boards
               </h1>
               <p className="text-slate-600 dark:text-slate-400 mt-1">
                 Organize and manage your project boards
               </p>
             </div>
             
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View:</span>
                 <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   <Button
                     variant={viewMode === 'cards' ? 'default' : 'ghost'}
                     size="sm"
                     onClick={() => setViewMode('cards')}
                     className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                       viewMode === 'cards' 
                         ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                         : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                     }`}
                   >
                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                     </svg>
                     Cards
                   </Button>
                   <Button
                     variant={viewMode === 'list' ? 'default' : 'ghost'}
                     size="sm"
                     onClick={() => setViewMode('list')}
                     className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                       viewMode === 'list' 
                         ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                         : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                     }`}
                   >
                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                     </svg>
                     List
                   </Button>
                   <Button
                     variant={viewMode === 'list-detail' ? 'default' : 'ghost'}
                     size="sm"
                     onClick={() => setViewMode('list-detail')}
                     className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                       viewMode === 'list-detail' 
                         ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                         : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                     }`}
                   >
                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                     </svg>
                     Detail
                   </Button>
                 </div>
               </div>
               <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                   {currentSpace.name}
                 </span>
               </div>
             </div>
           </div>
         </div>
       </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={activeTab === 'active' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('active')}
              size="sm"
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'active' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active
              <span className="ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded-full text-xs font-medium">
                {getActiveBoardsBySpace(spaceId!).length}
              </span>
            </Button>
            <Button
              variant={activeTab === 'archived' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('archived')}
              size="sm"
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'archived' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
              </svg>
              Archived
              <span className="ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded-full text-xs font-medium">
                {getBoardsBySpace(spaceId!).filter(board => board.archived).length}
              </span>
            </Button>
          </div>
        </div>

        {/* Search and Create */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-80 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>
          
          {activeTab === 'active' && (
            <Button
              onClick={() => setIsCreatingBoard(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
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
          <>
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBoards.map((board) => (
                             <Card 
                 key={board._id}
                 className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
               >
                <CardContent className="p-6">
                  {/* Board Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">
                          {board.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0"
                        >
                          {board.type.charAt(0).toUpperCase() + board.type.slice(1)}
                        </Badge>
                        {board.isTemplate && (
                          <Badge 
                            variant="outline" 
                            className="text-xs border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                          >
                            Template
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                                         {/* Board Actions */}
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       {activeTab === 'active' && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleArchiveBoard(board._id);
                           }}
                           className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                           title="Archive board"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                           </svg>
                         </Button>
                       )}
                       {activeTab === 'archived' && (
                         <>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleUnarchiveBoard(board._id);
                             }}
                             className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                             title="Unarchive board"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                             </svg>
                           </Button>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               setShowDeleteConfirm(board._id);
                             }}
                             className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                             title="Permanently delete board"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                           </Button>
                         </>
                       )}
                     </div>
                  </div>

                  {/* Board Description */}
                  {board.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {board.description}
                    </p>
                  )}

                  {/* Board Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {new Date(board.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoardClick(board._id);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredBoards.map((board) => (
                    <div
                      key={board._id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {board.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0"
                              >
                                {board.type.charAt(0).toUpperCase() + board.type.slice(1)}
                              </Badge>
                              {board.isTemplate && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                >
                                  Template
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(board.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeTab === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveBoard(board._id);
                              }}
                              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                              title="Archive board"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                              </svg>
                            </Button>
                          )}
                          {activeTab === 'archived' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnarchiveBoard(board._id);
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                                title="Unarchive board"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(board._id);
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                title="Permanently delete board"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBoardClick(board._id);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'list-detail' && (
              <div className="space-y-4">
                {filteredBoards.map((board) => (
                  <div
                    key={board._id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                            {board.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0"
                          >
                            {board.type.charAt(0).toUpperCase() + board.type.slice(1)}
                          </Badge>
                          {board.isTemplate && (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                            >
                              Template
                            </Badge>
                          )}
                        </div>
                        {board.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                            {board.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Updated {new Date(board.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveBoard(board._id);
                            }}
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Archive board"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                            </svg>
                          </Button>
                        )}
                        {activeTab === 'archived' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnarchiveBoard(board._id);
                              }}
                              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                              title="Unarchive board"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(board._id);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              title="Permanently delete board"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBoardClick(board._id);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {search ? 'No boards found' : `No ${activeTab} boards yet`}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              {search 
                ? 'Try adjusting your search terms or create a new board to get started.' 
                : `Get started by creating your first ${activeTab === 'active' ? 'board' : 'archived board'} in this space.`
              }
            </p>
            {!search && activeTab === 'active' && (
              <Button 
                onClick={() => setIsCreatingBoard(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Board
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {isCreatingBoard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Board</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Set up your project board</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Board Name
                </label>
                <Input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Description
                </label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  placeholder="Enter board description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Board Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'kanban', label: 'Kanban', icon: '📋', desc: 'Visual workflow' },
                    { value: 'list', label: 'List', icon: '📝', desc: 'Simple checklist' },
                    { value: 'calendar', label: 'Calendar', icon: '📅', desc: 'Time-based view' },
                    { value: 'timeline', label: 'Timeline', icon: '⏱️', desc: 'Project timeline' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewBoardType(type.value as any)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        newBoardType === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{type.label}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreatingBoard(false);
                  setNewBoardName('');
                  setNewBoardDescription('');
                  setNewBoardType('kanban');
                }}
                disabled={isCreatingBoardLoading}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBoard}
                disabled={!newBoardName.trim() || isCreatingBoardLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isCreatingBoardLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Board'
                )}
              </Button>
            </div>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
             {/* Modal Header */}
             <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delete Board</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
                 </div>
               </div>
             </div>

             {/* Modal Content */}
             <div className="px-6 py-6">
               <div className="text-center">
                 <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </div>
                 <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                   Are you sure you want to delete this board?
                 </h4>
                 <p className="text-slate-600 dark:text-slate-400 mb-6">
                   This will permanently delete the board and all its data. This action cannot be undone.
                 </p>
                 
                 {/* Board Info */}
                 {(() => {
                   const board = filteredBoards.find(b => b._id === showDeleteConfirm);
                   return board ? (
                     <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                         <span className="font-medium text-slate-900 dark:text-slate-100">{board.name}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                           {board.type.charAt(0).toUpperCase() + board.type.slice(1)}
                         </span>
                         {board.description && (
                           <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                             {board.description}
                           </span>
                         )}
                       </div>
                     </div>
                   ) : null;
                 })()}
               </div>
             </div>

             {/* Modal Footer */}
             <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3">
               <Button
                 variant="ghost"
                 onClick={() => setShowDeleteConfirm(null)}
                 disabled={deletingBoard !== null}
                 className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
               >
                 Cancel
               </Button>
               <Button
                 onClick={() => handlePermanentDeleteBoard(showDeleteConfirm)}
                 disabled={deletingBoard !== null}
                 className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
               >
                 {deletingBoard === showDeleteConfirm ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Deleting...
                   </>
                 ) : (
                   <>
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                     Delete Permanently
                   </>
                 )}
               </Button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 });
 
 BoardsLayout.displayName = 'BoardsLayout';
 
 export default BoardsLayout;
