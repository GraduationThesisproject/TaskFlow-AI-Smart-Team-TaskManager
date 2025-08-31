import React from 'react';
import Sidebar from "./Sidebar";
import SettingsHeader from "../../components/workspace/settings-page/SettingsHeader";
import SettingsList from "../../components/workspace/settings-page/SettingsList";
import VisibilitySettingsModal from "../../components/workspace/settings-page/VisibilitySettingsModal";
import MembershipSettingsModal from "../../components/workspace/settings-page/MembershipSettingsModal";
import BoardCreationSettingsModal from "../../components/workspace/settings-page/BoardCreationSettingsModal";
import BoardDeletionSettingsModal from "../../components/workspace/settings-page/BoardDeletionSettingsModal";
import GuestSharingSettingsModal from "../../components/workspace/settings-page/GuestSharingSettingsModal";
import { useAppDispatch, useAppSelector } from "../../store";
import {  selectWorkspaceState, updateWorkspaceSettings } from "../../store/slices/workspaceSlice";
import { selectUserWorkspaceRoles, selectUserBasic } from "../../store/slices/authSlice";

function SettingsLayout() {
  const dispatch = useAppDispatch();
  const { currentWorkspace, loading } = useAppSelector(selectWorkspaceState);
  const workspaceId = currentWorkspace?._id;
  
  // Move ALL hooks to the top before any conditional returns
  const [showVisibilityModal, setShowVisibilityModal] = React.useState(false);
  const [showMembershipModal, setShowMembershipModal] = React.useState(false);
  const [showBoardCreationModal, setShowBoardCreationModal] = React.useState(false);
  const [showBoardDeletionModal, setShowBoardDeletionModal] = React.useState(false);
  const [showGuestSharingModal, setShowGuestSharingModal] = React.useState(false);
  
  // Get current user's role in this workspace
  const userWorkspaceRoles = useAppSelector(selectUserWorkspaceRoles);
  const currentUser = useAppSelector(selectUserBasic);
  
  // Show loading state
  if (loading) {
    return <div>Loading workspace settings...</div>;
  }
  
  // Check if we have a valid workspace
  if (!currentWorkspace || !workspaceId) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">No workspace selected or workspace not found.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const settings = currentWorkspace?.settings as any | undefined;
  
  // Debug log to check the workspace and user data
  console.log('Current workspace:', currentWorkspace);
  console.log('Current user ID:', currentUser?._id);
  console.log('Workspace roles:', userWorkspaceRoles);
  
  // Handle both string and object owner types
  const getOwnerId = (owner: any) => {
    if (!owner) return null;
    return typeof owner === 'string' ? owner : owner._id || owner.id || owner.toString();
  };

  const workspaceOwnerId = getOwnerId(currentWorkspace?.owner);
  const currentUserId = currentUser?._id;
  const isOwner = workspaceOwnerId && currentUserId && workspaceOwnerId.toString() === currentUserId.toString();
  
  console.group('Workspace Access Debug');
  console.log('Workspace Owner ID:', workspaceOwnerId);
  console.log('Current User ID:', currentUserId);
  console.log('Is Owner:', isOwner);
  console.log('Workspace ID:', workspaceId);
  console.log('User Roles:', userWorkspaceRoles);
  console.log('Current User Object:', currentUser);
  console.groupEnd();
  
  const userRoleInWorkspace = isOwner ? 'owner' : (workspaceId ? userWorkspaceRoles[workspaceId]?.[0] : null);
  
  const canManageMembership = isOwner || userRoleInWorkspace === 'admin';
  const canManageBoardCreation = isOwner || userRoleInWorkspace === 'admin';
  const canManageBoardDeletion = isOwner || userRoleInWorkspace === 'admin';
  const canManageGuestSharing = isOwner || userRoleInWorkspace === 'admin';

  const handleUpdate = async (
    section: string,
    updates: Record<string, any>
  ) => {
    // Only allow updates if user is the owner
    if (!isOwner) {
      console.warn('Only workspace owners can update settings');
      // In a real app, you might want to show this to the user
      return;
    }

    try {
      const resultAction = await dispatch(
        updateWorkspaceSettings({ 
          id: workspaceId, 
          section, 
          updates: {
            [section]: updates
          }
        })
      );
      
      if (updateWorkspaceSettings.rejected.match(resultAction)) {
        throw resultAction.error;
      }
      
      // Show success message
      console.log('Settings updated successfully');
      
    } catch (error) {
      console.error("Failed to update settings", error);
      // Show error message to user
    }
  };

  const handleUpgrade = () => {
    console.log("Upgrade to premium clicked");
    // TODO: Implement upgrade functionality
  };

  const handleVisibilityChange = async () => {
    const current = !!settings?.permissions?.publicJoin;
    await handleUpdate("permissions", { publicJoin: !current });
    setShowVisibilityModal(false);
  };

  const handleBoardCreationChange = async () => {
    const current = !!settings?.permissions?.allowMemberBoardCreation;
    await handleUpdate("permissions", { allowMemberBoardCreation: !current });
    setShowBoardCreationModal(false);
  };

  const handleBoardDeletionChange = async () => {
    const current = !!settings?.permissions?.allowMemberBoardDeletion;
    await handleUpdate("permissions", { allowMemberBoardDeletion: !current });
    setShowBoardDeletionModal(false);
  };

  const handleGuestSharingChange = async () => {
    const current = !!settings?.permissions?.allowGuestInvites;
    await handleUpdate("permissions", { allowGuestInvites: !current });
    setShowGuestSharingModal(false);
  };

  const onClickByKey: Record<string, () => void> = {
    visibility: () => {
      setShowVisibilityModal(true);
    },
    slack: () => {
      const current = !!settings?.notifications?.slackIntegration;
      handleUpdate("notifications", { slackIntegration: !current });
    },
    membership: () => {
      if (!canManageMembership) {
        setShowMembershipModal(true);
        return;
      }
      const current = !!settings?.permissions?.allowMemberInvites;
      handleUpdate("permissions", { allowMemberInvites: !current });
    },
    creation: () => {
      if (!canManageBoardCreation) {
        setShowBoardCreationModal(true);
        return;
      }
      const current = !!settings?.permissions?.allowMemberBoardCreation;
      handleUpdate("permissions", { allowMemberBoardCreation: !current });
    },
    deletion: () => {
      if (!canManageBoardDeletion) {
        setShowBoardDeletionModal(true);
        return;
      }
      const current = !!settings?.permissions?.allowMemberBoardDeletion;
      handleUpdate("permissions", { allowMemberBoardDeletion: !current });
    },
    guests: () => {
      if (!canManageGuestSharing) {
        setShowGuestSharingModal(true);
        return;
      }
      setShowGuestSharingModal(true);
    },
    "slack-restrictions": () => {
      // Placeholder for future granular Slack restrictions
      console.warn("Slack restrictions update not implemented in backend schema");
    },
  };

  const sections = [
    {
      key: "visibility",
      title: "Workspace Visibility",
      description:
        "Private – This Workspace is private. It's not indexed or visible to those outside the Workspace.",
      cta: "Change",
    },
    {
      key: "slack",
      title: "Slack Workspaces Linking",
      description:
        "Link your Slack and Trello Workspaces together to collaborate on Trello projects from within Slack.",
      cta: "Add to Slack",
      learnMore: true,
    },
    {
      key: "membership",
      title: "Workspace Membership Restrictions",
      description: "Any can be added to this Workspace.",
      cta: "Change",
    },
    {
      key: "creation",
      title: "Board Creation Restrictions",
      bullets: [
        "Any Workspace member can create public boards.",
        "Any Workspace member can create Workspace visible boards.",
        "Any Workspace member can create private boards.",
      ],
      cta: "Change",
    },
    {
      key: "deletion",
      title: "Board Deletion Restrictions",
      bullets: [
        "Any Workspace member can delete public boards.",
        "Any Workspace member can delete Workspace visible boards.",
        "Any Workspace member can delete private boards.",
      ],
      cta: "Change",
    },
    {
      key: "guests",
      title: "Sharing Boards with Guests",
      description:
        "Anybody can send or receive invitations to boards in this Workspace.",
      cta: "Change",
    },
    {
      key: "slack-restrictions",
      title: "Slack Workspaces Restrictions",
      description:
        "Any Workspace member can link and unlink this Trello Workspace with Slack workspaces.",
      cta: "Change",
    },
  ];

  const currentVisibility = settings?.permissions?.publicJoin ? 'Public' : 'Private';
  const newVisibility = settings?.permissions?.publicJoin ? 'Private' : 'Public';
  
  const currentMembershipSetting = settings?.permissions?.allowMemberInvites ? 'Anyone can be added' : 'Only admins can add members';
  const newMembershipSetting = settings?.permissions?.allowMemberInvites ? 'Only admins can add members' : 'Anyone can be added';
  
  const currentBoardCreationSetting = settings?.permissions?.allowMemberBoardCreation ? 'Any member can create boards' : 'Only admins can create boards';
  const newBoardCreationSetting = settings?.permissions?.allowMemberBoardCreation ? 'Only admins can create boards' : 'Any member can create boards';
  
  const currentBoardDeletionSetting = settings?.permissions?.allowMemberBoardDeletion ? 'Any member can delete boards' : 'Only admins can delete boards';
  const newBoardDeletionSetting = settings?.permissions?.allowMemberBoardDeletion ? 'Only admins can delete boards' : 'Any member can delete boards';

  const currentGuestSharingSetting = settings?.permissions?.allowGuestInvites ? 'Anyone can invite guests' : 'Only admins can invite guests';
  const newGuestSharingSetting = settings?.permissions?.allowGuestInvites ? 'Only admins can invite guests' : 'Anyone can invite guests';

  return (
    <div className="flex min-h-screen text-[hsl(var(--foreground))] ">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div>
          <div className="bg-background shadow-[0_0_0_1px_rgba(0,232,198,0.12),_0_8px_30px_-12px_rgba(0,232,198,0.25)] ring-1 ring-accent/10 px-5 sm:px-6 lg:px-8 py-6">
            <SettingsHeader title="Workspace Settings" status={currentVisibility} />
            <SettingsList
              sections={sections}
              loading={loading}
              settings={settings}
              onClickByKey={onClickByKey}
              onUpgrade={handleUpgrade}
            />
          </div>
        </div>
      </main>

      {/* Settings Modals */}
      <VisibilitySettingsModal
        isOpen={showVisibilityModal}
        onClose={() => setShowVisibilityModal(false)}
        onConfirm={handleVisibilityChange}
        currentVisibility={currentVisibility}
        newVisibility={newVisibility}
        loading={loading}
      />

      <MembershipSettingsModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onConfirm={canManageMembership ? () => {
          const current = !!settings?.permissions?.allowMemberInvites;
          handleUpdate("permissions", { allowMemberInvites: !current });
          setShowMembershipModal(false);
        } : undefined}
        canManage={canManageMembership}
        currentSetting={currentMembershipSetting}
        newSetting={newMembershipSetting}
        userRole={userRoleInWorkspace}
        userName={currentUser?.name}
        loading={loading}
      />

      <BoardCreationSettingsModal
        isOpen={showBoardCreationModal}
        onClose={() => setShowBoardCreationModal(false)}
        onConfirm={canManageBoardCreation ? handleBoardCreationChange : undefined}
        canManage={canManageBoardCreation}
        currentSetting={currentBoardCreationSetting}
        newSetting={newBoardCreationSetting}
        userRole={userRoleInWorkspace}
        userName={currentUser?.name}
        loading={loading}
      />

      <BoardDeletionSettingsModal
        isOpen={showBoardDeletionModal}
        onClose={() => setShowBoardDeletionModal(false)}
        onConfirm={canManageBoardDeletion ? handleBoardDeletionChange : undefined}
        canManage={canManageBoardDeletion}
        currentSetting={currentBoardDeletionSetting}
        newSetting={newBoardDeletionSetting}
        userRole={userRoleInWorkspace}
        userName={currentUser?.name}
        loading={loading}
      />

      <GuestSharingSettingsModal
        isOpen={showGuestSharingModal}
        onClose={() => setShowGuestSharingModal(false)}
        onConfirm={canManageGuestSharing ? handleGuestSharingChange : undefined}
        canManage={canManageGuestSharing}
        currentSetting={currentGuestSharingSetting}
        newSetting={newGuestSharingSetting}
        userRole={userRoleInWorkspace}
        userName={currentUser?.name}
        loading={loading}
      />
    </div>
  );
}

export default SettingsLayout;