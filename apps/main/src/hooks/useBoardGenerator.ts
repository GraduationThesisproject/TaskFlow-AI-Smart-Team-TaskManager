import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useBoard } from './useBoard';
import { useBoards } from './useBoards';
import { useColumns } from './useColumns';
import { useTasks } from './useTasks';
import { useToast } from './useToast';
import { useAuth } from './useAuth';
import { createTask } from '../store/slices/taskSlice';

interface AIGeneratedBoard {
  board: {
    name: string;
    description: string;
    type: 'kanban' | 'list' | 'calendar' | 'timeline';
    visibility: 'private' | 'workspace' | 'public';
    settings: {
      allowComments: boolean;
      allowAttachments: boolean;
      allowTimeTracking: boolean;
      defaultTaskPriority: 'low' | 'medium' | 'high' | 'critical';
      autoArchive: boolean;
      archiveAfterDays: number;
    };
  };
  columns: Array<{
    name: string;
    position: number;
    color: string;
    backgroundColor: string;
    limit: number | null;
    settings: {
      wipLimit: {
        enabled: boolean;
        limit: number | null;
        strictMode: boolean;
      };
      sorting: {
        method: 'manual' | 'priority' | 'due_date' | 'created_date' | 'alphabetical';
        direction: 'asc' | 'desc';
        autoSort: boolean;
      };
    };
    style: {
      color: string;
      backgroundColor: string;
      icon: string | null;
    };
  }>;
  tasks: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    color: string;
    assignees: string[];
    tags: string[];
    dueDate: string | null;
    estimatedHours: number | null;
    position: number;
    column: string;
  }>;
  tags: Array<{
    name: string;
    color: string;
    textColor: string;
    category: 'priority' | 'status' | 'type' | 'department' | 'custom';
    description: string;
    scope: 'board';
  }>;
  checklists: Array<{
    title: string;
    items: Array<{
      text: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      position: number;
      estimatedMinutes: number | null;
    }>;
  }>;
}

export function useBoardGenerator() {
  const dispatch = useDispatch();
  const { addBoard } = useBoards();
  const { currentBoard, createBoardTag } = useBoard();
  const { addColumn } = useColumns();
  const { addTask } = useTasks();
  const toast = useToast();
  const { user } = useAuth();

  // Direct task creation using HTTP API for AI board generation
  const addTaskDirectly = useCallback(async (taskData: any) => {
    try {
      const result = await dispatch(createTask(taskData) as any).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to create task directly:', error);
      throw error;
    }
  }, [dispatch]);

  const generateBoardFromAI = useCallback(async (aiBoardData: AIGeneratedBoard, workspaceId?: string) => {
    try {
      console.log('🤖 AI Board Data received:', aiBoardData);
      console.log('📊 Columns to create:', aiBoardData.columns?.length || 0);
      console.log('📝 Tasks to create:', aiBoardData.tasks?.length || 0);
      
      // Step 1: Create the board
      const boardData = {
        name: aiBoardData.board.name,
        description: aiBoardData.board.description,
        type: aiBoardData.board.type,
        spaceId: workspaceId, // Backend expects spaceId, not workspace
        theme: {
          color: '#3B82F6', // Default theme color
          opacity: 1.0
        }
      };

      // Create the board using the Redux action directly to get the response
      const result = await addBoard(boardData);
      
      // Extract the board from the response
      const createdBoard = result?.board || result;
      
      if (!createdBoard || !createdBoard._id) {
        throw new Error('Failed to create board - no board ID returned');
      }

      toast.success(`Board "${createdBoard.name}" created successfully!`, 'AI Board Generation');

      // Step 2: Create columns
      const createdColumns = [];
      for (const columnData of aiBoardData.columns) {
        try {
          console.log('Creating column with data:', columnData);
          const column = await addColumn({
            boardId: createdBoard._id,
            name: columnData.name,
            position: columnData.position,
            color: columnData.color,
            backgroundColor: columnData.backgroundColor,
            limit: columnData.limit,
            settings: columnData.settings,
            style: columnData.style
          });
          
          console.log('✅ Column created successfully:', column);
          
          if (column) {
            createdColumns.push(column);
            console.log('📝 Added column to createdColumns array. Current length:', createdColumns.length);
          } else {
            console.warn('⚠️ Column creation returned null/undefined');
          }
        } catch (error) {
          console.error(`Failed to create column ${columnData.name}:`, error);
        }
      }

      // Step 3: Create board tags
      for (const tagData of aiBoardData.tags) {
        try {
          await createBoardTag(createdBoard._id, {
            name: tagData.name,
            color: tagData.color
          });
        } catch (error) {
          console.error(`Failed to create tag ${tagData.name}:`, error);
        }
      }

      // Step 4: Create tasks
      const createdTasks = [];
      console.log('Creating tasks:', aiBoardData.tasks);
      console.log('📊 Available columns for task assignment:', createdColumns.map(c => ({ name: c.name, id: c._id || c.id })));
      
      if (!aiBoardData.tasks || aiBoardData.tasks.length === 0) {
        console.warn('⚠️ No tasks found in AI board data');
      } else {
        for (const taskData of aiBoardData.tasks) {
          try {
            // Find the corresponding column
            const targetColumn = createdColumns.find(col => 
              col.name.toLowerCase() === taskData.column.toLowerCase()
            );
            
            console.log(`Looking for column "${taskData.column}" in created columns:`, createdColumns.map(c => c.name));
            
            if (targetColumn) {
              const taskDataToSend = {
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                color: taskData.color,
                assignees: taskData.assignees,
                tags: taskData.tags,
                dueDate: taskData.dueDate,
                estimatedHours: taskData.estimatedHours,
                position: taskData.position,
                board: createdBoard._id,
                column: targetColumn._id
              };
              
              console.log('Creating task with data:', taskDataToSend);
              
              // Force HTTP API usage instead of socket for AI board generation
              const task = await addTaskDirectly(taskDataToSend);
              
              if (task) {
                createdTasks.push(task);
              }
            } else {
              console.warn(`❌ Column "${taskData.column}" not found for task "${taskData.title}"`);
            }
          } catch (error) {
            console.error(`Failed to create task ${taskData.title}:`, error);
          }
        }
      }

      // Step 5: Create checklists (if any)
      // Note: This would require additional API endpoints for checklist creation
      // For now, we'll skip this step

      console.log('✅ Board generation completed:', {
        board: createdBoard.name,
        columnsCreated: createdColumns.length,
        tasksCreated: createdTasks.length,
        tagsCreated: aiBoardData.tags?.length || 0
      });

      return {
        board: createdBoard,
        columns: createdColumns,
        tasks: createdTasks,
        tags: aiBoardData.tags,
        checklists: aiBoardData.checklists
      };

    } catch (error) {
      console.error('Board generation failed:', error);
      toast.error('Failed to generate board from AI data', 'AI Board Generation');
      throw error;
    }
  }, [addBoard, addColumn, addTask, createBoardTag, toast, user?.id]);

  const generateBoardWithConfirmation = useCallback(async (aiBoardData: AIGeneratedBoard, workspaceId?: string) => {
    // This function now returns the data for preview modal
    // The actual generation will be handled by the preview modal
    return aiBoardData;
  }, []);

  const generateBoardFromPreview = useCallback(async (aiBoardData: AIGeneratedBoard, workspaceId?: string) => {
    return await generateBoardFromAI(aiBoardData, workspaceId);
  }, [generateBoardFromAI]);

  return {
    generateBoardFromAI,
    generateBoardWithConfirmation,
    generateBoardFromPreview
  };
}
