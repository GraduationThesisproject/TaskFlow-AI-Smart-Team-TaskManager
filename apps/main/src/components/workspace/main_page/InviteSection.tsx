import React from 'react';
import { Button} from '@taskflow/ui';
import OutlineBtn from './OutlineBtn';
import type { InviteSectionProps } from '../../../../types/interfaces/ui';

const InviteSection: React.FC<InviteSectionProps> = ({
  onGenerateInvite,
  onDisableInvite
}) => {
  return (
    <section className="mb-5 rounded-xl p-4 shadow-[0_0_10px_hsl(var(--accent))] 
         ring-1 ring-primary/20 
         backdrop-blur bg-background">
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
      </div>
    </section>
  );
};

export default InviteSection;
