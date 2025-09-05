import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@taskflow/ui';
import { useWorkspaceRules } from '../../hooks/useWorkspaceRules';
import { useToast } from '../../hooks/useToast';

interface RulesTestProps {
  workspaceId: string;
}

const RulesTest: React.FC<RulesTestProps> = ({ workspaceId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { rules, loading, error, loadWorkspaceRules, updateRules, deleteRules } = useWorkspaceRules({
    autoFetch: false,
    workspaceId
  });
  const { success, error: showError } = useToast();

  const handleLoadRules = async () => {
    setIsLoading(true);
    try {
      await loadWorkspaceRules();
      success('Rules loaded successfully!');
    } catch (error) {
      showError('Failed to load rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRules = async () => {
    setIsLoading(true);
    try {
      await updateRules({ 
        content: `# Updated Test Rules

This is a test update to the workspace rules.

## Test Section
- This is a test bullet point
- Another test item

**Bold text** and *italic text* are supported.

\`Code snippets\` are also supported.

*Last updated: ${new Date().toLocaleString()}*`
      });
      success('Rules updated successfully!');
    } catch (error) {
      showError('Failed to update rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRules = async () => {
    setIsLoading(true);
    try {
      await deleteRules();
      success('Rules deleted successfully!');
    } catch (error) {
      showError('Failed to delete rules');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Rules Test Component (Debug)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleLoadRules} 
              variant="outline" 
              size="sm"
              disabled={isLoading || loading}
            >
              {loading ? 'Loading...' : 'Load Rules'}
            </Button>
            
            <Button 
              onClick={handleUpdateRules} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Rules'}
            </Button>
            
            <Button 
              onClick={handleDeleteRules} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Rules'}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}

          {rules && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-800 mb-2">Current Rules:</h4>
              <div className="text-green-700 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                {rules.content}
              </div>
              <div className="mt-2 text-xs text-green-600">
                Version: {rules.version} | Last updated: {new Date(rules.updatedAt).toLocaleString()}
              </div>
            </div>
          )}

          {!rules && !loading && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-gray-600 text-sm">No rules loaded. Click "Load Rules" to fetch them.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RulesTest;
