import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, AvatarWithFallback, Typography, Badge } from '@taskflow/ui';
import { User, Calendar, Clock, Mail, Shield } from 'lucide-react';
import { useAppSelector } from '../../../store';

const AccountSummary: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);

  const getMemberSince = () => {
    if (!user?.user?.createdAt) return 'N/A';
    const date = new Date(user.user.createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getLastLogin = () => {
    if (!user?.user?.lastLogin) return 'N/A';
    const date = new Date(user.user.lastLogin);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAccountStatus = () => {
    if (!user?.user?.lastLogin) return { status: 'inactive', label: 'Inactive', color: 'bg-gray-500' };
    
    const lastLogin = new Date(user.user.lastLogin);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 1) return { status: 'active', label: 'Active', color: 'bg-emerald-500' };
    if (diffInDays <= 7) return { status: 'recent', label: 'Recent', color: 'bg-blue-500' };
    if (diffInDays <= 30) return { status: 'moderate', label: 'Moderate', color: 'bg-amber-500' };
    return { status: 'inactive', label: 'Inactive', color: 'bg-gray-500' };
  };

  const accountStatus = getAccountStatus();

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Account Overview</CardTitle>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Your account information and activity
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <AvatarWithFallback 
            size="lg" 
            className="ring-4 ring-background shadow-lg"
            src={user?.user?.avatar}
            alt={user?.user?.name || 'User'}
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Typography variant="body-large" className="font-semibold">
                {user?.user?.name || 'User'}
              </Typography>
              <div className={`w-2 h-2 rounded-full ${accountStatus.color}`} />
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <Typography variant="body-small" className="text-muted-foreground">
                {user?.user?.email}
              </Typography>
            </div>
            <Badge variant="outline" className="text-xs">
              {accountStatus.label}
            </Badge>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <Typography variant="body-small" className="text-muted-foreground">Member since</Typography>
              <Typography variant="body-medium" className="font-medium">{getMemberSince()}</Typography>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <Typography variant="body-small" className="text-muted-foreground">Last login</Typography>
              <Typography variant="body-medium" className="font-medium">{getLastLogin()}</Typography>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <Typography variant="body-small" className="text-muted-foreground">Account status</Typography>
              <Typography variant="body-medium" className="font-medium">{accountStatus.label}</Typography>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-border/50">
          <Typography variant="body-small" className="text-muted-foreground mb-3">
            Quick Actions
          </Typography>
          <div className="space-y-2">
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Typography variant="body-small" className="font-medium">View Activity Log</Typography>
            </div>
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Typography variant="body-small" className="font-medium">Download Data</Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
