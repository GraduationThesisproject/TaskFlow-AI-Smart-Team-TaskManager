import React from 'react';
import { Routes, Route, useParams } from "react-router-dom";
import { TaskDetailsLayout } from "../layouts/board/TaskDetailsLayout";
import { ListViewLayout } from "../layouts/board/ListViewLayout";
import { TimelineViewLayout } from "../layouts/board/TimelineViewLayout";
import { KanbanViewLayout } from "../layouts/board/KanbanViewLayout";
import { SubNavigation } from "../components/board/SubNavigation";
import { Typography } from "@taskflow/ui";

export const BoardPage = () => {
    const { boardId } = useParams<{ boardId: string }>();
    
    console.log('BoardPage - boardId:', boardId);

    return (
        <div className="w-full h-full">
            {/* Sub Navigation for switching between board views */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
                <div className="px-6 sm:px-8 lg:px-12 py-4">
                    <SubNavigation items={[]} />
                </div>
            </div>
            
            {/* Board Content */}
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
