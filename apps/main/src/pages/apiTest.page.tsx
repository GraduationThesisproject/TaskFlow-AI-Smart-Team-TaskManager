import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, Flex, Loading } from '@taskflow/ui';
import { WorkspaceService, SpaceService, BoardService, TaskService } from '../services';
import { getTestWorkspaceId } from '../config/env';

interface TestResult {
  service: string;
  success: boolean;
  data?: any;
  error?: string;
}

export const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async (serviceName: string, testFunction: () => Promise<any>) => {
    try {
      const data = await testFunction();
      setResults(prev => [...prev, { service: serviceName, success: true, data }]);
    } catch (error) {
      setResults(prev => [...prev, { 
        service: serviceName, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }]);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);

  const runTestWorkspaceTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    const testWorkspaceId = getTestWorkspaceId();
    
    // Test the specific test workspace hierarchy
    await runTest('Test Workspace - Get Details', () => 
      WorkspaceService.getWorkspace(testWorkspaceId)
    );
    
    await runTest('Test Workspace - Get Spaces', () => 
      SpaceService.getSpacesByWorkspace(testWorkspaceId)
    );
    
    // Get spaces and test boards
    try {
      const spaces = await SpaceService.getSpacesByWorkspace(testWorkspaceId);
      if (spaces.data && spaces.data.length > 0) {
        const spaceId = spaces.data[0]._id;
        await runTest('Test Space - Get Boards', () => 
          BoardService.getBoardsBySpace(spaceId)
        );
        
        // Get boards and test tasks
        const boards = await BoardService.getBoardsBySpace(spaceId);
        if (boards.data && boards.data.length > 0) {
          const boardId = boards.data[0]._id;
          await runTest('Test Board - Get Tasks', () => 
            TaskService.getTasks({ boardId })
          );
        }
      }
    } catch (error) {
      setResults(prev => [...prev, { 
        service: 'Test Workspace Hierarchy', 
        success: false, 
        error: 'Failed to test workspace hierarchy' 
      }]);
    }
    
    setIsLoading(false);
  };

    // Test Workspace Service
    await runTest('Workspace Service - Get All', () => WorkspaceService.getWorkspaces());
    
    // Test Space Service using test workspace ID
    const testWorkspaceId = getTestWorkspaceId();
    await runTest('Space Service - Get by Test Workspace', () => 
      SpaceService.getSpacesByWorkspace(testWorkspaceId)
    );

    // Test Board Service using test workspace
    try {
      const spaces = await SpaceService.getSpacesByWorkspace(testWorkspaceId);
      if (spaces.data && spaces.data.length > 0) {
        const spaceId = spaces.data[0]._id;
        await runTest('Board Service - Get by Space', () => 
          BoardService.getBoardsBySpace(spaceId)
        );
        
        // Test Task Service with the first board
        const boards = await BoardService.getBoardsBySpace(spaceId);
        if (boards.data && boards.data.length > 0) {
          const boardId = boards.data[0]._id;
          await runTest('Task Service - Get by Board', () => 
            TaskService.getTasks({ boardId })
          );
        }
      }
    } catch (error) {
      setResults(prev => [...prev, { 
        service: 'Board Service - Get by Space', 
        success: false, 
        error: 'No spaces available for testing' 
      }]);
    }

    // Test Task Service
    await runTest('Task Service - Get All', () => TaskService.getTasks());
    await runTest('Task Service - Get Overdue', () => TaskService.getOverdueTasks());
    await runTest('Task Service - Get Recommendations', () => TaskService.getTaskRecommendations());
    
    // Test specific workspace hierarchy
    await runTest('Test Workspace - Get Details', () => 
      WorkspaceService.getWorkspace(testWorkspaceId)
    );

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Typography variant="heading-large" className="mb-8 text-center">
          API Service Test Page
        </Typography>
        
        <Card className="mb-6 p-6">
          <Typography variant="body-large" className="mb-4">
            This page tests the connection to the backend API using the test token.
          </Typography>
          
          <Typography variant="body-medium" className="mb-4 text-blue-600">
            🏢 Test Workspace ID: {getTestWorkspaceId()} (Last 8 chars: {getTestWorkspaceId().slice(-8)})
          </Typography>
          
          <Flex gap="md" className="mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loading size="sm" /> : '🧪'}
              Run All Tests
            </Button>
            
            <Button 
              onClick={runTestWorkspaceTests} 
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loading size="sm" /> : '🏢'}
              Test Workspace {getTestWorkspaceId().slice(-8)}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearResults}
              disabled={isLoading}
            >
              Clear Results
            </Button>
          </Flex>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <Typography variant="heading-medium" className="mb-4">
              Test Results ({results.length})
            </Typography>
            
            {results.map((result, index) => (
              <Card key={index} className={`p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <Flex justify="between" align="center" className="mb-2">
                  <Typography variant="body-medium" className="font-medium">
                    {result.service}
                  </Typography>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </Flex>
                
                {result.success && result.data && (
                  <div className="mt-2">
                    <Typography variant="body-small" className="text-muted-foreground mb-1">
                      Response:
                    </Typography>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {!result.success && result.error && (
                  <div className="mt-2">
                    <Typography variant="body-small" className="text-red-600">
                      Error: {result.error}
                    </Typography>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {isLoading && (
          <Card className="p-6 text-center">
            <Loading size="lg" className="mx-auto mb-4" />
            <Typography variant="body-medium">
              Running tests...
            </Typography>
          </Card>
        )}
      </div>
    </div>
  );
};
