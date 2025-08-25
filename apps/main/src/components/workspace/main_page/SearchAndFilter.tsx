import React from 'react';
import { Input, Dropdown, DropdownItem } from '@taskflow/ui';
import { useAppDispatch } from '../../../store';

interface SearchAndFilterProps {
  search: string;
  setSearch: (value: string) => void;
  role: 'all' | 'owner' | 'admin' | 'member';
  setRole: (role: 'all' | 'owner' | 'admin' | 'member') => void;
  workspaceId: string | null;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  search,
  setSearch,
  role,
  setRole,
  workspaceId
}) => {
  const dispatch = useAppDispatch();
  const roleLabel = role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row mb-6">
      <div
        className="flex flex-1 items-center gap-2 rounded-md px-3 py-2 bg-neutral-100"
      >
        <Input
          className="w-full bg-transparent text-sm placeholder:opacity-70 border-none focus-visible:ring-0"
          placeholder="Search user name / email"
          value={search}
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            // When clearing the search, reset to full members from API
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const q = search.trim();
              if (q.length === 0) return;
              if (!workspaceId) {
                console.warn('[API members search] Skipped: invalid workspace id. Provide ?id=<ObjectId> in URL.');
                return;
              }
            }
          }}
        />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <path d="M10.5 10.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <Dropdown
        trigger={<span className="flex items-center justify-between gap-3">{roleLabel}</span>}
        variant="outline"
        size="sm"
        className="rounded-lg px-3 py-2 text-sm"
        contentClassName="min-w-[160px]"
      >
        <DropdownItem onClick={() => setRole('all')}>All Roles</DropdownItem>
        <DropdownItem onClick={() => setRole('owner')}>Owner</DropdownItem>
        <DropdownItem onClick={() => setRole('admin')}>Admin</DropdownItem>
        <DropdownItem onClick={() => setRole('member')}>Member</DropdownItem>
      </Dropdown>
    </div>
  );
};

export default SearchAndFilter;
