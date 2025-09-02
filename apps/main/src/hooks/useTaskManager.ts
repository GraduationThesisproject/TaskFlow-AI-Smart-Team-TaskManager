import { useTasks } from './useTasks';
import { useBoards } from './useBoards';
import { useColumns } from './useColumns';
import { useSpaces } from './useSpaces';

export const useTaskManager = () => {
  const tasks = useTasks();
  const boards = useBoards();
  const columns = useColumns();
  const spaces = useSpaces();

  return {
    // Task-related functionality
    ...tasks,
    
    // Board-related functionality
    boards: boards.boards,
    currentBoard: boards.currentBoard,
    boardLoading: boards.loading,
    boardError: boards.error,
    activeBoards: boards.activeBoards,
    archivedBoards: boards.archivedBoards,
    templateBoards: boards.templateBoards,
    loadBoard: boards.loadBoard,
    loadBoardsBySpace: boards.loadBoardsBySpace,
    addBoard: boards.addBoard,
    editBoard: boards.editBoard,
    removeBoard: boards.removeBoard,
    selectBoard: boards.selectBoard,
    
    // Column-related functionality
    columns: columns.columns,
    columnLoading: columns.loading,
    columnError: columns.error,
    columnDragState: columns.dragState,
    sortedColumns: columns.sortedColumns,
    activeColumns: columns.activeColumns,
    archivedColumns: columns.archivedColumns,
    loadColumnsByBoard: columns.loadColumnsByBoard,
    addColumn: columns.addColumn,
    editColumn: columns.editColumn,
    removeColumn: columns.removeColumn,
    reorderColumns: columns.reorderColumns,
    startDraggingColumn: columns.startDragging,
    stopDraggingColumn: columns.stopDragging,
    getColumnsByBoard: columns.getColumnsByBoard,
    getSortedColumnsByBoard: columns.getSortedColumnsByBoard,
    
    // Space-related functionality
    spaces: spaces.spaces,
    currentSpace: spaces.currentSpace,
    spaceLoading: spaces.loading,
    spaceError: spaces.error,
    activeSpaces: spaces.activeSpaces,
    archivedSpaces: spaces.archivedSpaces,
    loadSpace: spaces.loadSpace,
    loadSpacesByWorkspace: spaces.loadSpacesByWorkspace,
    addSpace: spaces.addSpace,
    editSpace: spaces.editSpace,
    removeSpace: spaces.removeSpace,
    loadSpaceMembers: spaces.loadSpaceMembers,
    addSpaceMember: spaces.addMember,
    removeSpaceMember: spaces.removeMember,
    selectSpace: spaces.selectSpace,
    getSpacesByWorkspace: spaces.getSpacesByWorkspace,
    getActiveSpacesByWorkspace: spaces.getActiveSpacesByWorkspace,
  };
};
