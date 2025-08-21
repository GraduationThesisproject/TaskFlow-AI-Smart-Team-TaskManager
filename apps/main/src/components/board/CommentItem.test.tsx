import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentItem } from './CommentItem';
import type { Comment, User } from '../../types/task.types';

// Mock the CommentService
jest.mock('../../services/commentService', () => ({
  CommentService: {
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    addReply: jest.fn(),
    addReaction: jest.fn(),
    removeReaction: jest.fn(),
    togglePin: jest.fn(),
  }
}));

const mockUsers: User[] = [
  {
    _id: 'user_1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar1.jpg'
  },
  {
    _id: 'user_2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://example.com/avatar2.jpg'
  }
];

const mockComment: Comment = {
  _id: 'comment_1',
  content: 'This is a test comment',
  author: 'user_1',
  taskId: 'task_1',
  mentions: [],
  attachments: [],
  reactions: [],
  isPinned: false,
  isResolved: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockHandlers = {
  onCommentUpdate: jest.fn(),
  onCommentDelete: jest.fn(),
  onReplyAdd: jest.fn(),
};

describe('CommentItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders comment content correctly', () => {
    render(
      <CommentItem
        comment={mockComment}
        users={mockUsers}
        currentUserId="user_1"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows edit and delete buttons for comment author', () => {
    render(
      <CommentItem
        comment={mockComment}
        users={mockUsers}
        currentUserId="user_1"
        {...mockHandlers}
      />
    );

    // Hover to show action buttons
    const commentElement = screen.getByText('This is a test comment').closest('.group');
    fireEvent.mouseEnter(commentElement!);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not show edit and delete buttons for non-author', () => {
    render(
      <CommentItem
        comment={mockComment}
        users={mockUsers}
        currentUserId="user_2"
        {...mockHandlers}
      />
    );

    // Hover to show action buttons
    const commentElement = screen.getByText('This is a test comment').closest('.group');
    fireEvent.mouseEnter(commentElement!);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows pinned indicator for pinned comments', () => {
    const pinnedComment = { ...mockComment, isPinned: true };
    
    render(
      <CommentItem
        comment={pinnedComment}
        users={mockUsers}
        currentUserId="user_1"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('📌 Pinned')).toBeInTheDocument();
  });

  it('shows resolved badge for resolved comments', () => {
    const resolvedComment = { ...mockComment, isResolved: true };
    
    render(
      <CommentItem
        comment={resolvedComment}
        users={mockUsers}
        currentUserId="user_1"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('displays reactions correctly', () => {
    const commentWithReactions = {
      ...mockComment,
      reactions: [
        { user: 'user_1', emoji: '👍', createdAt: new Date().toISOString() },
        { user: 'user_2', emoji: '❤️', createdAt: new Date().toISOString() },
        { user: 'user_1', emoji: '👍', createdAt: new Date().toISOString() }
      ]
    };

    render(
      <CommentItem
        comment={commentWithReactions}
        users={mockUsers}
        currentUserId="user_1"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('👍 2')).toBeInTheDocument();
    expect(screen.getByText('❤️ 1')).toBeInTheDocument();
  });
});
