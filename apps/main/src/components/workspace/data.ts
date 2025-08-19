import type { Member } from './types';

export const MEMBERS: Member[] = [
  {
    id: 'u1',
    name: 'Douzi Hazem',
    handle: 'douzihazem',
    email: 'hz.douzi20@gmail.com',
    role: 'Admin',
    status: 'Active',
    lastActive: 'August 18 2025',
  },
  {
    id: 'u2',
    name: 'Charf',
    handle: 'ch@rfed',
    email: 'charf@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: 'August 2025',
  },
  {
    id: 'u3',
    name: 'Bassem d',
    handle: 'bassem',
    email: 'bassem@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: 'August 2025',
  },
];

export const roleColor = (role: Member['role']) => (role === 'Admin' ? 'var(--info)' : role === 'Member' ? 'var(--accent)' : 'var(--muted)');
export const statusColor = (status: Member['status']) => (status === 'Active' ? 'var(--success)' : status === 'Pending' ? 'var(--warning)' : 'var(--error)');
