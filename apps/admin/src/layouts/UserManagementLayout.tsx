import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Typography,
  Badge,
  Button,
  Input,
  Select,
  Avatar,
  Container,
  Grid
} from '@taskflow/ui';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { adminService, User } from '../services/adminService';

const UserManagementLayout: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Confirmation dialog states
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info',
    onConfirm: () => {},
    confirmText: 'Confirm'
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setUsers(response.users);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // User management functions
  const handleCreateUser = async (userData: AddUserFormData) => {
    try {
      await adminService.createUser(userData);
      await fetchUsers(); // Refresh the user list
      setShowCreateUserModal(false);
    } catch (err) {
      console.error('Failed to create user:', err);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const handleUpdateUser = async (userId: string, userData: EditUserFormData) => {
    try {
      // Update user data
      await adminService.updateUser(userId, {
        name: userData.username,
        email: userData.email,
        isActive: userData.isActive
      });

      // Update role if changed
      if (userData.role !== selectedUser?.role) {
        await adminService.updateUserRole(userId, userData.role);
      }

      await fetchUsers(); // Refresh the user list
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    // Open view modal or navigate to user details
    console.log('View user:', user);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const showConfirmation = (
    title: string, 
    description: string, 
    type: 'danger' | 'warning' | 'info' | 'success',
    onConfirm: () => void,
    confirmText?: string
  ) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      description,
      type,
      onConfirm,
      confirmText
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    showConfirmation(
      'Delete User',
      `Are you sure you want to delete ${user?.username}? This action cannot be undone and will permanently remove the user account.`,
      'danger',
      async () => {
        try {
          await adminService.deleteUser(userId);
          setUsers(users.filter(user => user.id !== userId));
          setPagination(prev => ({ ...prev, total: prev.total - 1 }));
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          alert('Failed to delete user: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      },
      'Delete User'
    );
  };

  const handleBanUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    showConfirmation(
      'Deactivate User',
      `Are you sure you want to deactivate ${user?.username}? The user will not be able to access the platform until reactivated.`,
      'warning',
      async () => {
        try {
          await adminService.banUser(userId);
          setUsers(users.map(user => 
            user.id === userId ? { ...user, status: 'Inactive' } : user
          ));
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          alert('Failed to deactivate user: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      },
      'Deactivate User'
    );
  };

  const handleActivateUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    showConfirmation(
      'Activate User',
      `Are you sure you want to activate ${user?.username}? The user will be able to access the platform again.`,
      'info',
      async () => {
        try {
          await adminService.activateUser(userId);
          setUsers(users.map(user => 
            user.id === userId ? { ...user, status: 'Active' } : user
          ));
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          alert('Failed to activate user: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },
      'Activate User'
    );
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'banned':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      case 'user':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <Container size="7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  if (error && users.length === 0) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <Typography variant="h3" className="text-red-600 mb-2">
            Error Loading Users
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-4">
            {error}
          </Typography>
          <Button 
            variant="outline" 
            onClick={fetchUsers}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <Typography variant="heading-large" className="text-foreground mb-2">
          User Management
        </Typography>
        <Typography variant="body-medium" className="text-muted-foreground">
          Manage user accounts, roles, and permissions across the platform
        </Typography>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'moderator', label: 'Moderator' },
                { value: 'user', label: 'User' }
              ]}
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
            />
            <Button onClick={() => setShowCreateUserModal(true)}>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="body-medium" className="text-muted-foreground">
                No users found matching your criteria
              </Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Last Login</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar size="sm" className="bg-primary text-primary-foreground">
                            <span className="text-sm font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </Avatar>
                          <div>
                            <Typography variant="body-medium" className="font-medium">
                              {user.username}
                            </Typography>
                            <Typography variant="body-small" className="text-muted-foreground">
                              {user.email}
                            </Typography>
                          </div>
                        </div>
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
                        <Typography variant="body-small" className="text-muted-foreground">
                          {user.lastLoginAt}
                        </Typography>
                      </td>
                      <td className="p-3">
                        <Typography variant="body-small" className="text-muted-foreground">
                          {user.createdAt}
                        </Typography>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            title="View user details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Edit user"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {user.status === 'Inactive' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivateUser(user.id)}
                              title="Activate user"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBanUser(user.id)}
                              title="Deactivate user"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete user"
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        type={confirmationDialog.type}
        confirmText={confirmationDialog.confirmText}
        confirmButtonVariant={confirmationDialog.type === 'danger' ? 'destructive' : 'default'}
      />
    </Container>
  );
};

export default UserManagementLayout;
