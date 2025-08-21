import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Typography, 
    Button, 
    Input,
    Select,
    Loading,
    Container
} from "@taskflow/ui";
import { SpaceHeader, BoardCard, CreateBoardModal } from '../components/space';

interface Board {
    id: string;
    name: string;
    description: string;
    type: 'kanban' | 'list' | 'calendar' | 'timeline';
    totalTasks: number;
    completedTasks: number;
    members: Array<{
        id: string;
        name: string;
        avatar: string;
    }>;
    lastActivity: string;
    isTemplate: boolean;
    color: string;
}

interface Space {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    totalBoards: number;
    totalTasks: number;
    completedTasks: number;
    members: Array<{
        id: string;
        name: string;
        avatar: string;
        role: string;
    }>;
}

export const SpacePage = () => {
    const { spaceId } = useParams();
    const navigate = useNavigate();
    const [space, setSpace] = useState<Space | null>(null);
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Mock data - replace with actual API calls
    useEffect(() => {
        const fetchSpaceData = async () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setSpace({
                    id: spaceId || '1',
                    name: 'Product Development',
                    description: 'All product development activities and project management',
                    color: '#3B82F6',
                    icon: '🚀',
                    totalBoards: 8,
                    totalTasks: 156,
                    completedTasks: 89,
                    members: [
                        { id: '1', name: 'John Doe', avatar: '', role: 'Owner' },
                        { id: '2', name: 'Jane Smith', avatar: '', role: 'Admin' },
                        { id: '3', name: 'Mike Johnson', avatar: '', role: 'Member' }
                    ]
                });

                setBoards([
                    {
                        id: '1',
                        name: 'Sprint Planning',
                        description: 'Current sprint tasks and planning',
                        type: 'kanban',
                        totalTasks: 24,
                        completedTasks: 18,
                        members: [
                            { id: '1', name: 'John Doe', avatar: '' },
                            { id: '2', name: 'Jane Smith', avatar: '' }
                        ],
                        lastActivity: '2 hours ago',
                        isTemplate: false,
                        color: '#10B981'
                    },
                    {
                        id: '2',
                        name: 'Bug Tracking',
                        description: 'Track and manage software bugs',
                        type: 'list',
                        totalTasks: 12,
                        completedTasks: 8,
                        members: [
                            { id: '1', name: 'John Doe', avatar: '' },
                            { id: '3', name: 'Mike Johnson', avatar: '' }
                        ],
                        lastActivity: '1 day ago',
                        isTemplate: false,
                        color: '#EF4444'
                    },
                    {
                        id: '3',
                        name: 'Feature Roadmap',
                        description: 'Product feature planning and timeline',
                        type: 'timeline',
                        totalTasks: 45,
                        completedTasks: 23,
                        members: [
                            { id: '2', name: 'Jane Smith', avatar: '' }
                        ],
                        lastActivity: '3 days ago',
                        isTemplate: false,
                        color: '#8B5CF6'
                    },
                    {
                        id: '4',
                        name: 'Design System',
                        description: 'UI/UX design components and guidelines',
                        type: 'kanban',
                        totalTasks: 18,
                        completedTasks: 15,
                        members: [
                            { id: '2', name: 'Jane Smith', avatar: '' },
                            { id: '3', name: 'Mike Johnson', avatar: '' }
                        ],
                        lastActivity: '5 days ago',
                        isTemplate: false,
                        color: '#F59E0B'
                    }
                ]);
                setLoading(false);
            }, 1000);
        };

        fetchSpaceData();
    }, [spaceId]);

    const filteredBoards = boards.filter(board => {
        const matchesSearch = board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            board.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || board.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const handleCreateBoard = (boardData: {
        name: string;
        description: string;
        type: 'kanban' | 'list' | 'calendar' | 'timeline';
        color: string;
    }) => {
        const board: Board = {
            id: Date.now().toString(),
            name: boardData.name,
            description: boardData.description,
            type: boardData.type,
            totalTasks: 0,
            completedTasks: 0,
            members: [],
            lastActivity: 'Just now',
            isTemplate: false,
            color: boardData.color
        };
        setBoards([...boards, board]);
        setShowCreateModal(false);
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

    return (
        <div className="w-full h-full bg-background">
            {/* Header */}
            <SpaceHeader
                space={space}
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
                            {filteredBoards.map((board) => (
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
                            {filteredBoards.map((board) => (
                                <BoardCard
                                    key={board.id}
                                    board={board}
                                    onClick={() => handleBoardClick(board.id)}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}

                    {filteredBoards.length === 0 && (
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