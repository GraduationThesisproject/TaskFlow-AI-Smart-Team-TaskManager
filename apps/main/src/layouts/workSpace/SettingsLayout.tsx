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
  const workspaceId = currentWorkspace?._id as string | undefined;
  const settings = currentWorkspace?.settings as any | undefined;
  const [showVisibilityModal, setShowVisibilityModal] = React.useState(false);
  const [showMembershipModal, setShowMembershipModal] = React.useState(false);
  const [showBoardCreationModal, setShowBoardCreationModal] = React.useState(false);
  const [showBoardDeletionModal, setShowBoardDeletionModal] = React.useState(false);
  const [showGuestSharingModal, setShowGuestSharingModal] = React.useState(false);
  
  // Get current user's role in this workspace
  const userWorkspaceRoles = useAppSelector(selectUserWorkspaceRoles);
  const currentUser = useAppSelector(selectUserBasic);
  const userRoleInWorkspace = workspaceId ? userWorkspaceRoles[workspaceId]?.[0] : null;
  const canManageMembership = userRoleInWorkspace === 'owner' || userRoleInWorkspace === 'admin';
  const canManageBoardCreation = userRoleInWorkspace === 'owner' || userRoleInWorkspace === 'admin';
  const canManageBoardDeletion = userRoleInWorkspace === 'owner' || userRoleInWorkspace === 'admin';
  const canManageGuestSharing = userRoleInWorkspace === 'owner' || userRoleInWorkspace === 'admin';

  const handleUpdate = async (
    section: string,
    updates: Record<string, any>
  ) => {
    if (!workspaceId) return console.warn("No workspaceId available for settings update");
    try {
      await dispatch(
        updateWorkspaceSettings({ id: workspaceId, section, updates })
      );
    } catch (e) {
      console.error("Failed to update settings", e);
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
  const newBoardDeletionSetting = !!settings?.permissions?.allowMemberBoardDeletion ? 'Only admins can delete boards' : 'Any member can delete boards';

  const currentGuestSharingSetting = !!settings?.permissions?.allowGuestInvites ? 'Anyone can invite guests' : 'Only admins can invite guests';
  const newGuestSharingSetting = !!settings?.permissions?.allowGuestInvites ? 'Only admins can invite guests' : 'Anyone can invite guests';

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
  );}


export default SettingsLayout;