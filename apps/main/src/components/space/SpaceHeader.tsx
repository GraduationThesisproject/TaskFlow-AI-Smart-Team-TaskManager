import React from 'react';
import { Typography, Button, Card, Avatar, Stack } from "@taskflow/ui";

interface SpaceHeaderProps {
    space: {
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
    };
    onCreateBoard: () => void;
    onSettings: () => void;
    onMembers: () => void;
}

export const SpaceHeader: React.FC<SpaceHeaderProps> = ({
    space,
    onCreateBoard,
    onSettings,
    onMembers
}) => {
    const getProgressPercentage = (completed: number, total: number) => {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    return (
        <div className="bg-card border-b border-border">
            <div className="px-6 sm:px-8 lg:px-12 py-6">
                {/* Main Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                            style={{ backgroundColor: `${space.color}20` }}
                        >
                            {space.icon}
                        </div>
                        <div>
                            <Typography variant="heading-xl" className="font-bold mb-1">
                                {space.name}
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                {space.description}
                            </Typography>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={onSettings}>
                            ⚙️ Settings
                        </Button>
                        <Button variant="outline" size="sm" onClick={onMembers}>
                            👥 Members
                        </Button>
                        <Button onClick={onCreateBoard}>
                            ➕ New Board
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="body-small" textColor="muted">Total Boards</Typography>
                                <Typography variant="heading-xl" className="font-bold">{space.totalBoards}</Typography>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="body-small" textColor="muted">Total Tasks</Typography>
                                <Typography variant="heading-xl" className="font-bold">{space.totalTasks}</Typography>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 text-lg">📊</span>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="body-small" textColor="muted">Completed</Typography>
                                <Typography variant="heading-xl" className="font-bold">{space.completedTasks}</Typography>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600 text-lg">📅</span>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="body-small" textColor="muted">Progress</Typography>
                                <Typography variant="heading-xl" className="font-bold">
                                    {getProgressPercentage(space.completedTasks, space.totalTasks)}%
                                </Typography>
                            </div>
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 text-lg">📈</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Members Section */}
                {space.members.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Typography variant="body-small" textColor="muted">
                                Team Members:
                            </Typography>
                            <div className="flex -space-x-2">
                                {space.members.slice(0, 5).map((member, index) => (
                                    <Avatar 
                                        key={member.id}
                                        size="sm"
                                        className="border-2 border-white"
                                    >
                                        {member.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                ))}
                                {space.members.length > 5 && (
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                                        <Typography variant="body-small" className="text-xs">
                                            +{space.members.length - 5}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onMembers}>
                            View All Members
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
