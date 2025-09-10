import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody,
  Button,
  Input,
  Select,
  SelectOption,
  Badge,
  Typography,
  Avatar,
  AvatarImage,
  AvatarFallback,
  TextArea,
  Card,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';
import type { Task, Comment } from '../../types/task.types';
import { CommentItem } from './CommentItem';
import { CommentService } from '../../services/commentService';
import type { TaskDetailModalProps } from '../../types/interfaces/ui';
import { useBoard } from '../../hooks';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-800 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  done: 'bg-green-100 text-green-800 border-green-200',
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showAssigneesPanel, setShowAssigneesPanel] = useState(false);
  const assigneesPanelRef = React.useRef<HTMLDivElement | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [checklistItems, setChecklistItems] = useState<Array<{ text: string; completed: boolean }>>([]);

  const { currentBoard } = useBoard();
  // Build users list from current board members
  const users = React.useMemo<{ _id: string; name: string; email?: string; avatar?: string }[]>(() => {
    const rawMembers = (currentBoard as any)?.members || [];
    return rawMembers.map((member: any) => {
      const user = member?.user || member;
      return {
        _id: user?._id || user?.id || member?._id || member?.id || '',
        name: user?.name || user?.fullName || user?.username || user?.email || 'Member',
        email: user?.email,
        avatar: user?.avatar || user?.photo || user?.imageUrl,
      };
    }).filter((u: any) => !!u._id);
  }, [currentBoard?.members]);

  // Close assignees dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!showAssigneesPanel) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!assigneesPanelRef.current) return;
      const target = e.target as Node;
      if (!assigneesPanelRef.current.contains(target)) {
        setShowAssigneesPanel(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAssigneesPanel(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAssigneesPanel]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        color: task.color || '#6B7280',
        dueDate: task.dueDate,
        tags: task.tags,
        assignees: task.assignees,
      });
      setTitleInput(task.title || '');
      setChecklistItems([]);
    }
  }, [task, users]);

  const loadComments = React.useCallback(async () => {
    if (!task) return;
    
    setIsLoadingComments(true);
    try {
      const response = await CommentService.getTaskComments(task._id);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [task?._id]);

  // Separate useEffect for loading comments
  useEffect(() => {
    if (task && isOpen) {
      loadComments();
    }
  }, [task?._id, isOpen, loadComments]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!task) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDelete(task._id);
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleTitleConfirm = () => {
    const value = titleInput.trim();
    if (!value) return;
    setFormData(prev => ({ ...prev, title: value }));
    setIsEditingTitle(false);
  };

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), value] }));
    setTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (value: string) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== value) }));
  };

  const handleAssignUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees?.includes(userId)
        ? prev.assignees
        : [...(prev.assignees || []), userId]
    }));
  };

  const handleUnassignUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: (prev.assignees || []).filter(id => id !== userId)
    }));
  };

  const handleAddChecklistItem = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setChecklistItems(prev => [{ text: value, completed: false }, ...prev]);
  };

  const handleToggleChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.map((item, i) => i === index ? { ...item, completed: !item.completed } : item));
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    
    try {
      const response = await CommentService.addComment(task._id, { content: newComment });
      
      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCommentUpdate = async (commentId: string, content: string) => {
    try {
      const response = await CommentService.updateComment(commentId, content);
      setComments(prev => prev.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      await CommentService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleReplyAdd = async (commentId: string, content: string) => {
    try {
      const response = await CommentService.addReply(commentId, content);
      setComments(prev => prev.map(comment => {
        if (comment._id !== commentId) return comment;
        const next = { ...comment } as any;
        next.replies = [...(next.replies || []), response.data];
        return next as Comment;
      }));
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!task) return null;

  return (
    <>
      {/* Hide the default close button */}
      <style>{`
        [aria-label="Close modal"] {
          display: none !important;
        }
        .modal-close-button {
          display: none !important;
        }
      `}</style>
      
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="6xl"
        className={`transition-all duration-300 ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
      <ModalHeader className="border-b border-border/30 pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {/* Task Color Indicator */}
            {task.color && (
              <div
                className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: task.color }}
              />
            )}
            <div className="min-w-0">
              {isEditingTitle ? (
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleConfirm}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleConfirm();
                    if (e.key === 'Escape') { setTitleInput(formData.title || task.title || ''); setIsEditingTitle(false); }
                  }}
                  autoFocus
                  className="h-8 text-sm font-semibold border-transparent focus:border-transparent focus:ring-0 shadow-none bg-transparent"
                />
              ) : (
                <Typography
                  variant="h4"
                  className="font-semibold text-foreground truncate cursor-text"
                  onDoubleClick={() => setIsEditingTitle(true)}
                  title="Double-click to edit title"
                >
                  {formData.title || task.title}
                </Typography>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge 
                  variant="outline" 
                  size="sm"
                  className={`text-xs px-2 py-0.5 ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.todo}`}
                >
                  {STATUS_OPTIONS.find(s => s.value === task.status)?.label || 'To Do'}
                </Badge>
                <Badge 
                  variant="outline" 
                  size="sm"
                  className={`text-xs px-2 py-0.5 ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium}`}
                >
                  {PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label || 'Medium'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Assign Button / Avatars */}
            <div className="relative" ref={assigneesPanelRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssigneesPanel((s) => !s)}
                className="w-8 h-8 p-0 rounded-full border border-border hover:bg-muted/50"
                title="Assign user"
              >
                <span className="text-lg leading-none">+</span>
              </Button>
              {showAssigneesPanel && (
                <div className="absolute right-0 mt-1 w-56 bg-background border border-border rounded-lg shadow-lg p-2 z-50">
                  <div className="max-h-48 overflow-auto space-y-1">
                    {(users || []).map(u => (
                      <div key={u._id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Avatar size="xs">
                            {u.avatar ? <AvatarImage src={u.avatar} alt={u.name} /> : null}
                            <AvatarFallback variant={getAvatarColor(u.name)} className="text-[10px]">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <Typography variant="body-small" className="text-xs">{u.name}</Typography>
                        </div>
                        {(formData.assignees || []).includes(u._id) ? (
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => handleUnassignUser(u._id)}>Remove</Button>
                        ) : (
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => handleAssignUser(u._id)}>Add</Button>
                        )}
                      </div>
                    ))}
                    {(users || []).length === 0 && (
                      <Typography variant="body-small" className="text-xs text-muted-foreground p-2">No users available</Typography>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Cancel"
              className="w-8 h-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              title="Delete"
              className="w-8 h-8 p-0 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSubmitting}
              title="Save"
              className="w-9 h-9 p-0 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Left: Description + Checklist */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-3 border border-border/20">
              <div className="space-y-3">
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                    Description
                  </Typography>
                  <TextArea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter task description..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                      Status
                    </Typography>
                    <Select
                      value={formData.status || 'todo'}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <SelectOption key={option.value} value={option.value}>
                          {option.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                      Priority
                    </Typography>
                    <Select
                      value={formData.priority || 'medium'}
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectOption key={option.value} value={option.value}>
                          {option.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                    Due Date
                  </Typography>
                  <Input
                    type="date"
                    value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full h-8 text-sm"
                  />
                </div>
              </div>
            </Card>
            {/* Checklist */}
            <Card className="p-3 border border-border/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold text-sm">Checklist</Typography>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleAddChecklistItem('New item')}>+ Add item</Button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {checklistItems.length === 0 ? (
                    <Typography variant="body-small" className="text-muted-foreground text-xs">No items</Typography>
                  ) : (
                    checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-md border border-border/20">
                        <input type="checkbox" className="w-4 h-4" checked={item.completed} onChange={() => handleToggleChecklistItem(index)} />
                        <Typography variant="body-small" className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</Typography>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveChecklistItem(index)}>×</Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Tags + Comments */}
          <div className="space-y-3">
            {/* Tags */}
            <Card className="p-3 border border-border/20">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h4" className="font-semibold text-sm">Tags</Typography>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowTagInput(s => !s)}>＋</Button>
              </div>
              {showTagInput && (
                <div className="flex gap-2 mb-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="New tag" className="h-8 text-sm" onKeyDown={(e) => { if (e.key==='Enter') handleAddTag(); }} />
                  <Button size="sm" variant="outline" className="h-8" onClick={handleAddTag} disabled={!tagInput.trim()}>Add</Button>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {(formData.tags || []).length === 0 ? (
                  <Typography variant="body-small" className="text-muted-foreground text-xs">No tags</Typography>
                ) : (
                  (formData.tags || []).map((tag, index) => (
                    <Badge key={index} variant="outline" size="sm" className="text-xs px-2 py-0.5 cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))
                )}
              </div>
            </Card>

            {/* Comments */}
            <Card className="p-3 border border-border/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="h4" className="font-semibold text-sm">
                    Comments
                  </Typography>
                  <Badge variant="outline" size="sm" className="text-xs px-2 py-0.5">
                    {comments.length}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {isLoadingComments ? (
                    <div className="text-center py-3">
                      <Typography variant="body-small" className="text-muted-foreground text-xs">
                        Loading comments...
                      </Typography>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-3">
                      <Typography variant="body-small" className="text-muted-foreground text-xs">
                        No comments yet. Be the first to comment!
                      </Typography>
                    </div>
                  ) : (
                    comments
                      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                      .map((comment: Comment) => (
                        <CommentItem
                          key={comment._id}
                          comment={comment}
                          users={users}
                          currentUserId="user_1"
                          onCommentUpdate={handleCommentUpdate}
                          onCommentDelete={handleCommentDelete}
                          onReplyAdd={handleReplyAdd}
                        />
                      ))
                  )}
                </div>
                <div className="border-t border-border/30 pt-3">
                  <div className="flex gap-2">
                    <Avatar size="sm" className="ring-1 ring-border flex-shrink-0 w-6 h-6">
                      {users[0]?.avatar ? (
                        <AvatarImage src={users[0].avatar} alt={users[0]?.name || 'You'} />
                      ) : null}
                      <AvatarFallback variant={getAvatarColor(users[0]?.name || 'You')} className="text-xs">
                        {getInitials(users[0]?.name || 'You')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <TextArea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                        className="resize-none text-sm"
                      />
                      <div className="flex justify-end mt-1.5">
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="px-3 py-1 text-xs font-medium bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Task Info (moved below) */}
            <Card className="p-3 border border-border/20">
              <Typography variant="h4" className="font-semibold mb-3 text-sm">
                Task Info
              </Typography>
              <div className="space-y-2">
                <div>
                  <Typography variant="body-small" className="text-muted-foreground text-xs">
                    Created
                  </Typography>
                  <Typography variant="body-medium" className="text-sm">
                    {formatDate(task.createdAt)}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body-small" className="text-muted-foreground text-xs">
                    Last Updated
                  </Typography>
                  <Typography variant="body-medium" className="text-sm">
                    {formatDate(task.updatedAt)}
                  </Typography>
                </div>

                {task.dueDate && (
                  <div>
                    <Typography variant="body-small" className="text-muted-foreground text-xs">
                      Due Date
                    </Typography>
                    <Typography variant="body-medium" className="text-sm">
                      {formatDate(task.dueDate)}
                    </Typography>
                  </div>
                )}
              </div>
            </Card>

            {/* Assignees */}
            <Card className="p-3 border border-border/20">
              <Typography variant="h4" className="font-semibold mb-3 text-sm">
                Assignees
              </Typography>
              <div className="space-y-1.5">
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map((assigneeId: string) => {
                    const user = users.find(u => u._id === assigneeId);
                    return user ? (
                      <div key={assigneeId} className="flex items-center gap-2">
                        <Avatar size="sm" className="w-6 h-6">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : null}
                          <AvatarFallback variant={getAvatarColor(user.name)} className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Typography variant="body-medium" className="text-sm">
                          {user.name}
                        </Typography>
                      </div>
                    ) : null;
                  })
                ) : (
                  <Typography variant="body-small" className="text-muted-foreground text-xs">
                    No assignees
                  </Typography>
                )}
              </div>
            </Card>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <Card className="p-3 border border-border/20">
                <Typography variant="h4" className="font-semibold mb-3 text-sm">
                  Tags
                </Typography>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" size="sm" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
    </>
  );
};