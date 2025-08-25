import React from 'react';
import { Button, Input } from '@taskflow/ui';
import OutlineBtn from './OutlineBtn';
import GhostIconBtn from './GhostIconBtn';

interface InviteSectionProps {
  search: string;
  setSearch: (value: string) => void;
  onGenerateInvite: () => void;
  onDisableInvite: () => void;
}

const InviteSection: React.FC<InviteSectionProps> = ({
  search,
  setSearch,
  onGenerateInvite,
  onDisableInvite
}) => {
  return (
    <section className="mb-5 rounded-xl p-4 shadow-[0_0_10px_hsl(var(--accent))] 
         ring-1 ring-primary/20 
         backdrop-blur bg-neutral-100">
      <h3 className="text-base font-semibold mb-4" style={{ color: 'hsl(var(--primary-foreground))' }}>
        Invite members to join you
      </h3>
      <div
        className="rounded-md p-4 flex flex-row items-center justify-between mb-5"
        style={{
          background: 'linear-gradient(90deg, hsl(var(--info)) 0%, hsl(var(--accent)) 100%)',
          color: 'hsl(var(--primary-foreground))',
        }}
      >
        <div className="flex flex-col">
          <div className="text-sm font-medium">Upgrade for more permissions controls</div>
          <div className="text-xs opacity-85">Get advanced member management features</div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="rounded-md px-3 py-2 text-sm font-medium" variant="default" size="sm">
            Try Premium free for 14 days
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button className="rounded-md px-3 py-2 text-sm font-medium" variant="accent" size="sm" onClick={onGenerateInvite}>
            Invite with link
          </Button>
          <OutlineBtn onClick={onDisableInvite}>Disable invite link</OutlineBtn>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl px-3 bg-neutral-200">
            <Input className="w-56 bg-transparent text-sm outline-none border-none focus-visible:ring-0" placeholder="Filter by name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <GhostIconBtn />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InviteSection;
