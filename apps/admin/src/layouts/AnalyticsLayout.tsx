import React from 'react';
import { Typography, Container } from '@taskflow/ui';

const AnalyticsLayout: React.FC = () => {
  return (
    <Container size="7xl">
      <Typography variant="heading-large" className="text-foreground mb-4">
        Analytics
      </Typography>
      <Typography variant="body-medium" className="text-muted-foreground">
        Analytics dashboard content would go here...
      </Typography>
    </Container>
  );
};

export default AnalyticsLayout;
