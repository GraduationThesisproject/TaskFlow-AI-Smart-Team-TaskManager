import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Avatar, AvatarImage, AvatarFallback, Typography } from '@taskflow/ui';
import { useAppSelector } from '../../../store';

const AccountSummary: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.18)] transition-shadow">
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <Avatar size="sm">
            {user?.user?.avatar && (
              <AvatarImage src={user.user.avatar} alt={user.user.name || 'User'} />
            )}
            <AvatarFallback variant="primary">
              {user?.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Typography variant="body-medium" className="font-medium">{user?.user?.name || 'User'}</Typography>
            <Typography variant="caption" className="text-muted-foreground">{user?.user?.email}</Typography>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span>{user?.user?.createdAt ? new Date(user.user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last login</span>
            <span>{user?.user?.lastLogin ? new Date(user.user.lastLogin).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
