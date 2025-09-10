import React from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';

const UpgradeHeader: React.FC = () => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold mb-2">Upgrade Workspace</h1>
    <p className="text-muted-foreground">Unlock premium features and advanced capabilities</p>
  </div>
);

const UpgradeContent: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
        <p className="text-3xl font-bold mb-4">$0</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Basic workspace features</li>
          <li>• Up to 5 team members</li>
          <li>• Basic templates</li>
        </ul>
      </div>
      <div className="p-6 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold mb-2">Pro Plan</h3>
        <p className="text-3xl font-bold mb-4">$12</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Advanced workspace features</li>
          <li>• Up to 25 team members</li>
          <li>• Premium templates</li>
          <li>• Priority support</li>
        </ul>
      </div>
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
        <p className="text-3xl font-bold mb-4">Custom</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Unlimited team members</li>
          <li>• Custom integrations</li>
          <li>• Dedicated support</li>
          <li>• Advanced security</li>
        </ul>
      </div>
    </div>
  </div>
);

const UpgradeLayout: React.FC = () => {
  const { workspace, loading, error } = useWorkspace({ autoFetch: false });

  if (loading) return <div>Loading upgrade options...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <UpgradeHeader />
      <UpgradeContent />
    </div>
  );
};

export default UpgradeLayout;