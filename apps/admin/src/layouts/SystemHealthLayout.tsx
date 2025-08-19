import React from 'react';
import { Typography, Container } from '@taskflow/ui';

const SystemHealthLayout: React.FC = () => {
  return (
    <Container size="7xl">
      <Typography variant="heading-large" className="text-foreground mb-4">
        System Health
      </Typography>
      <Typography variant="body-medium" className="text-muted-foreground">
        System performance and health monitoring would go here...
      </Typography>
    </Container>
  );
};

export default SystemHealthLayout;
