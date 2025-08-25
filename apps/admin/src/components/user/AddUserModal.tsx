import React, { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  Select,
  Typography,
  Stack
} from '@taskflow/ui';
import { UserPlusIcon } from '@heroicons/react/24/outline';

export interface AddUserFormData {
  username: string;
  email: string;
  role: string;
}

export interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: AddUserFormData) => Promise<void>;
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' }
];

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<AddUserFormData>({
    username: '',
    email: '',
    role: 'user'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof AddUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
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
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      role: 'user'
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader>
        <div className="flex items-center space-x-3">
          <UserPlusIcon className="h-6 w-6 text-primary" />
          <Typography variant="h3" as="h3" className="text-foreground">
            Add New User
          </Typography>
        </div>
        <Typography variant="body-medium" className="text-muted-foreground mt-1">
          Create a new user account with the specified role
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

          {/* Info Note */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <Typography variant="body-small" className="text-muted-foreground">
              <strong>Note:</strong> A temporary password will be generated and the user will need to change it on their first login.
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
              <span>Creating...</span>
            </div>
          ) : (
            <>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Create User
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddUserModal;
