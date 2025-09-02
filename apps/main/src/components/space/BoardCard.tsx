import React from 'react';
import { Card, Typography, Badge, Avatar } from "@taskflow/ui";
import { Grid, List, Calendar, BarChart3 } from 'lucide-react';
import type { BoardCardProps } from '../../types/interfaces/ui';

export const BoardCard: React.FC<BoardCardProps> = ({ board, onClick, viewMode }) => {
    const getBoardIcon = (type: string) => {
        switch (type) {
            case 'kanban': return <Grid className="w-6 h-6" />;
            case 'list': return <List className="w-6 h-6" />;
            case 'calendar': return <Calendar className="w-6 h-6" />;
            case 'timeline': return <BarChart3 className="w-6 h-6" />;
            default: return <Grid className="w-6 h-6" />;
        }
    };

    const getProgressPercentage = (completed: number, total: number) => {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    if (viewMode === 'list') {
        return (
            <Card 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={onClick}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${board.color}20` }}
                        >
                            {getBoardIcon(board.type)}
                        </div>
                        <div>
                            <Typography variant="heading-xl" className="font-semibold mb-1">
                                {board.name}
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                {board.description}
                            </Typography>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <Typography variant="body-small" className="font-medium">
                                {board.totalTasks}
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                Tasks
                            </Typography>
                        </div>
                        <div className="text-center">
                            <Typography variant="body-small" className="font-medium">
                                {getProgressPercentage(board.completedTasks, board.totalTasks)}%
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                Complete
                            </Typography>
                        </div>
                        <div className="text-center">
                            <Typography variant="body-small" className="font-medium">
                                {board.members.length}
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                Members
                            </Typography>
                        </div>
                        <Badge variant={board.isTemplate ? 'secondary' : 'default'}>
                            {board.isTemplate ? 'Template' : board.type}
                        </Badge>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${board.color}20` }}
                >
                    {getBoardIcon(board.type)}
                </div>
                <Badge variant={board.isTemplate ? 'secondary' : 'default'}>
                    {board.isTemplate ? 'Template' : board.type}
                </Badge>
            </div>
            
            <Typography variant="heading-xl" className="font-semibold mb-2">
                {board.name}
            </Typography>
            <Typography variant="body-small" textColor="muted" className="mb-4">
                {board.description}
            </Typography>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Typography variant="body-small" textColor="muted">
                        Progress
                    </Typography>
                    <Typography variant="body-small" className="font-medium">
                        {getProgressPercentage(board.completedTasks, board.totalTasks)}%
                    </Typography>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                    <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${getProgressPercentage(board.completedTasks, board.totalTasks)}%`,
                            backgroundColor: board.color
                        }}
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Typography variant="body-small" textColor="muted">
                            {board.totalTasks} tasks
                        </Typography>
                    </div>
                    <Typography variant="body-small" textColor="muted">
                        {board.lastActivity}
                    </Typography>
                </div>
                
                {board.members.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {board.members.slice(0, 3).map((member, index) => (
                                <Avatar 
                                    key={member.id}
                                    size="sm"
                                    className="border-2 border-white"
                                >
                                    {member.name.charAt(0).toUpperCase()}
                                </Avatar>
                            ))}
                            {board.members.length > 3 && (
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border-2 border-white">
                                    <Typography variant="body-small" className="text-xs">
                                        +{board.members.length - 3}
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
