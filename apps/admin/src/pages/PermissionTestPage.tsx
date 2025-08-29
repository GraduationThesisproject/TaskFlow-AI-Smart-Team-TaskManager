import React from 'react';
import { PermissionTestSuite } from '../components/common/PermissionTestSuite';
import { Container, Typography } from '@taskflow/ui';

const PermissionTestPage: React.FC = () => {
  return (
    <Container size="7xl">
      <div className="py-8">
        <div className="text-center mb-8">
          <Typography variant="h2" className="mb-4">
            🔒 Permission System Test Page
          </Typography>
          <Typography variant="body-large" className="text-gray-600 max-w-3xl mx-auto">
            This page allows you to thoroughly test the permission system to ensure that users can only access features they have permission for. 
            Run the tests to verify that permission enforcement is working correctly across all roles.
          </Typography>
        </div>
        
        <PermissionTestSuite />
      </div>
    </Container>
  );
};

export default PermissionTestPage;
