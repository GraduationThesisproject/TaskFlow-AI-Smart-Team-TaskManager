import type { Member } from './types';
import type{ PillVariant } from './Pill';

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

export const roleBadgeVariant = (role: Member['role']): PillVariant => {
  switch (role) {
    case 'Admin':
      return 'info';
    case 'Member':
      return 'accent';
    case 'Guest':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const statusBadgeVariant = (status: Member['status']): PillVariant => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Disabled':
      return 'error';
    default:
      return 'secondary';
  }
};
