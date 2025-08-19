import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  banUser, 
  activateUser, 
  resetUserPassword,
  setFilters,
  clearFilters,
  setShowAddUserModal,
  setSelectedUser
} from '../../store/slices/userManagementSlice';
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

const UserManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    users, 
    filteredUsers, 
    isLoading, 
    error, 
    filters, 
    showAddUserModal 
  } = useAppSelector(state => state.userManagement);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    role: 'User' as const
  });

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Apply filters locally
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All Statuses' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    dispatch(setFilters({ searchTerm, role: roleFilter, status: statusFilter }));
  }, [users, searchTerm, roleFilter, statusFilter, dispatch]);

  const handleBanUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      if (user.status === 'Suspended') {
        await dispatch(activateUser(userId)).unwrap();
      } else {
        await dispatch(banUser({ userId, reason: 'Admin action' })).unwrap();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return;
    
    try {
      await dispatch(resetUserPassword(resetEmail)).unwrap();
      alert('Password reset email sent successfully!');
      setShowPasswordResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset failed:', error);
      alert('Failed to send password reset email. Please try again.');
    }
  };

  const handleCreateUser = async () => {
    try {
      await dispatch(createUser(newUserData)).unwrap();
      setNewUserData({ username: '', email: '', role: 'User' });
      dispatch(setShowAddUserModal(false));
    } catch (error) {
      console.error('Failed to create user:', error);
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

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body-medium" className="text-muted-foreground">
            Loading users...
          </Typography>
        </div>
      </div>
    );
  }

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
          onClick={() => dispatch(setShowAddUserModal(true))}
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <Typography variant="body-medium" className="text-red-600 dark:text-red-400">
            {error}
          </Typography>
        </div>
      )}

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
            
            <Button 
              variant="outline" 
              size="default" 
              className="flex items-center justify-center"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('All Roles');
                setStatusFilter('All Statuses');
                dispatch(clearFilters());
              }}
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Accounts ({filteredUsers.length})</CardTitle>
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
                          onClick={() => dispatch(setSelectedUser(user))}
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
        onClose={() => dispatch(setShowAddUserModal(false))}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <Input 
              placeholder="Enter username" 
              value={newUserData.username}
              onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input 
              type="email" 
              placeholder="Enter email address" 
              value={newUserData.email}
              onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role
            </label>
            <Select
              value={newUserData.role}
              onChange={(value) => setNewUserData(prev => ({ ...prev, role: value as any }))}
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
              onClick={() => dispatch(setShowAddUserModal(false))}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCreateUser}
              disabled={!newUserData.username || !newUserData.email}
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
