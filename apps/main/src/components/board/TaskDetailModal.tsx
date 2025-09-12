// /src/components/task/TaskDetailModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Typography,
  Avatar,
  AvatarImage,
  AvatarFallback,
  TextArea,
  getInitials,
  getAvatarColor,
} from "@taskflow/ui";
import type { Task, Comment } from "../../types/task.types";
import { CommentItem } from "./CommentItem";
import { CommentService } from "../../services/commentService";
import type { TaskDetailModalProps } from "../../types/interfaces/ui";
import { useBoard, useAuth } from "../../hooks";


const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];



const TASK_COLORS = [
  { name: "Blue", value: "#3B82F6", gradient: "from-blue-500 to-blue-600" },
  { name: "Green", value: "#10B981", gradient: "from-green-500 to-green-600" },
  { name: "Purple", value: "#8B5CF6", gradient: "from-purple-500 to-purple-600" },
  { name: "Pink", value: "#EC4899", gradient: "from-pink-500 to-pink-600" },
  { name: "Orange", value: "#F59E0B", gradient: "from-orange-500 to-orange-600" },
  { name: "Red", value: "#EF4444", gradient: "from-red-500 to-red-600" },
  { name: "Teal", value: "#14B8A6", gradient: "from-teal-500 to-teal-600" },
  { name: "Indigo", value: "#6366F1", gradient: "from-indigo-500 to-indigo-600" },
  { name: "Yellow", value: "#EAB308", gradient: "from-yellow-500 to-yellow-600" },
  { name: "Gray", value: "#6B7280", gradient: "from-gray-500 to-gray-600" },
];

const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case 'urgent':
    case 'critical':
      return '|||';
    case 'high':
    case 'medium':
      return '||';
    case 'low':
    case 'normal':
    default:
      return '|';
  }
};

// Custom Date Picker Component
const CustomDatePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  color?: string;
}> = ({ value, onChange, min, max, placeholder, className, color = "primary" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? new Date(value) : new Date());
  const datePickerRef = React.useRef<HTMLDivElement | null>(null);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (min && date < new Date(min)) return true;
    if (max && date > new Date(max)) return true;
    return false;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={datePickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 px-3 text-xs border border-border/40 rounded-lg bg-background/50 focus:outline-none focus:ring-2 transition-all duration-200 min-w-[130px] shadow-sm hover:shadow-md flex items-center justify-between ${
          color === 'green' ? 'focus:ring-green-500/30 focus:border-green-500/50' : 'focus:ring-red-500/30 focus:border-red-500/50'
        } ${className}`}
      >
        <span className="text-foreground">
          {selectedDate ? formatDate(selectedDate) : placeholder || 'Select date'}
        </span>
        <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background border border-border/20 rounded-lg shadow-xl z-50 p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-muted/50 rounded transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <h3 className="font-semibold text-sm">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-muted/50 rounded transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-xs font-medium text-muted-foreground text-center py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8" />;
              }

              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={isDisabled}
                  className={`h-8 w-8 text-xs rounded transition-all duration-200 ${
                    isSelected
                      ? `bg-${color}-500 text-white shadow-md`
                      : isToday
                      ? 'bg-primary/20 text-primary font-semibold'
                      : isDisabled
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-border/20">
            <button
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                onChange(today.toISOString().split('T')[0]);
                setIsOpen(false);
              }}
              className="w-full text-xs py-2 px-3 bg-muted/50 hover:bg-muted rounded transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
}) => {
  // formData may include new optional fields: dueDateStart, dueDateEnd
  const [formData, setFormData] = useState<Partial<Task & {
    dueDateStart?: string;
    dueDateEnd?: string;
  }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState("");
  const assigneesPanelRef = React.useRef<HTMLDivElement | null>(null);
  const colorPickerRef = React.useRef<HTMLDivElement | null>(null);
  const boardTagsRef = React.useRef<HTMLDivElement | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBoardTags, setShowBoardTags] = useState(false);

  const { currentBoard } = useBoard();
  const { user } = useAuth();

  const users = useMemo<
    { _id: string; name: string; email?: string; avatar?: string }[]
  >(() => {
    const rawMembers = (currentBoard as any)?.members || [];
    console.log('Raw members data:', rawMembers);
    console.log('Current board:', currentBoard);
    
    const processedUsers = rawMembers
      .map((member: any) => {
        const user = member?.user || member;
        console.log('Processing member:', member, 'User:', user);
        return {
          _id: user?._id || user?.id || member?._id || member?.id || "",
          name:
            user?.name ||
            user?.fullName ||
            user?.username ||
            user?.email ||
            "Member",
          email: user?.email,
          avatar: user?.avatar || user?.photo || user?.imageUrl,
        };
      })
      .filter((u: any) => !!u._id);
    
    console.log('Processed users:', processedUsers);
    return processedUsers;
  }, [currentBoard?.members]);

  // Also get users from the task's assignees if they're not in the board members
  const allUsers = useMemo(() => {
    const boardUsers = users;
    const taskAssigneeIds = formData.assignees || [];
    
    // If we have assignees but no board users, try to get them from the task data
    if (taskAssigneeIds.length > 0 && boardUsers.length === 0 && task) {
      console.log('No board users found, checking task assignees:', taskAssigneeIds);
      // This is a fallback - in a real app, you'd want to fetch user data
      return taskAssigneeIds.map((id: string) => ({
        _id: id,
        name: "User",
        email: "",
        avatar: ""
      }));
    }
    
    // If we have board users, check if any assignees are missing from board users
    if (boardUsers.length > 0 && taskAssigneeIds.length > 0) {
      const missingAssigneeIds = taskAssigneeIds.filter(id => !boardUsers.find(u => u._id === id));
      if (missingAssigneeIds.length > 0) {
        console.log('Some assignees not found in board users, adding fallbacks:', missingAssigneeIds);
        const fallbackUsers = missingAssigneeIds.map((id: string) => ({
          _id: id,
          name: "User",
          email: "",
          avatar: ""
        }));
        return [...boardUsers, ...fallbackUsers];
      }
    }
    
    return boardUsers;
  }, [users, formData.assignees, task]);


  // Close color picker when clicking outside or pressing Escape
  useEffect(() => {
    if (!showColorPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!colorPickerRef.current) return;
      const target = e.target as Node;
      if (!colorPickerRef.current.contains(target)) {
        setShowColorPicker(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowColorPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showColorPicker]);

  // Close board tags when clicking outside or pressing Escape
  useEffect(() => {
    if (!showBoardTags) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!boardTagsRef.current) return;
      const target = e.target as Node;
      if (!boardTagsRef.current.contains(target)) {
        setShowBoardTags(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowBoardTags(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showBoardTags]);


  const loadComments = React.useCallback(async () => {
    if (!task) return;
    setIsLoadingComments(true);
    try {
      const response = await CommentService.getTaskComments(task._id);
      console.log('🔍 Loaded comments:', response.data);
      setComments(Array.isArray(response.data) ? response.data : ((response.data as any)?.comments || []));
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [task?._id]);

  useEffect(() => {
    if (task && isOpen) {
      // Reset comments when task changes
      setComments([]);
      loadComments();
    }
  }, [task?._id, isOpen, loadComments]);

  useEffect(() => {
    setIsAnimating(isOpen);
  }, [isOpen]);

  // Initialize formData when task changes
  useEffect(() => {
    if (task && isOpen) {
      console.log('🔍 Initializing formData with task:', task);
      console.log('🔍 Task assignees:', task.assignees);
      console.log('🔍 Current board members:', currentBoard?.members);
      
      // Normalize assignees to always be string IDs
      const normalizedAssignees = (task.assignees || []).map((assignee: any) => {
        return typeof assignee === 'string' ? assignee : assignee?._id || assignee?.id || assignee;
      }).filter(Boolean);
      
      console.log('🔍 Normalized assignees:', normalizedAssignees);
      
      // Support previously used single dueDate: map to range's end if present
      const dueStart = (task as any).dueDateStart || null;
      const dueEnd = (task as any).dueDateEnd || (task.dueDate ? task.dueDate : null);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "low",
        color: task.color || "#6B7280",
        assignees: normalizedAssignees,
        tags: task.tags || [],
        dueDateStart: dueStart ? new Date(dueStart).toISOString().split('T')[0] : today,
        dueDateEnd: dueEnd ? new Date(dueEnd).toISOString().split('T')[0] : today,
      });
      
      // Also set the input states
      setTitleInput(task.title || "");
      setDescriptionInput(task.description || "");
    } else if (!task) {
      setFormData({});
      setTitleInput("");
      setDescriptionInput("");
    }
  }, [task, isOpen, currentBoard?.members]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!task) return;

    setIsSubmitting(true);
    try {
      // if you want to normalize dates before sending, do it here
      const payload = { ...formData } as any;
      // ensure due dates are ISO strings or null
      if (payload.dueDateStart) {
        payload.dueDateStart = new Date(payload.dueDateStart).toISOString();
      }
      if (payload.dueDateEnd) {
        payload.dueDateEnd = new Date(payload.dueDateEnd).toISOString();
      }
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;

    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await onDelete(task._id);
        onClose();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleTitleConfirm = () => {
    const value = titleInput.trim();
    if (!value) return;
    setFormData((prev) => ({ ...prev, title: value }));
    setIsEditingTitle(false);
  };

  const handleDescriptionConfirm = () => {
    const value = descriptionInput.trim();
    setFormData((prev) => ({ ...prev, description: value }));
    setIsEditingDescription(false);
  };


  const handleSelectBoardTag = (tagName: string) => {
    if (!formData.tags?.includes(tagName)) {
      setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagName] }));
    }
    setShowBoardTags(false);
  };

  const handleRemoveTag = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== value),
    }));
  };

  const handleAssignUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees?.includes(userId)
        ? prev.assignees
        : [...(prev.assignees || []), userId],
    }));
  };

  const handleUnassignUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: (prev.assignees || []).filter((id) => id !== userId),
    }));
  };


  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
    setShowColorPicker(false);
  };


  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;

    try {
      const response = await CommentService.addComment(task._id, {
        content: newComment,
      });

      setComments((prev) => [...prev, response.data]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleCommentUpdate = async (commentId: string, content: string) => {
    try {
      const response = await CommentService.updateComment(commentId, content);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? response.data : comment
        )
      );
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };


  const handleReplyAdd = async (commentId: string, content: string) => {
    try {
      const response = await CommentService.addReply(commentId, content);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id !== commentId) return comment;
          const next = { ...comment } as any;
          next.replies = [...(next.replies || []), response.data];
          return next as Comment;
        })
      );
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };



  if (!task) return null;

  return (
    <>
      {/* Custom Scrollbars and Modal Styles */}
      <style>{`
        [aria-label="Close modal"] { display: none !important; }
        
        /* Beautiful Custom Scrollbars positioned below header */
        .task-detail-modal {
          overflow: hidden;
        }
        
        .task-detail-modal .modal-content-wrapper {
          margin-top: 32px; /* Push content down to start below header line */
          max-height: calc(90vh - 32px); /* Adjust height to account for header offset */
          overflow-y: auto;
        }
        
        .task-detail-modal .modal-content-wrapper::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        
        .task-detail-modal .modal-content-wrapper::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.2);
          border-radius: 0 0 8px 0;
        }
        
        .task-detail-modal .modal-content-wrapper::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${formData.color || task.color || "hsl(var(--primary))"} 0%, ${formData.color || task.color || "hsl(var(--primary))"}90 100%);
          border-radius: 0 0 4px 0;
          border-right: 1px solid hsl(var(--border) / 0.2);
          transition: all 0.3s ease;
        }
        
        .task-detail-modal .modal-content-wrapper::-webkit-scrollbar-thumb:hover {
          background: ${formData.color || task.color || "hsl(var(--primary))"};
          box-shadow: inset -2px 0 4px ${formData.color || task.color || "hsl(var(--primary))"}30;
        }
        
        /* Inner scrollbars for content areas */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.3);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${formData.color || task.color || "hsl(var(--primary))"} 0%, ${formData.color || task.color || "hsl(var(--primary))"}80 100%);
          border-radius: 2px;
          transition: all 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${formData.color || task.color || "hsl(var(--primary))"};
          box-shadow: 0 0 6px ${formData.color || task.color || "hsl(var(--primary))"}40;
        }
        
        /* Firefox */
        .task-detail-modal {
          scrollbar-width: thin;
          scrollbar-color: ${formData.color || task.color || "hsl(var(--primary))"} hsl(var(--muted) / 0.2);
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${formData.color || task.color || "hsl(var(--primary))"} hsl(var(--muted) / 0.3);
        }
        
        /* Smooth scrolling */
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
        
        /* Remove ALL modal padding for this specific modal */
        .task-detail-modal {
          padding: 0 !important;
        }
        
        /* Target the main modal container that has p-6 class */
        .task-detail-modal.relative.z-50.w-full.max-h-\\[90vh\\].overflow-auto.bg-background.border.border-border.rounded-lg.shadow-xl.max-w-6xl {
          padding: 0 !important;
        }
        
        /* More specific targeting for the modal wrapper */
        .relative.z-50.w-full.max-h-\\[90vh\\].overflow-auto.bg-background.border.border-border.rounded-lg.shadow-xl.max-w-6xl.task-detail-modal {
          padding: 0 !important;
        }
        
        /* Universal override for this modal */
        [class*="task-detail-modal"] {
          padding: 0 !important;
        }
      `}</style>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        className={`task-detail-modal transition-all duration-300 transform-gpu ${
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Clean Header Accent */}
        <div className="relative">
          <div
            className="h-3 w-full rounded-t-xl"
            style={{ 
              background: `${formData.color || task.color || "#6B7280"}`
            }}
          />
        </div>

        <div className="modal-content-wrapper">
          <ModalHeader className="border-b border-border/10 px-6 py-4">
            <div className="flex items-center justify-between w-full gap-4">
              {/* Left: Color + Title + Assign */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Color Display */}
              <div className="relative" ref={colorPickerRef}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-10 h-10 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0"
                  style={{ 
                      backgroundColor: formData.color || task.color || "#6B7280"
                    }}
                    title="Change task color"
                  />

                  {/* Color Picker */}
                {showColorPicker && (
                    <div className="absolute top-10 left-0 z-50 bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
                      <div className="grid grid-cols-5 gap-2">
                      {TASK_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange(color.value)}
                            className={`w-8 h-8 rounded-md transition-all duration-200 ${
                              (formData.color || task.color) === color.value ? 'ring-2 ring-primary ring-offset-1' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                          />
                      ))}
                    </div>
                  </div>
                )}
              </div>

                {/* Title and Assign */}
                <div className="flex-1 min-w-0 max-w-sm">
              {/* Title */}
                  <div>
                    {isEditingTitle ? (
                      <input
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={handleTitleConfirm}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTitleConfirm();
                          if (e.key === "Escape") {
                            setTitleInput(formData.title || task.title || "");
                            setIsEditingTitle(false);
                          }
                        }}
                        autoFocus
                        className="w-full text-lg font-semibold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 focus:border-0"
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    ) : (
                  <h1
                        className="text-lg font-semibold text-foreground cursor-text hover:bg-muted/30 px-2 py-1 rounded transition-colors truncate -mx-2"
                        onDoubleClick={() => setIsEditingTitle(true)}
                    title="Double-click to edit"
                      >
                        {formData.title || task.title}
                  </h1>
                )}
                </div>

                  {/* Assign Button - Show assigned users */}
                  <div className="relative mt-2 group" ref={assigneesPanelRef}>
                    <button
                      className="flex items-center gap-2 px-2 py-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors duration-200"
                      title="Assign user"
                    >
                      {formData.assignees && formData.assignees.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1">
                            {formData.assignees.slice(0, 3).map((assignee: any) => {
                              // Handle both string IDs and object assignees
                              const assigneeId = typeof assignee === 'string' ? assignee : assignee?._id || assignee?.id;
                              const user = allUsers?.find(u => u._id === assigneeId);
                              console.log('🔍 Assignee mapping:', { assignee, assigneeId, user, allUsersLength: allUsers?.length });
                              return user ? (
                                <Avatar key={assigneeId} size="sm" className="w-5 h-5 border-2 border-background">
                                  {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                                  <AvatarFallback variant={getAvatarColor(user.name)} className="text-xs font-medium">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                              ) : (
                                <div key={assigneeId} className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs font-medium text-muted-foreground">?</span>
                        </div>
                              );
                            })}
                            {formData.assignees.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs font-medium text-muted-foreground">+{formData.assignees.length - 3}</span>
            </div>
                            )}
                          </div>
                          <span className="text-xs font-medium">
                            {formData.assignees.length === 1 ? '1 assigned' : `${formData.assignees.length} assigned`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 11c1.656 0 3-1.567 3-3.5S17.656 4 16 4s-3 1.567-3 3.5S14.344 11 16 11zM6 20v-2a4 4 0 0 1 4-4h1"/>
                            <path d="M12 8v8M8 12h8"/>
                          </svg>
                          <span className="text-xs font-medium">Assign</span>
                        </div>
                      )}
                    </button>

                    <div className="absolute left-0 mt-1 w-64 bg-background border border-border/20 rounded-xl shadow-xl p-3 z-50 backdrop-blur-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="mb-2">
                        <Typography variant="body-small" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Assign to
                        </Typography>
                      </div>
                      <div className="max-h-48 overflow-hidden space-y-1">
                        {(allUsers || []).map((u) => (
                          <div key={u._id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/40 transition-all duration-200">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Avatar size="sm" className="w-7 h-7 flex-shrink-0">
                                {u.avatar ? <AvatarImage src={u.avatar} alt={u.name} /> : null}
                                <AvatarFallback variant={getAvatarColor(u.name)} className="text-xs font-medium">{getInitials(u.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground truncate" title={u.name}>
                                  {u.name}
                                </div>
                                {u.email && (
                                  <div className="text-xs text-muted-foreground truncate" title={u.email}>
                                    {u.email}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              {(formData.assignees || []).includes(u._id) ? (
                <Button
                  variant="ghost"
                  size="sm"
                                  className="h-7 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200" 
                                  onClick={() => handleUnassignUser(u._id)}
                >
                                  Remove
                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 px-3 text-xs font-medium border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-200" 
                                  onClick={() => handleAssignUser(u._id)}
                                >
                                  Add
                                </Button>
                              )}
                            </div>
                        </div>
                      ))}
                      {(users || []).length === 0 && (
                          <div className="text-center py-4">
                            <Typography variant="body-small" className="text-xs text-muted-foreground">No users available</Typography>
                          </div>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Center: Priority */}
              <div className="flex items-center">
                <div className="relative group">
                  {/* Priority Display */}
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border/20 cursor-pointer bg-muted/30">
                    <span className="text-yellow-500 font-mono text-lg">
                      {getPriorityIndicator(formData.priority || task.priority)}
                    </span>
                  </div>

                  {/* Custom Priority Picker */}
                  <div className="absolute top-full left-0 mt-2 w-40 bg-background border border-border/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 backdrop-blur-sm">
                    <div className="p-2 space-y-1">
                      {PRIORITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("priority", option.value)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                            (formData.priority || task.priority) === option.value
                              ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm'
                              : 'text-foreground hover:bg-muted/40'
                          }`}
                        >
                          <span 
                            className="font-mono text-lg font-semibold"
                            style={{
                              color: option.value === 'low' ? '#EAB308' : 
                                     option.value === 'medium' ? '#F59E0B' :
                                     option.value === 'high' ? '#F97316' : '#EF4444'
                            }}
                          >
                            {getPriorityIndicator(option.value)}
                          </span>
                          <span className="font-medium text-sm">
                            {option.label}
                          </span>
                          {(formData.priority || task.priority) === option.value && (
                            <svg className="w-4 h-4 ml-auto text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose} title="Close" className="h-8 w-8 p-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </Button>

                <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
              </Button>

                <Button size="sm" onClick={handleSave} disabled={isSubmitting} title="Save" className="h-8 px-4 bg-primary text-white">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Save"
                )}
              </Button>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6 min-w-0">
              {/* Description */}
                  <div>
                    {isEditingDescription ? (
                      <TextArea
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        onBlur={handleDescriptionConfirm}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setDescriptionInput(formData.description || "");
                            setIsEditingDescription(false);
                          }
                          if (e.key === "Enter" && e.ctrlKey) {
                            handleDescriptionConfirm();
                          }
                        }}
                        autoFocus
                        placeholder="Enter task description..."
                    rows={3}
                    className="resize-none text-sm rounded-md border border-border/20 p-3 focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <div
                        onClick={() => setIsEditingDescription(true)}
                    className="min-h-[80px] p-3 rounded-md border border-transparent hover:border-border/20 hover:bg-muted/10 cursor-text transition-all text-sm"
                        title="Click to edit description"
                      >
                        {formData.description ? (
                          <div className="text-foreground whitespace-pre-wrap">{formData.description}</div>
                        ) : (
                          <div className="text-muted-foreground">Click to add description...</div>
                        )}
                      </div>
                    )}
                  </div>

              {/* Due Dates - Compact Design */}
                  <div>
                <div className="flex items-center gap-3">
                        {/* Start Date */}
                          <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <label className="text-xs font-medium text-muted-foreground">Start</label>
                    <CustomDatePicker
                      value={formData.dueDateStart || ""}
                      onChange={(startDate) => {
                        console.log('🟢 Start date changed:', startDate);
                        console.log('🟢 Current end date:', formData.dueDateEnd);
                        handleInputChange("dueDateStart", startDate);
                        // If due date is before start date, set it to the same as start date
                        if (formData.dueDateEnd && startDate && new Date(startDate) > new Date(formData.dueDateEnd)) {
                          console.log('🟢 Setting end date to start date:', startDate);
                          handleInputChange("dueDateEnd", startDate);
                        }
                      }}
                      placeholder="Select start date"
                      color="green"
                    />
                        </div>

                  {/* Arrow */}
                  <div className="flex items-center text-muted-foreground">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                      </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                    <label className="text-xs font-medium text-muted-foreground">Due</label>
                    <CustomDatePicker
                      value={formData.dueDateEnd || ""}
                      onChange={(dueDate) => {
                        console.log('🔴 Due date changed:', dueDate);
                        handleInputChange("dueDateEnd", dueDate);
                      }}
                      min={formData.dueDateStart || undefined}
                      placeholder="Select due date"
                      color="red"
                  />
                </div>
                      </div>
            </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => setShowBoardTags((s) => !s)}>
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41L11 4H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"/></svg>
                    Add Tags
                    </Button>
                </div>

                {/* Board Tags Dropdown */}
                {showBoardTags && currentBoard && (
                  <div ref={boardTagsRef} className="mb-4 p-3 border border-border/20 rounded-lg bg-muted/5">
                    <Typography variant="body-small" className="text-xs text-muted-foreground mb-2">Select from board tags:</Typography>
                    {currentBoard.tags && currentBoard.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {currentBoard.tags.map((tag, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectBoardTag(tag.name)}
                            className={`text-xs px-3 py-1 rounded-full border transition-all ${
                              formData.tags?.includes(tag.name)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:scale-105 cursor-pointer'
                            }`}
                            style={{ 
                              backgroundColor: `${tag.color}15`,
                              borderColor: tag.color,
                              color: tag.color 
                            }}
                            disabled={formData.tags?.includes(tag.name)}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="body-small" className="text-xs text-muted-foreground">No board tags available</Typography>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag: string, i: number) => {
                      const boardTag = currentBoard?.tags?.find(t => t.name === tag);
                      return (
                        <div 
                          key={i} 
                          className="text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-2"
                          style={boardTag ? { 
                            backgroundColor: `${boardTag.color}15`,
                            borderColor: boardTag.color,
                            color: boardTag.color 
                          } : {
                            backgroundColor: 'hsl(var(--muted))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                          }}
                        >
                          {boardTag && (
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: boardTag.color }}
                            />
                          )}
                          {tag}
                          <button 
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:bg-black/10 rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                      </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                      <path d="M13 12h3"/>
                      <path d="M8 12h3"/>
                    </svg>
                    Add Checklist
                  </Button>
                </div>
                <div className="text-center py-4 border border-dashed border-border/30 rounded-lg">
                </div>
              </div>
                </div>

            {/* Right Column - Comments */}
            <div className="space-y-4 min-w-0">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {isLoadingComments ? (
                    <div className="text-center py-3"><Typography variant="body-small" className="text-xs text-muted-foreground">Loading comments...</Typography></div>
                  ) : comments.length > 0 ? (
                    comments
                      .slice()
                      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                      .map((c) => (
                        <CommentItem
                          key={c._id}
                          comment={c}
                          users={users}
                          currentUserId={user?.user?._id || ""}
                          onCommentUpdate={handleCommentUpdate}
                          onReplyAdd={handleReplyAdd}
                        />
                      ))
                  ) : null}
                </div>

              <div className="border-t border-border/10 pt-3">
                  <div className="flex gap-2 items-start">
                    <Avatar size="sm" className="w-6 h-6">
                      {users[0]?.avatar ? <AvatarImage src={users[0].avatar} alt={users[0]?.name || "You"} /> : null}
                      <AvatarFallback variant={getAvatarColor(users[0]?.name || "You")} className="text-xs">{getInitials(users[0]?.name || "You")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                    <TextArea 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newComment.trim()) {
                            handleAddComment();
                          }
                        }
                      }}
                      placeholder="Write a comment..." 
                      rows={2} 
                      className="resize-none text-sm rounded-md border border-border/20 p-2" 
                    />
                      <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()} className="px-3 py-1 text-xs bg-primary text-white">Comment</Button>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </ModalBody>
        </div>
      </Modal>
    </>
  );
};
