import React from 'react';
import Sidebar from "./Sidebar";
import { Button, Input } from '@taskflow/ui';
import Pill from '../../components/workspace/Pill';
import OutlineBtn from '../../components/workspace/OutlineBtn';
import GhostIconBtn from '../../components/workspace/GhostIconBtn';
import Section from '../../components/workspace/Section';
import { MEMBERS, roleBadgeVariant, statusBadgeVariant } from '../../components/workspace/data';

const Main = () => {
  return (
    <div className="flex min-h-screen bg-neutral-0">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Page Title */}
        <header className="p-4 mb-4 border-b-2 border-neutral-100">
        <h1 className="text-3xl font-bold tracking-tight " style={{ color: 'hsl(var(--primary-foreground))' }}>
          workspace member management
        </h1>
        </header>

        {/* Info Banner */}
        <div
          className="mb-4 p-3 ring-1 flex flex-row items-center gap-2 rounded-md shadow-[0_0_10px_hsl(var(--accent))] 
             ring-1 ring-primary/20 
             backdrop-blur bg-neutral-100"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--info)) 0%, hsl(var(--accent)) 100%)',
            color: 'hsl(var(--primary-foreground))',
            ringColor: 'hsl(var(--ring))',
          } as React.CSSProperties}
        >
            <svg className="outline-none [&>path:first-of-type]:hidden" width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 24H0V0H16V24Z" stroke="#E5E7EB"/>
<g clip-path="url(#clip0_213_92)">
<path d="M8.0008 5C8.44455 5 8.85392 5.23437 9.07893 5.61875L15.8289 17.1187C16.0571 17.5062 16.0571 17.9844 15.8352 18.3719C15.6133 18.7594 15.1977 19 14.7508 19H1.2508C0.803925 19 0.3883 18.7594 0.166425 18.3719C-0.0554503 17.9844 -0.0523253 17.5031 0.172675 17.1187L6.92267 5.61875C7.14767 5.23437 7.55705 5 8.0008 5ZM8.0008 9C7.58517 9 7.2508 9.33437 7.2508 9.75V13.25C7.2508 13.6656 7.58517 14 8.0008 14C8.41642 14 8.7508 13.6656 8.7508 13.25V9.75C8.7508 9.33437 8.41642 9 8.0008 9ZM9.0008 16C9.0008 15.7348 8.89544 15.4804 8.70791 15.2929C8.52037 15.1054 8.26602 15 8.0008 15C7.73558 15 7.48123 15.1054 7.29369 15.2929C7.10616 15.4804 7.0008 15.7348 7.0008 16C7.0008 16.2652 7.10616 16.5196 7.29369 16.7071C7.48123 16.8946 7.73558 17 8.0008 17C8.26602 17 8.52037 16.8946 8.70791 16.7071C8.89544 16.5196 9.0008 16.2652 9.0008 16Z" fill="#00EBCB"/>
</g>
<defs>
<clipPath id="clip0_213_92">
<path d="M0 4H16V20H0V4Z" fill="white"/>
</clipPath>
</defs>
</svg>

          <p className="text-md">You are the only owner of this account. We suggest you add another admin…</p>
        </div>

        {/* Search + role filter */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row mb-6">
          <div
            className="flex flex-1 items-center gap-2 rounded-md px-3 py-2 bg-neutral-100"
          >
            <Input
              className="w-full bg-transparent text-sm placeholder:opacity-70 border-none focus-visible:ring-0"
              placeholder="Search user name / email"
            />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <path d="M10.5 10.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <Button
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm"
            variant="outline"
            size="sm"
          >
            All Roles
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Button>
        </div>

        {/* Members Section */}
        <section
          className="mb-5 rounded-xl p-4 ring-1 shadow-[0_0_10px_hsl(var(--accent))] 
             ring-1 ring-primary/20 
             backdrop-blur bg-neutral-100"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'hsl(var(--primary-foreground))' }}>
                Workspace Members ({MEMBERS.length})
              </h3>
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Workspace members can view and join all Workspace visible boards and create new boards in the Workspace.
              </p>
            </div>
            <Button
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              variant="accent"
              size="sm"
            >
              <span>+ Invite Workspace members</span>
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg">
            <table className="w-full table-auto border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-sm " style={{ color: 'hsl(var(--neutral-1000))' }}>
                  <th className="px-3 py-2 border-b border-neutral-100 ">Member</th>
                  <th className="px-3 py-2 border-b border-neutral-100">Email</th>
                  <th className="px-3 py-2 border-b border-neutral-100">Role</th>
                  <th className="px-3 py-2 border-b border-neutral-100">Status</th>
                  <th className="px-3 py-2 border-b border-neutral-100">Last Active</th>
                  <th className="px-3 py-2 border-b border-neutral-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERS.map((m, idx) => (
                  <tr key={m.id} className="rounded-lg">
                    <td className="px-3 py-2 border-b border-neutral-100">
                      <div className="flex items-center gap-3 ">
                        <div className="h-8 w-8 rounded-full bg-[hsl(var(--neutral-100))]" />
                        <div >
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
                      <Pill variant={roleBadgeVariant(m.role)}>▼ {m.role}</Pill>
                    </td>
                    <td className="px-3 py-2 border-b border-neutral-100">
                      <Pill variant={statusBadgeVariant(m.status)}>{m.status}</Pill>
                    </td>
                    <td className="px-3 py-2 text-sm border-b border-neutral-100" style={{ color: 'hsl(var(--primary-foreground))' }}>
                      {m.lastActive}
                    </td>
                    <td className="px-3 py-2 border-b border-neutral-200">
                      <div className="flex items-center gap-2 ">
                        <OutlineBtn>View Boards (0)</OutlineBtn>
                        <Button
                          className="rounded-md px-3 py-1.5 text-sm font-medium bg-red-600"
                          variant="destructive"
                          size="sm"
                        >
                          {idx === 0 ? 'Leave' : 'Remove'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Invite members */}
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
            > <div className="flex flex-col">
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
              <Button className="rounded-md px-3 py-2 text-sm font-medium" variant="accent" size="sm">
                Invite with link
              </Button>
              <OutlineBtn>Disable invite link</OutlineBtn>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl px-3 bg-neutral-200">
                <Input className="w-56 bg-transparent text-sm outline-none border-none focus-visible:ring-0" placeholder="Filter by name" />
                <GhostIconBtn />
              </div>
            </div>
          </div>
        </section>

        {/* Guests */}
        
        <Section title="Guests (0)">No guests in this workspace</Section>

        {/* Join requests */}
        <div className="mt-5">
          <Section title="Join requests (0)">No pending join requests</Section>
        </div>
      </div>
    </div>
  );
};

export default Main;