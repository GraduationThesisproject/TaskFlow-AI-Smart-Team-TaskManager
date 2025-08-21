import React from 'react';
import { Routes, Route } from "react-router-dom";
import { TaskDetailsLayout } from "../layouts/board/TaskDetailsLayout";
import { ListViewLayout } from "../layouts/board/ListViewLayout";
import { TimelineViewLayout } from "../layouts/board/TimelineViewLayout";
import { KanbanViewLayout } from "../layouts/board/KanbanViewLayout";
import { SubNavigation } from "../components/board/SubNavigation";
import { Typography } from "@taskflow/ui";

export const BoardPage = () => {
    return (
        <div className="w-full h-full">
            {/* Header with Navigation */}
            <div className="w-full px-6 sm:px-8 lg:px-12 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <Typography variant="heading-xl" className="font-bold mb-1">
                                Finance Dashboard
                            </Typography>
                            <Typography variant="body-small" textColor="muted">
                                Manage your tasks and projects efficiently
                            </Typography>
                        </div>
                    </div>
                    <SubNavigation />
                </div>
            </div>

            {/* Routes */}
            <Routes>
                <Route path="/" element={<KanbanViewLayout />} />
                <Route path="/kanban" element={<KanbanViewLayout />} />
                <Route path="/list" element={<ListViewLayout />} />
                <Route path="/timeline" element={<TimelineViewLayout />} />
                <Route path="/task/:taskId" element={<TaskDetailsLayout />} />
                <Route path="/task" element={<TaskDetailsLayout />} />
            </Routes>
        </div>
    );
};
