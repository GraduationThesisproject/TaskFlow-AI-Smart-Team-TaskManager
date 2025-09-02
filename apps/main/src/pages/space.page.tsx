import { useState, useEffect } from 'react';
import {useNavigate, useLocation } from 'react-router-dom';
import { 
    Typography, 
    Button, 
    Input,
    Select,
    Loading,
    Container
} from "@taskflow/ui";
import { SpaceHeader, BoardCard, CreateBoardModal } from '../components/space';
import { useSpaceManager } from '../hooks/useSpaceManager';

export const SpacePage = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const spaceId = query.get('id') || '';    
    console.log(spaceId);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const {
        currentSpace: space,
        boards,
        loading,
        loadSpace,
        loadBoardsBySpace,
        addBoard
    } = useSpaceManager();

    // Debug logging
    console.log('SpacePage - boards:', boards);
    console.log('SpacePage - space:', space);
    console.log('SpacePage - loading:', loading);
    console.log('SpacePage - space structure:', JSON.stringify(space, null, 2));

    // Load space and boards data
    useEffect(() => {
        if (spaceId) {
            loadSpace(spaceId);
            loadBoardsBySpace(spaceId);
        }
    }, [spaceId]); // Only depend on spaceId to prevent infinite loops

    const filteredBoards = boards.filter(board => {
        // Add null checks to prevent errors
        if (!board || !board.name) return false;
        
        const matchesSearch = board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (board.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || board.type === filterType;
        return matchesSearch && matchesFilter;
    });

    // Adapt board data to match component interface
    const adaptedBoards = filteredBoards
        .map(board => {
            // Add null checks and safe property access
            if (!board) return null;
            
            return {
                id: board._id || '',
                name: board.name || '',
                description: board.description || '',
                type: board.type || 'kanban',
                totalTasks: 0, // This should come from board stats
                completedTasks: 0, // This should come from board stats
                members: board.members?.map(member => ({
                    id: member?.user || '',
                    name: member?.user || '', // This should be resolved to actual user name
                    avatar: '' // This should be resolved to actual user avatar
                })) || [],
                lastActivity: 'Recently', // This should come from board data
                isTemplate: board.isTemplate || false,
                color: '#3B82F6' // Default color since BoardSettings doesn't have color property
            };
        })
        .filter((board): board is NonNullable<typeof board> => board !== null); // Type-safe filter

    const handleCreateBoard = async (boardData: {
        name: string;
        description: string;
        type: 'kanban' | 'list' | 'calendar' | 'timeline';
        color: string;
    }) => {
        try {
            console.log('Creating board with data:', boardData);
            const result = await addBoard({
                name: boardData.name,
                description: boardData.description,
                type: boardData.type,
                spaceId: spaceId!, // Changed from 'space' to 'spaceId' to match backend validation
                visibility: 'public', // Add required visibility field
                settings: { color: boardData.color }
            });
            console.log('Board created successfully:', result);
            setShowCreateModal(false);
            
            // Reload boards to get the updated list
            if (spaceId) {
                loadBoardsBySpace(spaceId);
            }
        } catch (error) {
            console.error('Failed to create board:', error);
        }
    };

    const handleBoardClick = (boardId: string) => {
        navigate(`/board/${boardId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loading />
            </div>
        );
    }

    if (!space) {
        return (
            <div className="flex items-center justify-center h-full">
                <Typography variant="heading-xl">Space not found</Typography>
            </div>
        );
    }

    // Adapt space data to match component interface
    const spaceData = space as any; // Type assertion to handle dynamic properties
    
    // Debug logging to understand the data structure
    console.log('Space data structure:', {
        space,
        members: space.members,
        firstMember: space.members?.[0]
    });
    
    const adaptedSpace = {
        id: space._id || spaceData.id || '',
        name: space.name || 'Untitled Space',
        description: space.description || '',
        color: space.settings?.color || spaceData.color || '#3B82F6',
        icon: space.settings?.icon || spaceData.icon || '🏠',
        totalBoards: space.stats?.totalBoards || spaceData.totalBoards || boards.length || 0,
        totalTasks: space.stats?.totalTasks || spaceData.totalTasks || 0,
        completedTasks: space.stats?.completedTasks || spaceData.completedTasks || 0,
        members: (space.members || []).map((member: any) => {
            // Handle both populated user object and user ID string
            const userId = member.user?._id || member.user || '';
            const userName = member.user?.name || 'Unknown User';
            const userAvatar = member.user?.avatar || '';
            
            return {
                id: userId,
                name: userName,
                avatar: userAvatar,
                role: member.role || 'member'
            };
        })
    };

    return (
        <div className="w-full h-full bg-background">
            {/* Header */}
            <SpaceHeader
                space={adaptedSpace}
                onCreateBoard={() => setShowCreateModal(true)}
                        onSettings={() => {/* Settings clicked */}}
        onMembers={() => {/* Members clicked */}}
            />

            {/* Content */}
            <Container>
                <div className="py-6">
                    {/* Controls */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                                <Input
                                    placeholder="Search boards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-32"
                            >
                                <option value="all">All Types</option>
                                <option value="kanban">Kanban</option>
                                <option value="list">List</option>
                                <option value="calendar">Calendar</option>
                                <option value="timeline">Timeline</option>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-card rounded-lg border border-border p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    📊
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    📋
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Boards Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {adaptedBoards.map((board) => (
                                <BoardCard
                                    key={board.id}
                                    board={board}
                                    onClick={() => handleBoardClick(board.id)}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {adaptedBoards.map((board) => (
                                <BoardCard
                                    key={board.id}
                                    board={board}
                                    onClick={() => handleBoardClick(board.id)}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}

                    {adaptedBoards.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📊</span>
                            </div>
                            <Typography variant="heading-xl" className="mb-2">
                                No boards found
                            </Typography>
                            <Typography variant="body-small" textColor="muted" className="mb-4">
                                {searchTerm || filterType !== 'all' 
                                    ? 'Try adjusting your search or filters'
                                    : 'Create your first board to get started'
                                }
                            </Typography>
                            {!searchTerm && filterType === 'all' && (
                                <Button onClick={() => setShowCreateModal(true)}>
                                    ➕ Create Board
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </Container>

            {/* Create Board Modal */}
            <CreateBoardModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateBoard}
            />
        </div>
    );
};