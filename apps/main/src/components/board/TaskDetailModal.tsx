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
  Stack,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Checkbox,
  Progress,
  TextArea,
  Card,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';
import type { Task, File, Comment } from '../../types/task.types';
import { CommentItem } from './CommentItem';
import { CommentService } from '../../services/commentService';
import type { TaskDetailModalProps, Subtask } from '../../types/interfaces/ui';

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

  // Mock users for demonstration - moved outside component to prevent recreation
  const users = React.useMemo(() => [
    { _id: '1', name: 'John Doe', email: 'john@example.com', avatar: '' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: '' },
    { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: '' },
  ], []);

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

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    
    try {
      const response = await CommentService.createComment({
        taskId: task._id,
        content: newComment,
        author: 'user_1', // This should come from auth context
      });
      
      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCommentUpdate = async (commentId: string, content: string) => {
    try {
      const response = await CommentService.updateComment(commentId, { content });
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
      const response = await CommentService.createReply(commentId, {
        content,
        author: 'user_1', // This should come from auth context
      });
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), response.data] }
          : comment
      ));
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
        size="lg"
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
            <div>
              <Typography variant="h4" className="font-semibold text-foreground">
                {task.title}
              </Typography>
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
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
            >
              Delete
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Task Details */}
            <Card className="p-3 border border-border/20">
              <div className="space-y-3">
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                    Title
                  </Typography>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter task title..."
                    className="text-sm font-medium h-8"
                  />
                </div>

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

            {/* Comments Section */}
            <Card className="p-3 border border-border/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="h5" className="font-semibold text-sm">
                    Comments
                  </Typography>
                  <Badge variant="outline" size="sm" className="text-xs px-2 py-0.5">
                    {comments.length}
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Task Info */}
            <Card className="p-3 border border-border/20">
              <Typography variant="h5" className="font-semibold mb-3 text-sm">
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
              <Typography variant="h5" className="font-semibold mb-3 text-sm">
                Assignees
              </Typography>
              <div className="space-y-1.5">
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map((assigneeId) => {
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
                <Typography variant="h5" className="font-semibold mb-3 text-sm">
                  Tags
                </Typography>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag, index) => (
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