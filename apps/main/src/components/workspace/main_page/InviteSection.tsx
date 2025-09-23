import React, { useState, useEffect } from 'react';
import { Button, Input } from '@taskflow/ui';
import { useUsers } from '../../../hooks/useUsers';
import { useGitHub } from '../../../hooks/useGitHub';
import { useInvitations } from '../../../hooks/useInvitations';
import { useToast } from '../../../hooks/useToast';
import type { InviteSectionProps } from './types';
import type { Workspace } from '../../../types/workspace.types';

interface User {
  _id: string;
  email: string;
  name?: string;
}

const InviteSection: React.FC<InviteSectionProps> = ({
  onGenerateInvite,
  onInviteUser,
  workspace
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [showGitHubMembers, setShowGitHubMembers] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  
  const { searchResults, isSearching, searchError, searchUsers, clearSearch } = useUsers();
  const { members: githubMembers, fetchMembersWithEmails, isLoading: githubLoading } = useGitHub();
  const { inviteGitHubMembers } = useInvitations();
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
      const result = await onInviteUser(user.email, 'member');
      if (result.success) {
        success(`Invitation sent to ${user.email}`, 'Success');
        clearSearch();
        setSearchQuery('');
      } else {
        showError(result.error || 'Failed to send invitation', 'Error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      showError(errorMessage, 'Error');
    }
  };

  const handleLoadGitHubMembers = async () => {
    if (!workspace?.githubOrg?.login) return;

    try {
      setIsLoadingMembers(true);
      await fetchMembersWithEmails(workspace.githubOrg.login);
      setShowGitHubMembers(true);
    } catch (error) {
      console.error('Failed to load GitHub members:', error);
      showError('Failed to load GitHub members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleInviteGitHubMember = async (member: any) => {
    if (!member.email) {
      showError('Email not available - GitHub privacy settings prevent access to member emails. Please invite manually using their email address.');
      return;
    }

    try {
      const result = await onInviteUser(member.email, 'member');
      if (result.success) {
        success(`Invitation sent to ${member.email}`, 'Success');
      } else {
        showError(result.error || 'Failed to send invitation', 'Error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      showError(errorMessage, 'Error');
    }
  };

  const handleBulkInviteGitHubMembers = async () => {
    if (!workspace?.githubOrg?.login || selectedMembers.length === 0) return;

    try {
      setIsInviting(true);
      const memberEmails = selectedMembers.map(memberId => {
        const member = githubMembers.find(m => m.id.toString() === memberId);
        return member?.email;
      }).filter(Boolean) as string[];

      if (memberEmails.length === 0) {
        showError('No valid email addresses found for selected members');
        return;
      }

      const result = await inviteGitHubMembers({
        workspaceId: workspace._id,
        memberEmails,
        role: 'member',
        message: `You've been invited to join ${workspace.name} via GitHub organization`
      });

      if (result) {
        const { successful, failed, alreadyMembers, alreadyInvited } = result;
        
        if (successful.length > 0) {
          success(`Successfully sent ${successful.length} invitations`, 'Success');
        }
        
        if (failed.length > 0) {
          showError(`Failed to send ${failed.length} invitations: ${failed.map(f => f.error).join(', ')}`, 'Error');
        }
        
        if (alreadyMembers.length > 0) {
          info(`${alreadyMembers.length} members are already part of the workspace`, 'Info');
        }
        
        if (alreadyInvited.length > 0) {
          info(`${alreadyInvited.length} members already have pending invitations`, 'Info');
        }

        setSelectedMembers([]);
        setShowGitHubMembers(false);
      }
    } catch (error) {
      console.error('Failed to bulk invite GitHub members:', error);
      showError('Failed to send bulk invitations');
    } finally {
      setIsInviting(false);
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    const membersWithEmails = githubMembers.filter(m => m.email && m.isAppUser);
    setSelectedMembers(membersWithEmails.map(m => m.id.toString()));
  };

  const handleReset = () => {
    setInviteLink('');
    setIsExpanded(false);
    setSearchQuery('');
    clearSearch();
    setShowGitHubMembers(false);
    setIsLoadingMembers(false);
    setSelectedMembers([]);
  };

  // Auto-load GitHub members when workspace has GitHub org and section is expanded
  useEffect(() => {
    if (workspace?.githubOrg?.login && isExpanded) {
      handleLoadGitHubMembers();
    }
  }, [workspace?.githubOrg?.login, isExpanded]);

  // Safe members array to prevent errors
  const safeMembers = !githubMembers || !Array.isArray(githubMembers) ? [] : githubMembers;
  const membersWithEmails = safeMembers.filter(m => m.email && m.isAppUser);
  const membersWithoutEmails = safeMembers.filter(m => !m.email || !m.isAppUser);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Invite Members</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateLink}
            disabled={isGeneratingLink}
          >
            {isGeneratingLink ? 'Generating...' : 'Generate Link'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Options
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Invite Link Section */}
          {inviteLink && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invite Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(inviteLink)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}

          {/* Manual Search Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Search Users</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => searchUsers(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {searchError && (
              <div className="text-sm text-red-600">{searchError}</div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {user.name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInviteUser(user)}
                      className="h-6 px-2 text-xs"
                    >
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GitHub Members Section */}
          {workspace?.githubOrg && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub Organization Members
                </h4>
                {!showGitHubMembers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadGitHubMembers}
                    disabled={githubLoading || isLoadingMembers}
                    className="h-6 px-2 text-xs"
                  >
                    {githubLoading || isLoadingMembers ? 'Loading...' : 'Load Members'}
                  </Button>
                )}
              </div>

              {showGitHubMembers && (
                <div className="space-y-2">
                  {isLoadingMembers ? (
                    <div className="text-center py-4 text-sm text-slate-500">
                      Loading member details...
                    </div>
                  ) : safeMembers.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-500">
                      No GitHub members found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Members with emails (app users) */}
                      {membersWithEmails.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
                              <strong>App Users ({membersWithEmails.length}):</strong> These members have accounts in our app and can be invited directly.
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAllMembers}
                                className="h-6 px-2 text-xs"
                              >
                                Select All
                              </Button>
                              {selectedMembers.length > 0 && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={handleBulkInviteGitHubMembers}
                                  disabled={isInviting}
                                  className="h-6 px-2 text-xs"
                                >
                                  {isInviting ? 'Inviting...' : `Invite ${selectedMembers.length}`}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {membersWithEmails.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedMembers.includes(member.id.toString())}
                                  onChange={() => handleSelectMember(member.id.toString())}
                                  className="rounded border-slate-300"
                                />
                                <img
                                  src={member.avatar}
                                  alt={member.name || member.login}
                                  className="w-6 h-6 rounded-full"
                                />
                                <div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {member.name || member.login}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    @{member.login} • {member.email}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleInviteGitHubMember(member)}
                                className="h-6 px-2 text-xs"
                              >
                                Invite
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Members without emails */}
                      {membersWithoutEmails.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                            <strong>External Members ({membersWithoutEmails.length}):</strong> These members don't have accounts in our app. You can manually invite them using their email address.
                          </div>
                          
                          {membersWithoutEmails.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={member.avatar}
                                  alt={member.name || member.login}
                                  className="w-6 h-6 rounded-full"
                                />
                                <div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {member.name || member.login}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    @{member.login}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={true}
                                className="h-6 px-2 text-xs opacity-50 cursor-not-allowed"
                                title="Email not available - GitHub privacy settings"
                              >
                                No Email
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteSection;