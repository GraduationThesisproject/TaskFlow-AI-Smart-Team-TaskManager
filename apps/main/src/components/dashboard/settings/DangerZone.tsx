import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Typography, Badge, Separator } from '@taskflow/ui';
import { Trash2, AlertTriangle, Shield, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';

const DangerZone: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { warning, success, error } = useToast();
  const { deleteAccount } = useAuth();

  const onDeleteAccount = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      success('Account successfully deleted. You will be redirected to the landing page.');
      setShowConfirm(false);
    } catch (err: any) {
      error(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-red-500/5 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-destructive/10 to-red-500/10 border-b border-destructive/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-destructive">Danger Zone</CardTitle>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Irreversible actions that affect your account
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Warning Section */}
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <Typography variant="body-medium" className="font-medium text-destructive">
                Account Deletion Warning
              </Typography>
              <Typography variant="body-small" className="text-muted-foreground">
                Deleting your account will permanently remove all your data, including:
              </Typography>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>All your workspaces and projects</li>
                <li>Task history and progress</li>
                <li>Team collaborations and memberships</li>
                <li>Personal settings and preferences</li>
                <li>Account activity and analytics</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-destructive/20" />

        {/* Data Export Option */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <Typography variant="body-medium" className="font-medium">Export Your Data</Typography>
              <Typography variant="body-small" className="text-muted-foreground">
                Download a copy of your data before deletion
              </Typography>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <Lock className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <Typography variant="body-medium" className="font-medium">Delete Account</Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  Permanently remove your account and all associated data
                </Typography>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs">
              Irreversible
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="destructive" 
              onClick={onDeleteAccount}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
            <Typography variant="body-small" className="text-muted-foreground">
              This action cannot be undone
            </Typography>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl max-w-md mx-4 border border-destructive/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <Typography variant="h3" className="font-semibold text-destructive">
                  Confirm Deletion
                </Typography>
              </div>
              
              <Typography variant="body" className="mb-6 text-muted-foreground">
                Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
              </Typography>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={cancelDelete} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete} className="flex-1 gap-2" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DangerZone;
