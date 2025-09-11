// /src/components/task/TaskDetailModal.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  getAvatarColor,
} from "@taskflow/ui";
import type { Task, Comment } from "../../types/task.types";
import { CommentItem } from "./CommentItem";
import { CommentService } from "../../services/commentService";
import type { TaskDetailModalProps } from "../../types/interfaces/ui";
import { useBoard } from "../../hooks";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_COLORS = {
  todo: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  done: "bg-green-100 text-green-800 border-green-200",
};

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

const renderColorDot = (colorClass?: string, customColor?: string) => (
  <span
    aria-hidden
    className={`inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle border border-white/70 shadow-sm ${colorClass || ""}`}
    style={customColor ? { backgroundColor: customColor } : {}}
  />
);

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
  const [showAssigneesPanel, setShowAssigneesPanel] = useState(false);
  const assigneesPanelRef = React.useRef<HTMLDivElement | null>(null);
  const colorPickerRef = React.useRef<HTMLDivElement | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [checklistItems, setChecklistItems] = useState<
    Array<{ text: string; completed: boolean }>
  >([]);

  const { currentBoard } = useBoard();

  const users = useMemo<
    { _id: string; name: string; email?: string; avatar?: string }[]
  >(() => {
    const rawMembers = (currentBoard as any)?.members || [];
    return rawMembers
      .map((member: any) => {
        const user = member?.user || member;
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
      if (e.key === "Escape") setShowAssigneesPanel(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAssigneesPanel]);

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

  // Initialize form data from task
  useEffect(() => {
    if (task) {
      // support previously used single dueDate: map to range's end if present
      const dueStart = (task as any).dueDateStart || null;
      const dueEnd = (task as any).dueDateEnd || (task.dueDate ? task.dueDate : null);

      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        color: task.color || "#6B7280",
        dueDateStart: dueStart ? new Date(dueStart).toISOString() : undefined,
        dueDateEnd: dueEnd ? new Date(dueEnd).toISOString() : undefined,
        tags: task.tags,
        assignees: task.assignees,
      });
      setTitleInput(task.title || "");
      setChecklistItems([]); // you can prefill if task.checklist exists
    } else {
      setFormData({});
      setTitleInput("");
      setChecklistItems([]);
    }
  }, [task]);

  const loadComments = React.useCallback(async () => {
    if (!task) return;
    setIsLoadingComments(true);
    try {
      const response = await CommentService.getTaskComments(task._id);
      setComments(response.data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [task?._id]);

  useEffect(() => {
    if (task && isOpen) {
      loadComments();
    }
  }, [task?._id, isOpen, loadComments]);

  useEffect(() => {
    setIsAnimating(isOpen);
  }, [isOpen]);

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

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), value] }));
    setTagInput("");
    setShowTagInput(false);
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

  const handleAddChecklistItem = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setChecklistItems((prev) => [{ text: value, completed: false }, ...prev]);
  };

  const handleToggleChecklistItem = (index: number) => {
    setChecklistItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
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

  const handleCommentDelete = async (commentId: string) => {
    try {
      await CommentService.deleteComment(commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
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

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Checklist progress percentage
  const checklistProgress = useMemo(() => {
    if (!checklistItems.length) return 0;
    const done = checklistItems.filter((i) => i.completed).length;
    return Math.round((done / checklistItems.length) * 100);
  }, [checklistItems]);

  if (!task) return null;

  return (
    <>
      {/* remove default close element if present in library */}
      <style>{`
        [aria-label="Close modal"] { display: none !important; }
      `}</style>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="6xl"
        className={`transition-all duration-300 transform-gpu ${
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Top color accent with gradient */}
        <div
          aria-hidden
          style={{ 
            background: `linear-gradient(90deg, ${formData.color || task.color || "#6B7280"} 0%, ${formData.color || task.color || "#6B7280"}80 50%, transparent 100%)`
          }}
          className="h-1 rounded-t-xl -mt-3"
        />

        <ModalHeader className="border-b border-border/10 px-6 py-5">
          <div className="flex items-center justify-between w-full">
            {/* Left: Color + Title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Elegant Color Indicator */}
              <div className="relative" ref={colorPickerRef}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: formData.color || task.color || "#6B7280" }}
                  title="Change color"
                />

                {/* Compact Color Picker */}
                {showColorPicker && (
                  <div className="absolute top-8 left-0 z-50 bg-white rounded-lg shadow-xl border border-border p-3 min-w-[200px]">
                    <div className="grid grid-cols-5 gap-2">
                      {TASK_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange(color.value)}
                          className={`w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ${
                            (formData.color || task.color) === color.value ? 'ring-2 ring-primary ring-offset-1' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clean Title */}
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <Input
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
                    className="text-lg font-semibold bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                  />
                ) : (
                  <h1
                    className="text-lg font-semibold text-foreground cursor-text hover:bg-muted/20 px-1 py-0.5 rounded transition-colors truncate"
                    onDoubleClick={() => setIsEditingTitle(true)}
                    title="Double-click to edit"
                  >
                    {formData.title || task.title}
                  </h1>
                )}
              </div>
            </div>

            {/* Right: Status, Priority & Actions */}
            <div className="flex items-center gap-3">
              {/* Compact Status & Priority */}
              <div className="flex items-center gap-2">
                <Select
                  value={formData.status || task.status}
                  onValueChange={(value: string) => handleInputChange("status", value)}
                  className="h-8 text-xs"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <SelectOption key={option.value} value={option.value} className="text-xs">
                      <div className="flex items-center gap-1.5">
                        {renderColorDot(STATUS_COLORS[option.value as keyof typeof STATUS_COLORS])}
                        <span>{option.label}</span>
                      </div>
                    </SelectOption>
                  ))}
                </Select>

                <Select
                  value={formData.priority || task.priority}
                  onValueChange={(value: string) => handleInputChange("priority", value)}
                  className="h-8 text-xs"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectOption key={option.value} value={option.value} className="text-xs">
                      <div className="flex items-center gap-1.5">
                        {renderColorDot(PRIORITY_COLORS[option.value as keyof typeof PRIORITY_COLORS])}
                        <span>{option.label}</span>
                      </div>
                    </SelectOption>
                  ))}
                </Select>
              </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <div className="relative" ref={assigneesPanelRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssigneesPanel((s) => !s)}
                  className="w-9 h-9 p-0 rounded-full border border-border/10 hover:bg-muted/50"
                  title="Assign user"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 11c1.656 0 3-1.567 3-3.5S17.656 4 16 4s-3 1.567-3 3.5S14.344 11 16 11zM6 20v-2a4 4 0 0 1 4-4h1"/></svg>
                </Button>

                {showAssigneesPanel && (
                  <div className="absolute right-0 mt-2 w-64 bg-background border border-border/20 rounded-xl shadow-lg p-3 z-50">
                    <div className="max-h-56 overflow-auto space-y-1">
                      {(users || []).map((u) => (
                        <div key={u._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Avatar size="xs">
                              {u.avatar ? <AvatarImage src={u.avatar} alt={u.name} /> : null}
                              <AvatarFallback variant={getAvatarColor(u.name)} className="text-[10px]">{getInitials(u.name)}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm truncate">{u.name}</div>
                          </div>

                          {(formData.assignees || []).includes(u._id) ? (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleUnassignUser(u._id)}>Remove</Button>
                          ) : (
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => handleAssignUser(u._id)}>Add</Button>
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

              <Button variant="ghost" size="sm" onClick={onClose} title="Cancel" className="w-9 h-9 p-0 rounded-full hover:bg-muted/50">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete" className="w-9 h-9 p-0 rounded-full text-red-600 hover:bg-red-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
              </Button>

              <Button size="sm" onClick={handleSave} disabled={isSubmitting} title="Save" className="w-10 h-10 p-0 rounded-full bg-primary text-white shadow-sm hover:shadow-md disabled:opacity-60">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </Button>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Main area */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-4 rounded-xl border border-border/10 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <Typography variant="body-small" className="text-muted-foreground mb-2 text-xs font-medium">Description</Typography>
                    <TextArea
                      value={formData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter task description..."
                      rows={4}
                      className="resize-none text-sm rounded-md border border-border/10 p-3 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Due Date Range */}
                  <div>
                    <Typography variant="body-small" className="text-muted-foreground mb-2 text-xs font-medium">Due Date</Typography>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <label className="sr-only">Start date</label>
                        <Input
                          type="date"
                          value={
                            formData.dueDateStart
                              ? new Date(formData.dueDateStart).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => handleInputChange("dueDateStart", e.target.value)}
                          className="h-10 w-full rounded-full border border-border/10 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                          aria-label="Start date"
                        />
                        <span className="hidden sm:inline text-sm text-muted-foreground">→</span>
                      </div>

                      <div className="flex items-center gap-2 flex-1">
                        <label className="sr-only">End date</label>
                        <Input
                          type="date"
                          value={
                            formData.dueDateEnd
                              ? new Date(formData.dueDateEnd).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => handleInputChange("dueDateEnd", e.target.value)}
                          className="h-10 w-full rounded-full border border-border/10 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                          aria-label="End date"
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      {formData.dueDateStart || formData.dueDateEnd ? (
                        <span>
                          {formData.dueDateStart ? formatDate(formData.dueDateStart) : "—"}{" "}
                          <span className="mx-1">→</span>{" "}
                          {formData.dueDateEnd ? formatDate(formData.dueDateEnd) : "—"}
                        </span>
                      ) : (
                        <span>No due date set</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Checklist */}
              <Card className="p-4 rounded-xl border border-border/10 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <Typography variant="h4" className="font-semibold text-sm">Checklist</Typography>
                    <div className="text-xs text-muted-foreground mt-1">Track sub-tasks & progress</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground mr-2">{checklistProgress}%</div>
                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => handleAddChecklistItem("New item")}>+ Add</Button>
                  </div>
                </div>

                {/* progress bar */}
                <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden mb-3">
                  <div 
                    className="h-full rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${checklistProgress}%`, 
                      background: `linear-gradient(90deg, ${formData.color || task.color || "var(--primary)"} 0%, ${formData.color || task.color || "var(--primary)"}CC 100%)`
                    }} 
                  />
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {checklistItems.length === 0 ? (
                    <Typography variant="body-small" className="text-muted-foreground text-xs">No items</Typography>
                  ) : (
                    checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg border border-border/10 hover:shadow-sm transition">
                        <input
                          id={`cl-${index}`}
                          type="checkbox"
                          className="w-4 h-4 rounded border-2 border-border focus:ring-2 focus:ring-offset-0 transition-colors"
                          style={{
                            accentColor: formData.color || task.color || "var(--primary)"
                          }}
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(index)}
                        />
                        <label htmlFor={`cl-${index}`} className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</label>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleRemoveChecklistItem(index)}>×</Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Tags */}
              <Card className="p-3 rounded-xl border border-border/10 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L11 4H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"/><path d="M7 7h.01"/></svg>
                    <Typography variant="body-small" className="text-xs text-muted-foreground">Tags</Typography>
                  </div>

                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted/50" onClick={() => setShowTagInput((s) => !s)}>＋</Button>
                </div>

                {showTagInput && (
                  <div className="flex gap-2 mb-3">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. frontend" className="h-9 text-sm rounded-full border border-border/10 px-3" onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }} />
                    <Button size="sm" variant="outline" className="h-9 px-3 text-sm" onClick={handleAddTag} disabled={!tagInput.trim()}>Add</Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).length === 0 ? (
                    <Typography variant="body-small" className="text-xs text-muted-foreground">No tags</Typography>
                  ) : (
                    (formData.tags || []).map((tag: string, i: number) => (
                      <button key={i} onClick={() => handleRemoveTag(tag)} className="text-xs px-2 py-1 rounded-full border border-border/10 bg-muted/10 hover:bg-muted/20 transition">
                        {tag} ×
                      </button>
                    ))
                  )}
                </div>
              </Card>

              {/* Comments */}
              <Card className="p-3 rounded-xl border border-border/10 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="h4" className="font-semibold text-sm">Comments</Typography>
                  <Badge variant="outline" size="sm" className="text-xs px-2 py-0.5">{comments.length}</Badge>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {isLoadingComments ? (
                    <div className="text-center py-3"><Typography variant="body-small" className="text-xs text-muted-foreground">Loading comments...</Typography></div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-3"><Typography variant="body-small" className="text-xs text-muted-foreground">No comments yet. Be the first to comment!</Typography></div>
                  ) : (
                    comments
                      .slice()
                      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                      .map((c) => (
                        <CommentItem
                          key={c._id}
                          comment={c}
                          users={users}
                          currentUserId="user_1"
                          onCommentUpdate={handleCommentUpdate}
                          onCommentDelete={handleCommentDelete}
                          onReplyAdd={handleReplyAdd}
                        />
                      ))
                  )}
                </div>

                <div className="border-t border-border/10 pt-3 mt-3">
                  <div className="flex gap-3 items-start">
                    <Avatar size="sm" className="w-7 h-7">
                      {users[0]?.avatar ? <AvatarImage src={users[0].avatar} alt={users[0]?.name || "You"} /> : null}
                      <AvatarFallback variant={getAvatarColor(users[0]?.name || "You")} className="text-xs">{getInitials(users[0]?.name || "You")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <TextArea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2} className="resize-none text-sm rounded-md border border-border/10 p-2" />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()} className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-full shadow-sm">Comment</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Task Info & Assignees */}
              <Card className="p-3 rounded-xl border border-border/10 shadow-sm">
                <Typography variant="h4" className="font-semibold text-sm mb-3">Task Info</Typography>

                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div>{formatDate(task.createdAt)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Last Updated</div>
                    <div>{formatDate(task.updatedAt)}</div>
                  </div>

                  { (formData.dueDateStart || formData.dueDateEnd) && (
                    <div>
                      <div className="text-xs text-muted-foreground">Due Range</div>
                      <div>{formatDate(formData.dueDateStart)} — {formatDate(formData.dueDateEnd)}</div>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Assignees</div>
                    <div className="flex flex-col gap-2">
                      {task.assignees && task.assignees.length > 0 ? (
                        task.assignees.map((assigneeId: string) => {
                          const user = users.find((u) => u._id === assigneeId);
                          return user ? (
                            <div key={assigneeId} className="flex items-center gap-2">
                              <Avatar size="sm" className="w-7 h-7">
                                {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                                <AvatarFallback variant={getAvatarColor(user.name)} className="text-xs">{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm">{user.name}</div>
                            </div>
                          ) : null;
                        })
                      ) : (
                        <div className="text-xs text-muted-foreground">No assignees</div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
