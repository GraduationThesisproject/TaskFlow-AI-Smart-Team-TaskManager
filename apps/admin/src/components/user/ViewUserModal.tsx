import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Typography,
  Badge,
  Avatar,
  Stack,
  Card,
  CardContent,
  Grid
} from '@taskflow/ui';
import { User } from '../../services/adminService';
import { formatDate } from '@taskflow/utils';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  if (!user) return null;

  // Safe date formatting with error handling
  const safeFormatDate = (dateString: string | undefined): string => {
    try {
      if (!dateString || dateString === 'Never' || dateString === 'Unknown') {
        return dateString || 'Unknown';
      }
      if (typeof dateString !== 'string') {
        return 'Invalid Date';
      }
      return formatDate(dateString);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Safe string handling for user properties
  const safeString = (value: any): string => {
    try {
      if (typeof value === 'string') {
        return value.trim() || 'Unknown';
      }
      if (value === null || value === undefined) {
        return 'Unknown';
      }
      const stringValue = String(value);
      return stringValue.trim() || 'Unknown';
    } catch (error) {
      console.warn('String conversion error:', error);
      return 'Unknown';
    }
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (!status) return 'secondary';
    
    try {
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
    } catch (error) {
      console.warn('Status badge variant error:', error);
      return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    try {
      switch (role.toLowerCase()) {
        case 'admin':
          return 'error';
        case 'super_admin':
          return 'warning';
        case 'user':
          return 'secondary';
        default:
          return 'secondary';
      }
    } catch (error) {
      console.warn('Role badge variant error:', error);
      return 'secondary';
    }
  };

    try {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="User Details">
        <ModalHeader>
          <Typography variant="h2">User Details</Typography>
        </ModalHeader>
        
        <ModalBody>
          <Stack spacing={6}>
            {/* User Header */}
            <div className="flex items-center space-x-4">
              <Avatar size="lg" className="bg-primary text-primary-foreground">
                              <span className="text-xl font-medium">
                {(() => {
                  try {
                    const username = safeString(user.username);
                    return username.charAt(0).toUpperCase();
                  } catch (error) {
                    return '?';
                  }
                })()}
              </span>
              </Avatar>
              <div>
                <Typography variant="h3" className="mb-1">
                  {safeString(user.username)}
                </Typography>
                <Typography variant="body-medium" className="text-muted-foreground">
                  {safeString(user.email)}
                </Typography>
              </div>
            </div>

          {/* Status and Role */}
          <div className="flex space-x-4">
            <div>
              <Typography variant="body-small" className="text-muted-foreground mb-1">
                Status
              </Typography>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {safeString(user.status)}
              </Badge>
            </div>
            <div>
              <Typography variant="body-small" className="text-muted-foreground mb-1">
                Role
              </Typography>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {safeString(user.role)}
              </Badge>
            </div>
          </div>

          {/* User Information */}
          <Card>
            <CardContent className="pt-6">
              <Typography variant="h4" className="mb-4">
                Account Information
              </Typography>
              <Grid cols={2} gap="md">
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1">
                    Username
                  </Typography>
                  <Typography variant="body-medium">
                    {safeString(user.username)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1">
                    Email
                  </Typography>
                  <Typography variant="body-medium">
                    {safeString(user.email)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1">
                    Account Status
                  </Typography>
                  <Typography variant="body-medium">
                    {safeString(user.status)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1">
                    System Role
                  </Typography>
                  <Typography variant="body-medium">
                    {safeString(user.role)}
                  </Typography>
                </div>
              </Grid>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardContent className="pt-6">
              <Typography variant="h4" className="mb-4">
                Account Activity
              </Typography>
              <Grid cols={2} gap="md">
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1">
                    Created
                  </Typography>
                  <Typography variant="body-medium">
                    {safeFormatDate(user.createdAt)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground mb-1">
                    Last Login
                  </Typography>
                  <Typography variant="body-medium">
                    {safeFormatDate(user.lastLoginAt)}
                  </Typography>
                </div>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardContent className="pt-6">
              <Typography variant="h4" className="mb-4">
                Additional Information
              </Typography>
              <div>
                <Typography variant="body-small" className="text-muted-foreground mb-1">
                  User ID
                </Typography>
                <Typography variant="body-small" className="font-mono bg-muted p-2 rounded">
                  {safeString(user.id)}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
    );
  } catch (error) {
    console.error('ViewUserModal render error:', error);
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="User Details">
        <ModalHeader>
          <Typography variant="h2">User Details</Typography>
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-8">
            <Typography variant="body-medium" className="text-muted-foreground mb-4">
              Error loading user details
            </Typography>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>
    );
  }
};

export default ViewUserModal;
