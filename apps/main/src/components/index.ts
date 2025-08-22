// Export space components with aliases to avoid conflicts
export { BoardCard as SpaceBoardCard } from './space/BoardCard';
export { CreateBoardModal as SpaceCreateBoardModal } from './space/CreateBoardModal';
export { SpaceHeader } from './space/SpaceHeader';
export { AddTaskModal as SpaceAddTaskModal } from './space/AddTaskModal';
export { AddColumnModal as SpaceAddColumnModal } from './space/AddColumnModal';
export { DraggableTask as SpaceDraggableTask } from './space/DraggableTask';
export { DraggableColumn as SpaceDraggableColumn } from './space/DraggableColumn';
export { SubNavigation as SpaceSubNavigation } from './space/SubNavigation';

// Export board components with aliases to avoid conflicts
export { AddTaskModal as BoardAddTaskModal } from './board/AddTaskModal';
export { AddColumnModal as BoardAddColumnModal } from './board/AddColumnModal';
export { DraggableTask as BoardDraggableTask } from './board/DraggableTask';
export { DraggableColumn as BoardDraggableColumn } from './board/DraggableColumn';
export { SubNavigation as BoardSubNavigation } from './board/SubNavigation';
export { TaskDetailModal } from './board/TaskDetailModal';
export { CommentItem } from './board/CommentItem';
export { PermissionGuard } from './common/PermissionGuard';
export { withPermissions } from './common/withPermissions';
export { ProtectedRoute } from './common/ProtectedRoute';
export { PublicRoute } from './common/PublicRoute';
export { NavigationGuard, ProtectedLink } from './common/NavigationGuard';
export { LogoutConfirmDialog } from './common/LogoutConfirmDialog';
export { ThemeToggle } from './common/ThemeToggle';
export { ThemeSettings } from './settings/ThemeSettings';
export { CreateWorkspaceModal } from "./workspace/CreateWorkspaceModal"
export { useWorkspacesAPI } from './workspace/useWorkspacesAPI';
