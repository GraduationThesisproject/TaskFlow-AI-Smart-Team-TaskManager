import React from 'react';
import { Typography, Container } from '@taskflow/ui';

const NotificationsLayout: React.FC = () => {
  return (
    <Container size="7xl">
      <Typography variant="heading-large" className="text-foreground mb-4">
        Notifications
      </Typography>
      <Typography variant="body-medium" className="text-muted-foreground">
        System announcements and communication management would go here...
      </Typography>
    </Container>
  );
};

export default NotificationsLayout;
