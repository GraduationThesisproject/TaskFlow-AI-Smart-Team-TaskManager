export type Member = {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'Admin' | 'Member' | 'Guest';
  status: 'Active' | 'Pending' | 'Disabled';
  lastActive: string;
};
