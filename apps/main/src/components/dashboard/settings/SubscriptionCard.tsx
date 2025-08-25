import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Typography } from '@taskflow/ui';
import { useNavigate } from 'react-router-dom';

const SubscriptionCard: React.FC = () => {
  const navigate = useNavigate();

  const onUpgrade = () => {
    navigate('/workspace/upgrade');
  };

  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.18)] transition-shadow">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="body-medium" className="font-medium">Current Plan</Typography>
            <Typography variant="caption" className="text-muted-foreground">Free</Typography>
          </div>
          <Button size="sm" variant="outline" onClick={onUpgrade}>Upgrade</Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Enjoy core features. Upgrade to unlock team features and advanced workflows.
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
