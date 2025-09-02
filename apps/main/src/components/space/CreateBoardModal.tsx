import React, { useState } from 'react';
import { Modal, Button, Input, TextArea , Select, Typography } from "@taskflow/ui";
import type { CreateBoardModalProps } from '../../types/interfaces/ui';

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [boardData, setBoardData] = useState({
        name: '',
        description: '',
        type: 'kanban' as const,
        color: '#3B82F6'
    });

    const colorOptions = [
        { value: '#3B82F6', label: 'Blue' },
        { value: '#10B981', label: 'Green' },
        { value: '#F59E0B', label: 'Yellow' },
        { value: '#EF4444', label: 'Red' },
        { value: '#8B5CF6', label: 'Purple' },
        { value: '#EC4899', label: 'Pink' },
        { value: '#06B6D4', label: 'Cyan' },
        { value: '#84CC16', label: 'Lime' }
    ];

    const boardTypes = [
        { value: 'kanban', label: 'Kanban Board', description: 'Visual workflow with columns' },
        { value: 'list', label: 'List View', description: 'Simple list of tasks' },
        { value: 'calendar', label: 'Calendar', description: 'Time-based task view' },
        { value: 'timeline', label: 'Timeline', description: 'Project timeline view' }
    ];

    const handleSubmit = () => {
        if (boardData.name.trim()) {
            onSubmit(boardData);
            setBoardData({ name: '', description: '', type: 'kanban', color: '#3B82F6' });
        }
    };

    const handleClose = () => {
        setBoardData({ name: '', description: '', type: 'kanban', color: '#3B82F6' });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Board">
            <div className="space-y-6">
                {/* Board Name */}
                <div>
                    <Typography variant="body-small" className="mb-2 font-medium">
                        Board Name *
                    </Typography>
                    <Input
                        placeholder="Enter board name"
                        value={boardData.name}
                        onChange={(e) => setBoardData({ ...boardData, name: e.target.value })}
                        className="w-full"
                    />
                </div>

                {/* Board Description */}
                <div>
                    <Typography variant="body-small" className="mb-2 font-medium">
                        Description
                    </Typography>
                    <TextArea
                        placeholder="Describe what this board is for..."
                        value={boardData.description}
                        onChange={(e) => setBoardData({ ...boardData, description: e.target.value })}
                        rows={3}
                        className="w-full"
                    />
                </div>

                {/* Board Type */}
                <div>
                    <Typography variant="body-small" className="mb-2 font-medium">
                        Board Type
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {boardTypes.map((type) => (
                            <div
                                key={type.value}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    boardData.type === type.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setBoardData({ ...boardData, type: type.value as any })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                        boardData.type === type.value
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {boardData.type === type.value && (
                                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                        )}
                                    </div>
                                    <div>
                                        <Typography variant="body-small" className="font-medium">
                                            {type.label}
                                        </Typography>
                                        <Typography variant="body-small" textColor="muted">
                                            {type.description}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Color Selection */}
                <div>
                    <Typography variant="body-small" className="mb-3 font-medium">
                        Board Color
                    </Typography>
                    <div className="grid grid-cols-4 gap-3">
                        {colorOptions.map((color) => (
                            <button
                                key={color.value}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    boardData.color === color.value
                                        ? 'border-gray-800 scale-105'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => setBoardData({ ...boardData, color: color.value })}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Template Options */}
                <div>
                    <Typography variant="body-small" className="mb-2 font-medium">
                        Quick Start Options
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <Typography variant="body-small" className="font-medium mb-1">
                                Start from Scratch
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                Create an empty board
                            </Typography>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <Typography variant="body-small" className="font-medium mb-1">
                                Use Template
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                Choose from templates (coming soon)
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={handleClose}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    disabled={!boardData.name.trim()}
                >
                    Create Board
                </Button>
            </div>
        </Modal>
    );
};
