import React from 'react';
import { Input, Dropdown, DropdownItem } from '@taskflow/ui';
import { useAppDispatch } from '../../../store';
import type { SearchAndFilterProps } from './types';

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
        className="flex flex-1 items-center gap-2 rounded-md px-3 py-2 bg-background"
      >
        <Input
          className="w-full bg-transparent text-sm placeholder:opacity-70  focus-visible:ring-0"
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
        trigger={
          <button className="flex items-center justify-between w-full min-w-[160px] px-3 py-2 text-sm bg-background border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
            <span>{roleLabel}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        }
        variant="outline"
        size="sm"
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
