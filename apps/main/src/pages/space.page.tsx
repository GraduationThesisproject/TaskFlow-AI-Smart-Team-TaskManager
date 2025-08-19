import { Routes, Route } from "react-router-dom";
import { TaskDetailsLayout } from "../layouts/space/TaskDetailsLayout";
import { ListViewLayout } from "../layouts/space/ListViewLayout";
import { TimelineViewLayout } from "../layouts/space/TimelineViewLayout";
import { KanbanViewLayout } from "../layouts/space/KanbanViewLayout";

export const SpacePage = () => {
    return (
        <div>
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