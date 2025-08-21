import React from 'react';
import { Button, Typography, Card, Flex, Loading } from '@taskflow/ui';
import { useTestWorkspace } from '../hooks/useTestWorkspace';

/**
 * Example component showing how to use the test workspace
 * This demonstrates the complete hierarchy: Workspace -> Spaces -> Boards -> Tasks
 */
export const TestWorkspaceExample: React.FC = () => {
  const {
    workspace,
    spaces,
    boards,
    tasks,
    loading,
    error,
    loadWorkspace,
    loadSpaces,
    loadBoards,
    loadTasks,
    loadCompleteHierarchy,
    clearData,
    TEST_WORKSPACE
  } = useTestWorkspace();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Typography variant="heading-medium" className="mb-4">
          🏢 Test Workspace Example
        </Typography>
        
        <Typography variant="body-medium" className="mb-4">
          Workspace ID: <code className="bg-gray-100 px-2 py-1 rounded">{TEST_WORKSPACE.ID}</code>
        </Typography>
        
        <Typography variant="body-medium" className="mb-4">
          Short ID: <code className="bg-gray-100 px-2 py-1 rounded">{TEST_WORKSPACE.SHORT_ID}</code>
        </Typography>

        <Flex gap="md" className="mb-4">
          <Button onClick={loadWorkspace} disabled={loading}>
            Load Workspace
          </Button>
          <Button onClick={loadSpaces} disabled={loading}>
            Load Spaces
          </Button>
          <Button onClick={loadCompleteHierarchy} disabled={loading}>
            Load Complete Hierarchy
          </Button>
          <Button variant="outline" onClick={clearData} disabled={loading}>
            Clear Data
          </Button>
        </Flex>
      </Card>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <Typography variant="body-medium" className="text-red-600">
            Error: {error}
          </Typography>
        </Card>
      )}

      {loading && (
        <Card className="p-6 text-center">
          <Loading size="lg" className="mx-auto mb-4" />
          <Typography variant="body-medium">Loading...</Typography>
        </Card>
      )}

      {/* Workspace Info */}
      {workspace && (
        <Card className="p-4">
          <Typography variant="heading-small" className="mb-2">
            Workspace Details
          </Typography>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(workspace, null, 2)}
          </pre>
        </Card>
      )}

      {/* Spaces */}
      {spaces.length > 0 && (
        <Card className="p-4">
          <Typography variant="heading-small" className="mb-2">
            Spaces ({spaces.length})
          </Typography>
          <div className="space-y-2">
            {spaces.map((space, index) => (
              <div key={space._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <Typography variant="body-medium">{space.name}</Typography>
                  <Typography variant="body-small" className="text-gray-600">
                    ID: {space._id}
                  </Typography>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => loadBoards(space._id)}
                  disabled={loading}
                >
                  Load Boards
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Boards */}
      {boards.length > 0 && (
        <Card className="p-4">
          <Typography variant="heading-small" className="mb-2">
            Boards ({boards.length})
          </Typography>
          <div className="space-y-2">
            {boards.map((board, index) => (
              <div key={board._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <Typography variant="body-medium">{board.name}</Typography>
                  <Typography variant="body-small" className="text-gray-600">
                    ID: {board._id}
                  </Typography>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => loadTasks(board._id)}
                  disabled={loading}
                >
                  Load Tasks
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <Card className="p-4">
          <Typography variant="heading-small" className="mb-2">
            Tasks ({tasks.length})
          </Typography>
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div key={task._id} className="p-2 bg-gray-50 rounded">
                <Typography variant="body-medium">{task.title}</Typography>
                <Typography variant="body-small" className="text-gray-600">
                  Status: {task.status} | Priority: {task.priority} | ID: {task._id}
                </Typography>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Data State */}
      {!loading && !workspace && !spaces.length && !boards.length && !tasks.length && !error && (
        <Card className="p-6 text-center">
          <Typography variant="body-medium" className="text-gray-500">
            Click "Load Workspace" to start exploring the test workspace hierarchy
          </Typography>
        </Card>
      )}
    </div>
  );
};
