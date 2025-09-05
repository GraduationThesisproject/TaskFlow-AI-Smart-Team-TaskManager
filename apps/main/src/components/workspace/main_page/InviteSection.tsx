import React, { useState, useEffect } from 'react';
import { Button, Input } from '@taskflow/ui';
import { useUsers } from '../../../hooks/useUsers';
import { useToast } from '../../../hooks/useToast';
import type { InviteSectionProps } from './types';

interface User {
  _id: string;
  email: string;
  name?: string;
}

const InviteSection: React.FC<InviteSectionProps> = ({
  onGenerateInvite,
  onInviteUser
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  const { searchResults, isSearching, searchError, searchUsers, clearSearch } = useUsers();
  const { success, error: showError, info } = useToast();

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const result = await onGenerateInvite();
      if (result?.link) {
        setInviteLink(result.link);
        setIsExpanded(true);
        success('Invite link generated successfully!', 'Success');
      } else {
        showError('Failed to generate invite link', 'Error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invite link';
      showError(errorMessage, 'Error');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleInviteUser = async (user: User) => {
    try {
      if (onInviteUser) {
        const result = await onInviteUser(user.email, 'member');
        
        if (result.success) {
          // Clear search and show success
          setSearchQuery('');
          clearSearch();
          success(`Invitation sent to ${user.email}`, 'Success');
        } else {
          // Handle error from the hook
          const error = result.error;
          let errorMessage = 'Failed to send invitation';
          
          // Handle different error types (Error objects, strings, etc.)
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as any).message;
          }
          
          // Handle specific error cases for better UX
          if (errorMessage.includes('already a member')) {
            errorMessage = `${user.email} is already a member of this workspace`;
          } else if (errorMessage.includes('already exists')) {
            errorMessage = `An invitation for ${user.email} already exists`;
          } else if (errorMessage.includes('insufficient permissions')) {
            errorMessage = 'You do not have permission to invite members';
          }
          
          showError(errorMessage, 'Invitation Failed');
        }
      } else {
        showError('Invitation functionality not available', 'Error');
      }
    } catch (error) {
      let errorMessage = 'Failed to send invitation';
      
      // Handle different error types (Error objects, strings, etc.)
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      // Handle specific error cases for better UX
      if (errorMessage.includes('already a member')) {
        errorMessage = `${user.email} is already a member of this workspace`;
      } else if (errorMessage.includes('already exists')) {
        errorMessage = `An invitation for ${user.email} already exists`;
      } else if (errorMessage.includes('insufficient permissions')) {
        errorMessage = 'You do not have permission to invite members';
      }
      
      showError(errorMessage, 'Invitation Failed');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      success('Invite link copied to clipboard!', 'Success');
    }
  };

  const handleReset = () => {
    setIsExpanded(false);
    setInviteLink('');
    setSearchQuery('');
    clearSearch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <h3 className="text-base font-medium text-slate-900">Invite Members</h3>
      </div>
      
      {!isExpanded ? (
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleGenerateLink}
          disabled={isGeneratingLink}
          className="w-full justify-center"
        >
          {isGeneratingLink ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Invite Link
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Invite Link Display */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Invite Link</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyInviteLink}
                className="h-6 px-2 text-xs"
              >
                Copy
              </Button>
            </div>
            <div className="text-xs text-slate-600 break-all bg-white p-2 rounded border">
              {inviteLink}
            </div>
          </div>

          {/* User Search */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="text-center py-2 text-sm text-red-500">
                {searchError}
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleInviteUser(user)}
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {user.name || 'No name'}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && !isSearching && !searchError && (
              <div className="text-center py-4 text-sm text-slate-500">
                No users found
              </div>
            )}
          </div>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="w-full text-slate-600 hover:text-slate-900"
          >
            Reset
          </Button>
        </div>
      )}
      
      <div className="text-xs text-slate-500 text-center">
        {!isExpanded 
          ? 'Generate a link to invite new team members'
          : 'Search for users to invite directly or share the link'
        }
      </div>
    </div>
  );
};

export default InviteSection;
