import React, { useState, useCallback } from 'react';
import { Button, Avatar, AvatarImage, AvatarFallback } from '@taskflow/ui';
import Pill from './Pill';
import { roleBadgeVariant, statusBadgeVariant } from './data';
import ConfirmRemoveMemberDialog from './ConfirmRemoveMemberDialog';

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
  name: string;
  email: string;
  handle: string;
  displayRole: string;
  displayStatus: string;
  lastActiveStr: string;
  avatar?: string;
}

interface MembersTableProps {
  filteredMembers: Member[];
  isLoading: boolean;
  error: string | null;
  onRemove: (memberId: string, roleKey: string, password?: string) => Promise<void>;
  onGenerateInvite: () => void;
}

const MembersTable: React.FC<MembersTableProps> = ({
  filteredMembers,
  isLoading,
  error,
  onRemove,
}) => {
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    role: string;
    name: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRemoveClick = useCallback((member: Member) => {
    if (member.id) {
      setMemberToRemove({
        id: member.id,
        role: member.role,
        name: member.name || 'this member'
      });
      setIsDialogOpen(true);
    }
  }, []);

  const handleConfirmRemove = async (password: string) => {
    if (memberToRemove) {
      try {
        await onRemove(memberToRemove.id, memberToRemove.role, password);
        setIsDialogOpen(false);
        setMemberToRemove(null);
      } catch (error) {
        throw error; // Let the dialog handle the error
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setMemberToRemove(null);
  };
  return (
    <section
      className="mb-5 w-full rounded-xl p-4 ring-1 shadow-[0_0_10px_hsl(var(--accent))] 
         ring-1 ring-primary/20 
         backdrop-blur bg-background"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'hsl(var(--primary-foreground))' }}>
        
          </h2>
          <h3 className="text-base font-semibold" style={{ color: 'hsl(var(--primary-foreground))' }}>
            Workspace Members ({filteredMembers.length})
          </h3>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Workspace members can view and join all Workspace visible boards and create new boards in the Workspace.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <table className="w-full table-auto border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-sm " style={{ color: 'hsl(var(--primary-foreground))' }}>
              <th className="px-3 py-2 border-b border-neutral-100 ">Member</th>
              <th className="px-3 py-2 border-b border-neutral-100">Email</th>
              <th className="px-3 py-2 border-b border-neutral-100">Role</th>
              <th className="px-3 py-2 border-b border-neutral-100">Status</th>
              <th className="px-3 py-2 border-b border-neutral-100">Last Active</th>
              <th className="px-3 py-2 border-b border-neutral-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Loading members...
                </td>
              </tr>
            )}
            {error && !isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-sm text-red-600">
                  {error}
                </td>
              </tr>
            )}
            {!isLoading && !error && filteredMembers.map((m) => (
              <tr key={m.id} className="rounded-lg">
                <td className="px-3 py-2 border-b border-neutral-100">
                  <div className="flex items-center gap-3 ">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.avatar} alt={m.name || 'User'} />
                      <AvatarFallback variant="primary" className="text-xs">
                        {m.name && m.name.length > 0 ? m.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'hsl(var(--primary-foreground))' }}>
                        {m.name}
                      </div>
                      <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        @{m.handle}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm border-b border-neutral-100" style={{ color: 'hsl(var(--primary-foreground))' }}>
                  {m.email}
                </td>
                <td className="px-3 py-2 border-b border-neutral-100">
                  <Pill variant={roleBadgeVariant((m.role === 'owner' ? 'Owner' : m.role === 'admin' ? 'Admin' : 'Member') as any)}>▼ {m.role === 'owner' ? 'Owner' : m.role === 'admin' ? 'Admin' : 'Member'}</Pill>
                </td>
                <td className="px-3 py-2 border-b border-neutral-100">
                  <Pill variant={statusBadgeVariant(((m.status || 'active') === 'active' ? 'Active' : (m.status || 'active') === 'pending' ? 'Pending' : 'Disabled') as any)}>{(m.status || 'active') === 'active' ? 'Active' : (m.status || 'active') === 'pending' ? 'Pending' : 'Disabled'}</Pill>
                </td>
                <td className="px-3 py-2 text-sm border-b border-neutral-100" style={{ color: 'hsl(var(--primary-foreground))' }}>
                  {typeof m.lastActive === 'string' ? m.lastActive : (m.lastActive ? new Date(m.lastActive).toLocaleDateString() : '—')}
                </td>
                <td className="px-3 py-2 border-b border-neutral-200">
                  <div className="flex items-center gap-2 ">

                    <Button
                      className="rounded-md px-3 py-1.5 text-sm font-medium bg-red-600"
                      variant="destructive"
                      size="sm"
                      onClick={() => m.id && handleRemoveClick(m)}
                    >
                      {m.role === 'owner' ? 'Leave' : 'Remove'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {memberToRemove && (
        <ConfirmRemoveMemberDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmRemove}
          memberName={memberToRemove.name}
          isOwner={memberToRemove.role === 'owner'}
        />
      )}
    </section>
  );
};

export default MembersTable;
