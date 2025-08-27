import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  Select,
  Typography,
  Stack,
  Switch
} from '@taskflow/ui';
import { PencilIcon } from '@heroicons/react/24/outline';
import { User } from '../../services/adminService';

export interface EditUserFormData {
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, userData: EditUserFormData) => Promise<void>;
  user: User | null;
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' }
];

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user
}) => {
  const [formData, setFormData] = useState<EditUserFormData>({
    username: '',
    email: '',
    role: 'moderator',
    isActive: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'moderator',
        isActive: user.status === 'Active'
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof EditUserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    } else if (formData.username.trim().length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    
    setIsLoading(true);
    try {
      await onSubmit(user.id, formData);
      handleClose();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader>
        <div className="flex items-center space-x-3">
          <PencilIcon className="h-6 w-6 text-primary" />
          <Typography variant="h3" as="h3" className="text-foreground">
            Edit User
          </Typography>
        </div>
        <Typography variant="body-medium" className="text-muted-foreground mt-1">
          Update user information and permissions
        </Typography>
      </ModalHeader>
      
      <ModalBody>
        <Stack spacing="lg">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Username *
            </label>
            <Input
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
              className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && (
              <Typography variant="caption" className="text-destructive mt-1">
                {errors.username}
              </Typography>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              disabled={isLoading}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <Typography variant="caption" className="text-destructive mt-1">
                {errors.email}
              </Typography>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role *
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              options={ROLE_OPTIONS}
              disabled={isLoading}
              className={errors.role ? "border-destructive" : ""}
            />
            {errors.role && (
              <Typography variant="caption" className="text-destructive mt-1">
                {errors.role}
              </Typography>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Account Status
            </label>
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                disabled={isLoading}
              />
              <Typography variant="body-medium">
                {formData.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </div>
            <Typography variant="caption" className="text-muted-foreground mt-1">
              {formData.isActive 
                ? 'User can access the platform' 
                : 'User account is deactivated and cannot access the platform'
              }
            </Typography>
          </div>

          {/* User Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <Typography variant="body-small" className="text-muted-foreground">
              <strong>User ID:</strong> {user.id}<br />
              <strong>Created:</strong> {user.createdAt}<br />
              <strong>Last Login:</strong> {user.lastLoginAt || 'Never'}
            </Typography>
          </div>
        </Stack>
      </ModalBody>
      
      <ModalFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Updating...</span>
            </div>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Update User
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditUserModal;
