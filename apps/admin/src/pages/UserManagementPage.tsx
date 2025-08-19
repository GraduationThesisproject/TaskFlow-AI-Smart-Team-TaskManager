import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Typography, 
  Badge, 
  Button, 
  Input, 
  Select,
  Avatar,
  Modal
} from '@taskflow/ui';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'User';
  status: 'Active' | 'Suspended' | 'Inactive';
  lastLoginAt: string;
  createdAt: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    username: 'john.doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    status: 'Active',
    lastLoginAt: '2 hours ago',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    username: 'jane.smith',
    email: 'jane.smith@company.com',
    role: 'Manager',
    status: 'Active',
    lastLoginAt: '1 day ago',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    username: 'mike.wilson',
    email: 'mike.wilson@company.com',
    role: 'User',
    status: 'Suspended',
    lastLoginAt: '1 week ago',
    createdAt: '2024-01-05'
  },
  {
    id: '4',
    username: 'sarah.jones',
    email: 'sarah.jones@company.com',
    role: 'User',
    status: 'Active',
    lastLoginAt: '3 hours ago',
    createdAt: '2024-01-20'
  }
];

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetEmail, setResetEmail] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All Statuses' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBanUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Suspended' ? 'Active' : 'Suspended' }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return;
    
    try {
      // TODO: Implement actual password reset logic
      console.log('Password reset requested for:', resetEmail);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Password reset email sent successfully!');
      setShowPasswordResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset failed:', error);
      alert('Failed to send password reset email. Please try again.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success' as const;
      case 'Suspended':
        return 'error' as const;
      case 'Inactive':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'error' as const;
      case 'Manager':
        return 'warning' as const;
      case 'User':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="heading-xl" className="text-foreground mb-2">
            User & Role Management
          </Typography>
          <Typography variant="body-large" className="text-muted-foreground">
            Manage user accounts, roles, and permissions across the system
          </Typography>
        </div>
        <Button 
          variant="default" 
          size="default"
          onClick={() => setShowAddUserModal(true)}
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              options={[
                { value: 'All Roles', label: 'All Roles' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Manager', label: 'Manager' },
                { value: 'User', label: 'User' }
              ]}
            />
            
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'All Statuses', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Suspended', label: 'Suspended' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
            />
            
            <Button variant="outline" size="default" className="flex items-center justify-center">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Username</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last Login</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar size="sm" className="bg-primary text-primary-foreground">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                          ) : (
                            <span className="text-sm font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </Avatar>
                        <Typography variant="body-medium" className="text-foreground">
                          {user.username}
                        </Typography>
                      </div>
                    </td>
                    <td className="p-3">
                      <Typography variant="body-medium" className="text-foreground">
                        {user.email}
                      </Typography>
                    </td>
                    <td className="p-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Typography variant="body-medium" className="text-muted-foreground">
                        {user.lastLoginAt}
                      </Typography>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            // TODO: Implement edit user modal
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBanUser(user.id)}
                          className={user.status === 'Suspended' ? 'text-green-600' : 'text-red-600'}
                        >
                          {user.status === 'Suspended' ? 'Activate' : 'Ban'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Password Reset Section */}
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter user email
              </label>
              <Input
                type="email"
                placeholder="user@company.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <Button
              variant="default"
              size="default"
              onClick={handlePasswordReset}
              disabled={!resetEmail}
            >
              <KeyIcon className="w-5 h-5 mr-2" />
              Send Reset
            </Button>
          </div>
          <Typography variant="body-small" className="text-muted-foreground mt-2">
            This will send a password reset email to the specified user address.
          </Typography>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <Input placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input type="email" placeholder="Enter email address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role
            </label>
            <Select
              options={[
                { value: 'User', label: 'User' },
                { value: 'Manager', label: 'Manager' },
                { value: 'Admin', label: 'Admin' }
              ]}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddUserModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                // TODO: Implement add user logic
                setShowAddUserModal(false);
              }}
            >
              Add User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
