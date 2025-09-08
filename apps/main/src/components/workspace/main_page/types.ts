import type { Space } from '../../../types/space.types';

export type Member = {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'disabled';
  lastActive: string;
};

export interface SearchAndFilterProps {
  search: string;
  setSearch: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  workspaceId: string;
}

export interface MembersTableProps {
  filteredMembers: Member[];
  isLoading: boolean;
  error: string | null;
  onRemove: (memberId: string, role: string, password: string) => Promise<void>;
}

export interface SpaceTableProps {
  filteredSpaces: Space[];
  isLoading: boolean;
  error: string | null;
  onRemove: (spaceId: string) => void;
  onAddSpace: () => void;
  onArchive?: (spaceId: string) => Promise<void>;
  onUnarchive?: (spaceId: string) => Promise<void>;
  onPermanentDelete?: (spaceId: string) => Promise<void>;
  showArchiveActions?: boolean;
  onSpaceClick?: (space: Space) => void;
  viewMode?: 'cards' | 'list' | 'list-detail';
}

export interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSubmit: (space: Partial<Space>) => void;
}

export interface ConfirmRemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  member: {
    id: string;
    role: string;
    name: string;
  } | null;
}

export interface InviteSectionProps {
  onGenerateInvite: () => Promise<{ link?: string; enabled: boolean }>;
  onInviteUser: (email: string, role: 'member' | 'admin') => Promise<{ success: boolean; error?: unknown }>;
}

export interface InfoBannerProps {
  workspaceId: string;
}
