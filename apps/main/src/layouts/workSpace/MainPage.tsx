import React from 'react';
import Sidebar from "./Sidebar";
import PageHeader from '../../components/workspace/main_page/PageHeader';
import InfoBanner from '../../components/workspace/main_page/InfoBanner';
import SearchAndFilter from '../../components/workspace/main_page/SearchAndFilter';
import MembersTable from '../../components/workspace/main_page/MembersTable';
import InviteSection from '../../components/workspace/main_page/InviteSection';
import GuestsSection from '../../components/workspace/main_page/GuestsSection';
import JoinRequestsSection from '../../components/workspace/main_page/JoinRequestsSection';
import { Modal, ModalBody, ModalFooter } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { useLocation } from 'react-router-dom';
import { workspaceService } from '../../services/workspace.service';
import {
  fetchWorkspace,
  fetchMembers,
  removeMember,
  generateInviteLink,
  disableInviteLink,
  selectMembers,
  selectWorkspaceLoading,
  selectWorkspaceError,
  setCurrentWorkspaceId,
} from '../../store/slices/workspaceSlice';

interface User {
  _id?: string;
  name?: string;
  email?: string;
}

interface Member {
  id?: string;
  userId?: string;
  user?: User | string;
  role: 'owner' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'disabled';
  lastActive?: string | Date;
}

const Main = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const rawWorkspaceId = query.get('id') || '';
  const isValidObjectId = (v: string) => /^[0-9a-fA-F]{24}$/.test(v);
  const currentWorkspace = useAppSelector((s: any) => s.workspace.currentWorkspace);
  const workspaces = useAppSelector((s: any) => s.workspace.workspaces) as Array<{ _id: string }> | undefined;
  const persistedWorkspaceId = useAppSelector((s: any) => s.workspace.currentWorkspaceId);
  const derivedId = currentWorkspace?._id || workspaces?.[0]?._id || persistedWorkspaceId || null;
  const workspaceId = React.useMemo(() => {
    if (isValidObjectId(rawWorkspaceId)) return rawWorkspaceId;
    if (isValidObjectId(derivedId || '')) return derivedId as string;
    return null;
  }, [rawWorkspaceId, derivedId]);
  
  const storeMembers = useAppSelector(selectMembers) ?? [] as Member[];
  const members: Member[] = storeMembers.length > 0 ? storeMembers : (currentWorkspace?.members ?? []);
  const isLoading = useAppSelector(selectWorkspaceLoading);
  const error = useAppSelector(selectWorkspaceError);

  const [role, setRole] = React.useState<'all' | 'owner' | 'admin' | 'member'>('all');
  const [search, setSearch] = React.useState('');
  const [inviteSearch, setInviteSearch] = React.useState('');
  const [showInviteLinkModal, setShowInviteLinkModal] = React.useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = React.useState('');
  const roleLabel = role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1);

  React.useEffect(() => {
    if (!workspaceId) {
      console.warn('[Workspace] Missing or invalid workspace id in URL. Expected 24-char ObjectId in ?id=');
      return;
    }
    console.log('Loading workspace data for ID:', workspaceId);
    dispatch(setCurrentWorkspaceId(workspaceId));
    dispatch(fetchWorkspace(workspaceId));
    dispatch(fetchMembers({ id: workspaceId }));
  }, [dispatch, workspaceId]);

  // Debug logging for members data
  React.useEffect(() => {
    console.log('Members data updated:', {
      storeMembers: storeMembers.length,
      currentWorkspaceMembers: currentWorkspace?.members?.length || 0,
      finalMembers: members.length,
      membersData: members.map((m: Member) => ({ id: m.id, role: m.role, name: typeof m.user === 'object' && m.user?.name ? m.user.name : 'N/A' }))
    });
  }, [storeMembers, currentWorkspace?.members, members]);

  const filteredMembers = React.useMemo(() => {
    const normalized = (Array.isArray(members) ? members : []).map((m: Member) => {
      const derivedId = m.id || m.userId || (typeof m.user === 'object' && m.user?._id) || (typeof m.user === 'string' ? m.user : undefined);
      return {
        ...m,
        id: derivedId,
        userId: m.userId || (typeof m.user === 'string' ? m.user : (typeof m.user === 'object' && m.user?._id ? m.user._id : undefined)),
        displayRole: m.role === 'owner' ? 'Owner' : m.role === 'admin' ? 'Admin' : 'Member',
        displayStatus: (m.status || 'active') === 'active' ? 'Active' : (m.status || 'active') === 'pending' ? 'Pending' : 'Disabled',
        lastActiveStr: typeof m.lastActive === 'string' ? m.lastActive : (m.lastActive ? new Date(m.lastActive).toLocaleDateString() : '—'),
        name: (typeof m.user === 'object' && m.user?.name ? m.user.name.trim() : '') || m.userId || derivedId || 'Unknown',
        email: typeof m.user === 'object' && m.user?.email ? m.user.email : '',
        handle: (((typeof m.user === 'object' && m.user?.name ? m.user.name.trim() : '') || (typeof m.user === 'object' && m.user?.email ? m.user.email : '') || m.userId || derivedId || '')).toLowerCase().replace(/\s+/g, ''),
      };
    });

    return normalized.filter((m) => {
      const byRole = role === 'all' ? true : (role === 'owner' ? m.role === 'owner' : (role === 'admin' ? m.role === 'admin' : m.role === 'member'));
      const q = search.trim().toLowerCase();
      const bySearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.handle.includes(q);
      return byRole && bySearch;
    });
  }, [members, role, search]);

  const onRemove = (memberId: string, roleKey: string) => {
    if (!workspaceId) {
      console.warn('[Workspace] Cannot remove member: missing/invalid workspace id.');
      return;
    }
    dispatch(removeMember({ id: workspaceId, memberId }));
  };
  
  // For Invite Section button - Generate shareable link and show in modal
  const onGenerateInviteLink = () => {
    if (!workspaceId) {
      console.warn('[Workspace] Cannot generate invite: missing/invalid workspace id.');
      return;
    }
    dispatch(generateInviteLink({ id: workspaceId }))
      .unwrap()
      .then((result) => {
        setGeneratedInviteLink(result.link || '');
        setShowInviteLinkModal(true);
      })
      .catch((error) => {
        console.error('Failed to generate invite link:', error);
        alert('Failed to generate invite link: ' + error.message);
      });
  };

  // For Members Table button - Open email invitation form (placeholder for now)
  const onInviteMemberByEmail = () => {
    if (!workspaceId) {
      console.warn('[Workspace] Cannot invite member: missing/invalid workspace id.');
      return;
    }
    // TODO: Open a form modal to collect email and role, then call workspaceService.inviteMember
    const email = prompt('Enter email address to invite:');
    if (email) {
      workspaceService.inviteMember(workspaceId, { email, role: 'member' })
        .then(() => {
          alert('Invitation sent successfully!');
        })
        .catch((error) => {
          console.error('Failed to send invitation:', error);
          alert('Failed to send invitation: ' + error.message);
        });
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
    alert('Invite link copied to clipboard!');
  };
  
  const onDisableInvite = () => {
    if (!workspaceId) {
      console.warn('[Workspace] Cannot disable invite: missing/invalid workspace id.');
      return;
    }
    dispatch(disableInviteLink({ id: workspaceId }));
  };

    // Auto-fire API search when user types 2+ chars (debounced)
    React.useEffect(() => {
      const q = search.trim();
      if (q.length < 2) return;
      if (!workspaceId) {
        // eslint-disable-next-line no-console
        console.warn('[API members search] Skipped: invalid workspace id. Provide ?id=<ObjectId> in URL.');
        return;
      }
      const t = setTimeout(async () => {
        try {
          const apiMembers = await workspaceService.getMembers(workspaceId, { q });
          // eslint-disable-next-line no-console
          console.log('[API members search]', { query: q, count: apiMembers.length, members: apiMembers });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[API members search error]', err);
        }
      }, 300);
      return () => clearTimeout(t);
    }, [search, workspaceId]);

  return (
    <div className="flex min-h-screen bg-neutral-0">
      <Sidebar />
      <div className="flex-1 p-6">
        <PageHeader />
        <InfoBanner workspaceId={workspaceId} />
        <SearchAndFilter 
          search={search}
          setSearch={setSearch}
          role={role}
          setRole={setRole}
          workspaceId={workspaceId}
        />
        <MembersTable 
          filteredMembers={filteredMembers}
          isLoading={isLoading}
          error={error}
          onRemove={onRemove}
          onGenerateInvite={onInviteMemberByEmail}
        />
        <InviteSection 
          search={inviteSearch}
          setSearch={setInviteSearch}
          onGenerateInvite={onGenerateInviteLink}
          onDisableInvite={onDisableInvite}
        />
        <GuestsSection />
        <JoinRequestsSection />
      </div>

      {/* Invite Link Modal */}
      <Modal
        isOpen={showInviteLinkModal}
        onClose={() => setShowInviteLinkModal(false)}
        title="Workspace Invite Link"
        description="Share this link to invite members to your workspace"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Shareable Invite Link:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedInviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-black"
                />
                <Button onClick={copyInviteLink} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>• This link will expire in 7 days</p>
              <p>• Anyone with this link can join your workspace</p>
              <p>• You can disable this link anytime using "Disable invite link"</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowInviteLinkModal(false)} variant="outline">
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Main;