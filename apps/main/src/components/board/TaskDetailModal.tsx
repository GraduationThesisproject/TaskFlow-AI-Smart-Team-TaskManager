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
  Flex,
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
import type { Task, User, File, Comment } from '../../types/task.types';
import { CommentItem } from './CommentItem';
import { CommentService } from '../../services/commentService';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  assignee?: User;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
  users?: User[];
}

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
  { value: 'urgent', label: 'Urgent' },
];

const LABEL_COLORS = {
  'Design': 'bg-blue-500',
  'Frontend': 'bg-teal-500',
  'Priority': 'bg-gray-500',
  'Backend': 'bg-purple-500',
  'UI/UX': 'bg-pink-500',
  'Bug': 'bg-red-500',
  'Feature': 'bg-green-500',
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  users = [],
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        assignees: task.assignees,
      });
      
      // Mock subtasks data
      setSubtasks([
        {
          id: '1',
          title: 'Create wireframes',
          completed: true,
          dueDate: new Date('2024-12-15'),
          assignee: users[0],
        },
        {
          id: '2',
          title: 'Design components',
          completed: false,
          dueDate: new Date('2024-12-18'),
          assignee: users[1],
        },
        {
          id: '3',
          title: 'Implement responsive design',
          completed: false,
          dueDate: new Date('2024-12-20'),
          assignee: users[2],
        },
        {
          id: '4',
          title: 'Add animations',
          completed: false,
          dueDate: new Date('2024-12-22'),
          assignee: users[0],
        },
        {
          id: '5',
          title: 'Test on different devices',
          completed: false,
          dueDate: new Date('2024-12-25'),
          assignee: users[1],
        },
      ]);

      // Load comments for the task
      loadComments();
    }
  }, [task, users]);

  const loadComments = async () => {
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
  };

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setSubtasks(prev => 
      prev.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    );
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
      };
      setSubtasks(prev => [...prev, subtask]);
      setNewSubtask('');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    
    setIsSubmitting(true);
    try {
      const response = await CommentService.addComment(task._id, {
        content: newComment.trim(),
        mentions: []
      });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (commentId: string, updatedComment: Comment) => {
    setComments(prev => 
      prev.map(comment => 
        comment._id === commentId ? updatedComment : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  };

  const handleReplyAdd = (parentCommentId: string, reply: Comment) => {
    setComments(prev => [...prev, reply]);
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.tags?.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== labelToRemove) || []
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const totalSubtasks = subtasks.length;

  // Mock data for demonstration
  const mockAttachments: File[] = [
    {
      _id: '1',
      filename: 'mockup-v1.png',
      originalName: 'mockup-v1.png',
      mimeType: 'image/png',
      size: 2.4 * 1024 * 1024, // 2.4 MB
      path: '/uploads/tasks/mockup-v1.png',
      extension: 'png',
      checksum: 'abc123',
      uploadedBy: 'user_1',
      space: 'space_1',
      attachedTo: { entityType: 'task', entityId: 'task_1' },
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      filename: 'requirements.pdf',
      originalName: 'requirements.pdf',
      mimeType: 'application/pdf',
      size: 1.8 * 1024 * 1024, // 1.8 MB
      path: '/uploads/tasks/requirements.pdf',
      extension: 'pdf',
      checksum: 'def456',
      uploadedBy: 'user_1',
      space: 'space_1',
      attachedTo: { entityType: 'task', entityId: 'task_1' },
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];



  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    return '📎';
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="max-w-7xl">
      <ModalHeader className="border-b border-border pb-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Typography variant="h2" className="text-foreground font-semibold">
              Task Details
            </Typography>
            <Badge variant="outline" className="text-xs">
              {task?.status || 'Draft'}
            </Badge>
          </div>
        </div>
      </ModalHeader>
      
      <ModalBody className="p-0 max-h-[60vh]">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6 overflow-y-auto max-h-[60vh]">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Task Header */}
            <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Typography variant="h3" className="text-foreground font-semibold mb-2">
                    {task?.title || 'Untitled Task'}
                  </Typography>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Select
                      value={formData.status}
                      onChange={(value) => handleInputChange('status', value)}
                      className="w-40"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <SelectOption key={option.value} value={option.value}>
                          {option.label}
                        </SelectOption>
                      ))}
                    </Select>
                    
                    <Badge variant="success" size="lg" className="px-3 py-1">
                      High Priority
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">Due:</span>
                      <Typography variant="body-small" className="font-medium">
                        {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Assigned to:</span>
                  {users.slice(0, 3).map((user, index) => (
                    <Avatar key={user._id} size="sm" className="-ml-2 first:ml-0 ring-2 ring-background">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback variant={getAvatarColor(user.name)}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  <Avatar size="sm" className="-ml-2 ring-2 ring-background">
                    <AvatarFallback variant="primary">+</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                <Typography variant="h4" className="text-foreground font-medium">
                  Description
                </Typography>
              </div>
              <TextArea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add a detailed description of this task..."
                className="min-h-32 resize-none"
                rows={4}
              />
            </Card>

            {/* Subtasks Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full"></div>
                  <Typography variant="h4" className="text-foreground font-medium">
                    Subtasks
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Typography variant="body-small" className="text-muted-foreground">
                    {completedSubtasks} of {totalSubtasks} completed
                  </Typography>
                  <Progress 
                    value={(completedSubtasks / totalSubtasks) * 100} 
                    className="w-24"
                  />
                </div>
              </div>
              
              <Stack spacing="sm" className="mb-4">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                    <Checkbox
                      checked={subtask.completed}
                      onChange={() => handleSubtaskToggle(subtask.id)}
                    />
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {subtask.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {subtask.dueDate && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          {subtask.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Badge>
                      )}
                      {subtask.assignee && (
                        <Avatar size="xs" className="ring-1 ring-border">
                          <AvatarImage src={subtask.assignee.avatar} alt={subtask.assignee.name} />
                          <AvatarFallback variant={getAvatarColor(subtask.assignee.name)}>
                            {getInitials(subtask.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </Stack>
              
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <Button variant="accent" onClick={handleAddSubtask} className="px-4">
                  Add
                </Button>
              </div>
            </Card>

            {/* Attachments Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                <Typography variant="h4" className="text-foreground font-medium">
                  Attachments
                </Typography>
              </div>
              
              <Stack spacing="sm" className="mb-4">
                {mockAttachments.map((attachment) => (
                  <div key={attachment._id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-xl">{getFileIcon(attachment.mimeType)}</span>
                    <div className="flex-1">
                      <Typography variant="body-small" className="font-medium text-foreground">
                        {attachment.filename}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </Typography>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </Stack>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-3xl mb-2">📎</div>
                <Typography variant="body-small" className="text-muted-foreground mb-1">
                  Drop files here or click to upload
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Supports PDF, images, and documents up to 10MB
                </Typography>
              </div>
            </Card>

            {/* Comments Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full"></div>
                  <Typography variant="h4" className="text-foreground font-medium">
                    Comments & Activity
                  </Typography>
                </div>
                                 <Badge variant="outline" className="text-xs">
                   {comments.length} comments
                 </Badge>
               </div>
               
                                            <div className="space-y-4 mb-6">
                {isLoadingComments ? (
                  <div className="text-center py-8">
                    <Typography variant="body-small" className="text-muted-foreground">
                      Loading comments...
                    </Typography>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <Typography variant="body-small" className="text-muted-foreground">
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
                        currentUserId="user_1" // This should come from auth context
                        onCommentUpdate={handleCommentUpdate}
                        onCommentDelete={handleCommentDelete}
                        onReplyAdd={handleReplyAdd}
                      />
                    ))
                )}
              </div>
              
              <div className="border-t border-border/50 pt-4">
                <div className="flex gap-3">
                  <Avatar size="sm" className="ring-1 ring-border flex-shrink-0">
                    <AvatarImage src={users[0]?.avatar} alt={users[0]?.name || 'You'} />
                    <AvatarFallback variant={getAvatarColor(users[0]?.name || 'You')}>
                      {getInitials(users[0]?.name || 'You')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <TextArea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-20 resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>💬</span>
                        <span>Press Enter to send, Shift+Enter for new line</span>
                      </div>
                      <Button 
                        onClick={handleAddComment} 
                        disabled={!newComment.trim() || isSubmitting} 
                        className="px-6"
                        size="sm"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Metadata */}
          <div className="space-y-6">
            {/* Task Properties */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                <Typography variant="h4" className="text-foreground font-medium">
                  Task Properties
                </Typography>
              </div>
              
              <Stack spacing="md">
                {/* Due Date */}
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-2 font-medium">
                    Due Date
                  </Typography>
                  <Input
                    type="date"
                    value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dueDate', new Date(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Estimated Time */}
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-2 font-medium">
                    Estimated Time
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      className="w-20"
                    />
                    <Typography variant="body-small" className="text-muted-foreground">hours</Typography>
                  </div>
                </div>
              </Stack>
            </Card>

            {/* Labels */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                <Typography variant="h4" className="text-foreground font-medium">
                  Labels
                </Typography>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`${LABEL_COLORS[tag as keyof typeof LABEL_COLORS] || 'bg-gray-500'} text-white border-0 px-2 py-1`}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveLabel(tag)}
                      className="ml-1 hover:bg-black/20 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add label..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                />
                <Button size="sm" onClick={handleAddLabel} className="px-3">
                  Add
                </Button>
              </div>
            </Card>

            {/* Dependencies */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                <Typography variant="h4" className="text-foreground font-medium">
                  Dependencies
                </Typography>
              </div>
              
              <Stack spacing="sm">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="text-lg">🔗</span>
                  <Typography variant="body-small" className="text-foreground">User Research Analysis</Typography>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="text-lg">🔗</span>
                  <Typography variant="body-small" className="text-foreground">Brand Guidelines Update</Typography>
                </div>
              </Stack>
            </Card>

            {/* Action Buttons */}
            <Card className="p-6">
              <div className="space-y-3">
                <Button 
                  variant="gradient" 
                  onClick={handleSave} 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onDelete}
                  className="w-full text-error hover:text-error hover:bg-error/10"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Task
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
