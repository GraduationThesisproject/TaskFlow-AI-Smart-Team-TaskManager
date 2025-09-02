import React, { useState } from 'react';
import { 
  Avatar,
  AvatarImage,
  AvatarFallback,
  Typography,
  Button,
  TextArea,
  Badge,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';
import type { CommentReaction } from '../../types/task.types';
import { CommentService } from '../../services/commentService';
import type { CommentItemProps } from '../../types/interfaces/ui';

const REACTION_EMOJIS = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '🚀'];

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  users,
  currentUserId,
  onCommentUpdate,
  onCommentDelete,
  onReplyAdd
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const author = users.find(u => u._id === comment.author);
  const currentUser = users.find(u => u._id === currentUserId);
  const isAuthor = comment.author === currentUserId;

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

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await CommentService.updateComment(comment._id, editContent);
      onCommentUpdate(comment._id, response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setIsSubmitting(true);
    try {
      await CommentService.deleteComment(comment._id);
      onCommentDelete(comment._id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await CommentService.addReply(comment._id, replyContent);
      onReplyAdd(comment._id, response.data);
      setIsReplying(false);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      const existingReaction = comment.reactions.find(
        r => r.user === currentUserId && r.emoji === emoji
      );

      if (existingReaction) {
        await CommentService.removeReaction(comment._id, emoji);
      } else {
        await CommentService.addReaction(comment._id, emoji);
      }
      
      // Refresh the comment data
      const updatedComment = { ...comment };
      if (existingReaction) {
        updatedComment.reactions = comment.reactions.filter(
          r => !(r.user === currentUserId && r.emoji === emoji)
        );
      } else {
        updatedComment.reactions = [
          ...comment.reactions,
          { user: currentUserId, emoji, createdAt: new Date().toISOString() }
        ];
      }
      onCommentUpdate(comment._id, updatedComment);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handlePin = async () => {
    try {
      await CommentService.togglePin(comment._id);
      const updatedComment = { ...comment, isPinned: !comment.isPinned };
      onCommentUpdate(comment._id, updatedComment);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };



  const hasUserReacted = (emoji: string) => {
    return comment.reactions.some(r => r.user === currentUserId && r.emoji === emoji);
  };

  const getUniqueReactions = () => {
    const uniqueReactions = new Map<string, CommentReaction[]>();
    comment.reactions.forEach(reaction => {
      if (!uniqueReactions.has(reaction.emoji)) {
        uniqueReactions.set(reaction.emoji, []);
      }
      uniqueReactions.get(reaction.emoji)!.push(reaction);
    });
    return Array.from(uniqueReactions.entries());
  };

  return (
    <div className="group relative">
      <div className={`flex gap-3 p-4 rounded-xl hover:bg-muted/30 transition-all duration-200 border ${
        comment.isPinned 
          ? 'border-primary/20 bg-primary/5' 
          : 'border-transparent hover:border-border/50'
      }`}>
        {comment.isPinned && (
          <div className="absolute -top-2 -left-2 bg-primary text-white text-xs px-2 py-1 rounded-full z-10">
            📌 Pinned
          </div>
        )}
        
        <Avatar size="lg" className="ring-2 ring-border/50 flex-shrink-0">
          <AvatarImage src={author?.avatar} alt={author?.name || 'Unknown'} />
          <AvatarFallback variant={getAvatarColor(author?.name || 'Unknown')}>
            {getInitials(author?.name || 'Unknown')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Typography variant="body-small" className="font-semibold text-foreground">
              {author?.name || 'Unknown User'}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              {formatTimeAgo(new Date(comment.createdAt))}
            </Typography>
            {comment.isResolved && (
              <Badge variant="success" size="sm">Resolved</Badge>
            )}
          </div>
          
          <div className="bg-muted/20 rounded-lg p-3">
            {isEditing ? (
              <div className="space-y-3">
                <TextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-20 resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleEdit}
                    disabled={isSubmitting || !editContent.trim()}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Typography variant="body-small" className="text-foreground leading-relaxed">
                {comment.content}
              </Typography>
            )}
          </div>
          
          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {getUniqueReactions().map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors ${
                    hasUserReacted(emoji)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {emoji} {reactions.length}
                </button>
              ))}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Reaction button */}
            <div className="relative">
              <button 
                className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                onClick={() => setShowReactions(!showReactions)}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                React
              </button>
              
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-lg p-2 shadow-lg z-10">
                  <div className="flex gap-1">
                    {REACTION_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          handleReaction(emoji);
                          setShowReactions(false);
                        }}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Reply button */}
            <button 
              className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
              onClick={() => setIsReplying(!isReplying)}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Reply
            </button>
            
            {/* Pin button */}
            <button 
              className={`text-xs flex items-center gap-1 transition-colors ${
                comment.isPinned 
                  ? 'text-primary hover:text-primary/80' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={handlePin}
            >
              <svg className="w-3 h-3" fill={comment.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {comment.isPinned ? 'Pinned' : 'Pin'}
            </button>
            
            {/* Edit/Delete buttons for author */}
            {isAuthor && (
              <>
                <button 
                  className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                  onClick={() => setIsEditing(true)}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button 
                  className="text-error hover:text-error text-xs flex items-center gap-1"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </>
            )}
          </div>
          
          {/* Reply form */}
          {isReplying && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <Avatar size="sm" className="ring-1 ring-border flex-shrink-0">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || 'You'} />
                  <AvatarFallback variant={getAvatarColor(currentUser?.name || 'You')}>
                    {getInitials(currentUser?.name || 'You')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <TextArea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-20 resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleReply}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? 'Sending...' : 'Reply'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
