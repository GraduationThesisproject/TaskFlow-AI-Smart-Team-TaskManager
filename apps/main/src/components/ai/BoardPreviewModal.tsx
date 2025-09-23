import React, { useState, useCallback } from 'react';
import { Button } from '@taskflow/ui';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  Check, 
  Tag, 
  Palette,
  Eye,
  EyeOff,
  Save,
  RotateCcw
} from 'lucide-react';

interface BoardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (boardData: any) => void;
  initialData: any;
}

interface Column {
  name: string;
  description: string;
  color: string;
  order: number;
}

interface Task {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  tags: string[];
  column: string;
  checklists?: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Tag {
  name: string;
  color: string;
  category: string;
}

const BoardPreviewModal: React.FC<BoardPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialData
}) => {
  const [boardData, setBoardData] = useState(initialData);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');

  const colorPalette = [
    '#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1', '#F43F5E'
  ];

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const updateBoardName = useCallback((name: string) => {
    setBoardData(prev => ({
      ...prev,
      board: { ...prev.board, name }
    }));
  }, []);

  const updateBoardDescription = useCallback((description: string) => {
    setBoardData(prev => ({
      ...prev,
      board: { ...prev.board, description }
    }));
  }, []);

  const addColumn = useCallback(() => {
    if (!newColumnName.trim()) return;
    
    const newColumn: Column = {
      name: newColumnName,
      description: '',
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      order: boardData.columns.length
    };
    
    setBoardData(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
    
    setNewColumnName('');
    setShowAddColumn(false);
  }, [newColumnName, boardData.columns.length]);

  const updateColumn = useCallback((columnName: string, updates: Partial<Column>) => {
    setBoardData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.name === columnName ? { ...col, ...updates } : col
      )
    }));
    setEditingColumn(null);
  }, []);

  const removeColumn = useCallback((columnName: string) => {
    setBoardData(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.name !== columnName),
      tasks: prev.tasks.map(task => 
        task.column === columnName 
          ? { ...task, column: prev.columns[0]?.name || 'To Do' }
          : task
      )
    }));
  }, []);

  const addTask = useCallback((columnName: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      title: newTaskTitle,
      description: '',
      priority: 'medium',
      tags: [],
      column: columnName,
      checklists: []
    };
    
    setBoardData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    
    setNewTaskTitle('');
    setShowAddTask(false);
  }, [newTaskTitle]);

  const updateTask = useCallback((taskTitle: string, updates: Partial<Task>) => {
    setBoardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.title === taskTitle ? { ...task, ...updates } : task
      )
    }));
    setEditingTask(null);
  }, []);

  const removeTask = useCallback((taskTitle: string) => {
    setBoardData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.title !== taskTitle)
    }));
  }, []);

  const moveTask = useCallback((taskTitle: string, newColumn: string) => {
    setBoardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.title === taskTitle ? { ...task, column: newColumn } : task
      )
    }));
  }, []);

  const addTag = useCallback(() => {
    if (!newTagName.trim()) return;
    
    const newTag: Tag = {
      name: newTagName,
      color: newTagColor,
      category: 'custom'
    };
    
    setBoardData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));
    
    setNewTagName('');
    setNewTagColor('#6B7280');
    setShowAddTag(false);
  }, [newTagName, newTagColor]);

  const updateTag = useCallback((tagName: string, updates: Partial<Tag>) => {
    setBoardData(prev => ({
      ...prev,
      tags: prev.tags.map(tag => 
        tag.name === tagName ? { ...tag, ...updates } : tag
      )
    }));
    setEditingTag(null);
  }, []);

  const removeTag = useCallback((tagName: string) => {
    setBoardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => ({
        ...task,
        tags: task.tags.filter(tag => tag !== tagName)
      })),
      tags: prev.tags.filter(tag => tag.name !== tagName)
    }));
  }, []);

  const addChecklistItem = useCallback((taskTitle: string, text: string) => {
    if (!text.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text,
      completed: false
    };
    
    setBoardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.title === taskTitle 
          ? { 
              ...task, 
              checklists: [...(task.checklists || []), newItem] 
            }
          : task
      )
    }));
  }, []);

  const toggleChecklistItem = useCallback((taskTitle: string, itemId: string) => {
    setBoardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.title === taskTitle 
          ? {
              ...task,
              checklists: task.checklists?.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ) || []
            }
          : task
      )
    }));
  }, []);

  const removeChecklistItem = useCallback((taskTitle: string, itemId: string) => {
    setBoardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.title === taskTitle 
          ? {
              ...task,
              checklists: task.checklists?.filter(item => item.id !== itemId) || []
            }
          : task
      )
    }));
  }, []);

  const resetToOriginal = useCallback(() => {
    setBoardData(initialData);
  }, [initialData]);

  const getTasksForColumn = useCallback((columnName: string) => {
    return boardData.tasks.filter(task => task.column === columnName);
  }, [boardData.tasks]);

  const getTagByName = useCallback((tagName: string) => {
    return boardData.tags.find(tag => tag.name === tagName);
  }, [boardData.tags]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-7xl h-[90vh] bg-background rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Board Preview</h2>
              <p className="text-sm text-muted-foreground">Review and customize your AI-generated board</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToOriginal}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Panel - Board Info */}
          <div className="w-80 border-r border-border bg-muted/20 p-6 overflow-y-auto">
            {/* Board Details */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Board Name</label>
                <input
                  type="text"
                  value={boardData.board.name}
                  onChange={(e) => updateBoardName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <textarea
                  value={boardData.board.description}
                  onChange={(e) => updateBoardDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Tags Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">Tags</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddTag(true)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {boardData.tags.map((tag: Tag) => (
                    <div key={tag.name} className="flex items-center gap-2 p-2 bg-background rounded-md border border-border">
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 text-sm text-foreground">{tag.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTag(tag.name)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTag(tag.name)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {showAddTag && (
                    <div className="p-3 bg-background rounded-md border border-border space-y-2">
                      <input
                        type="text"
                        placeholder="Tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Color:</span>
                        <div className="flex gap-1">
                          {colorPalette.map(color => (
                            <button
                              key={color}
                              onClick={() => setNewTagColor(color)}
                              className={`w-6 h-6 rounded-full border-2 ${
                                newTagColor === color ? 'border-foreground' : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={addTag}
                          disabled={!newTagName.trim()}
                          className="text-xs"
                        >
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddTag(false);
                            setNewTagName('');
                          }}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Board Preview */}
          <div className="flex-1 p-6 overflow-y-auto relative">
            <div className="space-y-6">
              {/* Columns */}
              <div className="space-y-4">
                {boardData.columns.map((column: Column) => (
                  <div key={column.name} className="space-y-3">
                    {/* Column Header */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: column.color }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{column.name}</h3>
                        {column.description && (
                          <p className="text-sm text-muted-foreground">{column.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingColumn(column.name)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColumn(column.name)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2 ml-4">
                      {getTasksForColumn(column.name).map((task: Task) => (
                        <div key={task.title} className="p-3 bg-background rounded-md border border-border space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground">{task.title}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                              )}
                              
                              {/* Tags */}
                              {task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {task.tags.map(tagName => {
                                    const tag = getTagByName(tagName);
                                    return tag ? (
                                      <span
                                        key={tagName}
                                        className="px-2 py-0.5 rounded text-xs text-white"
                                        style={{ backgroundColor: tag.color }}
                                      >
                                        {tagName}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}

                              {/* Checklists */}
                              {task.checklists && task.checklists.length > 0 && (
                                <div className="space-y-1">
                                  {task.checklists.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 text-sm">
                                      <button
                                        onClick={() => toggleChecklistItem(task.title, item.id)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                                          item.completed 
                                            ? 'bg-primary border-primary text-primary-foreground' 
                                            : 'border-border'
                                        }`}
                                      >
                                        {item.completed && <Check className="w-3 h-3" />}
                                      </button>
                                      <span className={item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                                        {item.text}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeChecklistItem(task.title, item.id)}
                                        className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive ml-auto"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTask(task.title)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTask(task.title)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Task Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddTask(true)}
                        className="w-full text-muted-foreground hover:text-foreground border-dashed border border-border"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Add Column Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddColumn(true)}
                  className="w-full text-muted-foreground hover:text-foreground border-dashed border-2 border-border"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t-2 border-primary/20 bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0 shadow-lg">
          <div className="text-sm text-muted-foreground">
            {boardData.columns.length} columns • {boardData.tasks.length} tasks • {boardData.tags.length} tags
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('🔍 Create Board button clicked, boardData:', boardData);
                onConfirm(boardData);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardPreviewModal;
