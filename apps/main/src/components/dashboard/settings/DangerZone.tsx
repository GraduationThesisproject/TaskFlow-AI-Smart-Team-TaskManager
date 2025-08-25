import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Typography } from '@taskflow/ui';
import { Trash2 } from 'lucide-react';

 const DangerZone: React.FC = () => {
  const onDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: call delete account API and handle sign out/navigation
      console.log('Account deletion requested');
    }
  };

  return (
    <Card className="border-destructive backdrop-blur-sm ring-1 ring-[hsl(var(--destructive))]/20 border border-[hsl(var(--destructive))]/30 shadow-[0_0_16px_hsl(var(--destructive)/0.15)] hover:shadow-[0_0_28px_hsl(var(--destructive)/0.22)] transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Typography variant="body-medium" className="mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </Typography>
        <Button variant="destructive" onClick={onDeleteAccount}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default DangerZone;
