import React from 'react';
import { Typography, Container } from '@taskflow/ui';

const IntegrationsLayout: React.FC = () => {
  return (
    <Container size="7xl">
      <Typography variant="heading-large" className="text-foreground mb-4">
        Integrations
      </Typography>
      <Typography variant="body-medium" className="text-muted-foreground">
        Third-party integrations and API keys management would go here...
      </Typography>
    </Container>
  );
};

export default IntegrationsLayout;
