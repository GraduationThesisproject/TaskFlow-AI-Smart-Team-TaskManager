import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Typography,
  Button,
  Input,
  Container,
  Grid,
  Switch,
  Select,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Stack,
  Badge,
  Alert
} from '@taskflow/ui';
import {
  ShieldCheckIcon,
  UserPlusIcon,
  CogIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastActivity?: string;
  permissions?: Record<string, boolean>;
  type: 'regular_user' | 'admin_only';
  createdAt: string;
}

interface AddAdminFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const ROLE_OPTIONS = [
  { value: 'moderator', label: 'Moderator', description: 'Basic admin access with limited permissions' },
  { value: 'admin', label: 'Admin', description: 'Full admin access with most permissions' },
  { value: 'super_admin', label: 'Super Admin', description: 'Complete system access with all permissions' }
];

const PERMISSION_LABELS = {
  manageUsers: 'Manage Users',
  manageWorkspaces: 'Manage Workspaces',
  manageTemplates: 'Manage Templates',
  viewAnalytics: 'View Analytics',
  systemSettings: 'System Settings',
  manageAdmins: 'Manage Admins',
  viewSystemLogs: 'View System Logs',
  manageQuotas: 'Manage Quotas',
  manageAIJobs: 'Manage AI Jobs'
};

export const SecuritySettings: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Add Admin Form State
  const [addFormData, setAddFormData] = useState<AddAdminFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'moderator'
  });

  const [addFormStatus, setAddFormStatus] = useState({
    isLoading: false,
    message: '',
    isError: false
  });

  // Edit Admin Form State
  const [editFormData, setEditFormData] = useState({
    role: '',
    permissions: {} as Record<string, boolean>
  });

  const [editFormStatus, setEditFormStatus] = useState({
    isLoading: false,
    message: '',
    isError: false
  });

  useEffect(() => {
    loadAdminUsers();
    loadAvailableRoles();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getUsers();
      setAdminUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load admin users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const response = await adminService.getAvailableRoles();
      setAvailableRoles(response.availableRoles || []);
      setCurrentUserRole(response.userRole || '');
    } catch (error) {
      console.error('Failed to load available roles:', error);
    }
  };

  const handleAddAdmin = async () => {
    // Validation
    if (!addFormData.username || !addFormData.email || !addFormData.password || !addFormData.confirmPassword) {
      setAddFormStatus({ isLoading: false, message: 'All fields are required', isError: true });
      return;
    }

    if (addFormData.password !== addFormData.confirmPassword) {
      setAddFormStatus({ isLoading: false, message: 'Passwords do not match', isError: true });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addFormData.email)) {
      setAddFormStatus({ isLoading: false, message: 'Please enter a valid email address', isError: true });
      return;
    }

    // Password strength validation
    if (addFormData.password.length < 8) {
      setAddFormStatus({ isLoading: false, message: 'Password must be at least 8 characters long', isError: true });
      return;
    }

    try {
      setAddFormStatus({ isLoading: true, message: '', isError: false });
      
      await adminService.addUserWithEmail({
        username: addFormData.username,
        email: addFormData.email,
        password: addFormData.password,
        role: addFormData.role
      });

      setAddFormStatus({ 
        isLoading: false, 
        message: 'Admin user added successfully!', 
        isError: false 
      });

      // Reset form
      setAddFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'moderator'
      });

      // Reload users
      await loadAdminUsers();

      // Close modal after success
      setTimeout(() => {
        setShowAddModal(false);
        setAddFormStatus({ isLoading: false, message: '', isError: false });
      }, 2000);

    } catch (error) {
      setAddFormStatus({ 
        isLoading: false, 
        message: error instanceof Error ? error.message : 'Failed to add admin user', 
        isError: true 
      });
    }
  };

  const handleEditAdmin = (user: AdminUser) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.role,
      permissions: user.permissions || {}
    });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    if (!selectedUser) return;

    try {
      setEditFormStatus({ isLoading: true, message: '', isError: false });
      
      // Update user role
      await adminService.changeUserRole(selectedUser.id, editFormData.role);
      
      setEditFormStatus({ 
        isLoading: false, 
        message: 'Admin user updated successfully!', 
        isError: false 
      });

      // Reload users
      await loadAdminUsers();

      // Close modal after success
      setTimeout(() => {
        setShowEditModal(false);
        setEditFormStatus({ isLoading: false, message: '', isError: false });
      }, 2000);

    } catch (error) {
      setEditFormStatus({ 
        isLoading: false, 
        message: error instanceof Error ? error.message : 'Failed to update admin user', 
        isError: true 
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this admin user?')) return;

    try {
      await adminService.deactivateUser(userId);
      await loadAdminUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await adminService.activateUser(userId);
      await loadAdminUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageAdmins = currentUserRole === 'super_admin' || currentUserRole === 'admin';
  const canAssignRoles = availableRoles.length > 0;

  return (
    <Container>
      <div className="mb-8">
        <Typography variant="h1" className="flex items-center gap-3 mb-2">
          <ShieldCheckIcon className="w-8 h-8 text-primary" />
          Security Settings
        </Typography>
        <Typography variant="body" className="text-muted-foreground">
          Manage admin users, roles, and system permissions
        </Typography>
      </div>

      {/* Admin Users Management */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Users Management</CardTitle>
            <Typography variant="body-small" className="text-muted-foreground">
              Manage system administrators and their permissions
            </Typography>
          </div>
          {canManageAdmins && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <UserPlusIcon className="w-4 h-4" />
              Add Admin User
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Typography>Loading admin users...</Typography>
            </div>
          ) : (
            <div className="space-y-4">
              {adminUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Typography variant="body-small" className="font-semibold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body" className="font-medium">
                        {user.name}
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        {user.email}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    
                                         <div className="flex items-center gap-2">
                       {user.isActive ? (
                         <Badge variant="success">Active</Badge>
                       ) : (
                         <Badge variant="destructive">Inactive</Badge>
                       )}
                       <Badge variant="outline" className="text-xs">
                         {user.type === 'admin_only' ? 'Admin Only' : 'Regular User'}
                       </Badge>
                     </div>

                    {canManageAdmins && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAdmin(user)}
                          disabled={!canAssignRoles}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        
                        {user.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {adminUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Typography>No admin users found</Typography>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} size="lg">
        <ModalHeader>
          <Typography variant="h3">Add New Admin User</Typography>
        </ModalHeader>
        <ModalBody>
          <Stack spacing={4}>
            {addFormStatus.message && (
              <Alert variant={addFormStatus.isError ? 'destructive' : 'default'}>
                {addFormStatus.message}
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username *
              </label>
              <Input
                value={addFormData.username}
                onChange={(e) => setAddFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                disabled={addFormStatus.isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                disabled={addFormStatus.isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password *
              </label>
              <Input
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password (min 8 characters)"
                disabled={addFormStatus.isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password *
              </label>
              <Input
                type="password"
                value={addFormData.confirmPassword}
                onChange={(e) => setAddFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                disabled={addFormStatus.isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role *
              </label>
              <Select
                value={addFormData.role}
                onValueChange={(value) => setAddFormData(prev => ({ ...prev, role: value }))}
                options={ROLE_OPTIONS}
                disabled={addFormStatus.isLoading}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <Typography variant="body-small" className="text-muted-foreground">
                <strong>Note:</strong> The user will be able to access the admin panel with the specified role and permissions.
              </Typography>
            </div>
          </Stack>
        </ModalBody>
        
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowAddModal(false)}
            disabled={addFormStatus.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddAdmin}
            disabled={addFormStatus.isLoading}
            className="flex items-center gap-2"
          >
            {addFormStatus.isLoading ? 'Adding...' : 'Add Admin User'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
        <ModalHeader>
          <Typography variant="h3">Edit Admin User</Typography>
        </ModalHeader>
        <ModalBody>
          <Stack spacing={4}>
            {editFormStatus.message && (
              <Alert variant={editFormStatus.isError ? 'destructive' : 'default'}>
                {editFormStatus.message}
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}
                options={ROLE_OPTIONS}
                disabled={editFormStatus.isLoading}
              />
            </div>

            {selectedUser && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <Typography variant="body-small" className="text-muted-foreground">
                  <strong>Current User:</strong> {selectedUser.name} ({selectedUser.email})
                </Typography>
              </div>
            )}
          </Stack>
        </ModalBody>
        
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowEditModal(false)}
            disabled={editFormStatus.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAdmin}
            disabled={editFormStatus.isLoading}
          >
            {editFormStatus.isLoading ? 'Updating...' : 'Update Admin User'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default SecuritySettings;
