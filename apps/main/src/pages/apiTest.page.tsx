import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, Flex, Loading, Container, Stack, Badge } from '@taskflow/ui';
import { WorkspaceService, SpaceService, BoardService, TaskService, AuthService } from '../services';
import { TokenHelper } from '../utils/tokenHelper';

interface TestResult {
  service: string;
  success: boolean;
  data?: any;
  error?: string;
}

export const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  // Check token status on mount
  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = async () => {
    const isValid = await TokenHelper.testCurrentToken();
    setTokenStatus(isValid ? 'valid' : 'invalid');
  };

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

  const getValidToken = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      const token = await TokenHelper.getTokenWithFallback();
      if (token) {
        setResults(prev => [...prev, { 
          service: 'Get Valid Token', 
          success: true, 
          data: { message: 'Token obtained successfully', token: token.substring(0, 50) + '...' }
        }]);
        setTokenStatus('valid');
        
        // Update the axios instance with the new token
        const axios = require('axios');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Token updated in axios instance');
      } else {
        setResults(prev => [...prev, { 
          service: 'Get Valid Token', 
          success: false, 
          error: 'Could not obtain valid token with any test credentials' 
        }]);
        setTokenStatus('invalid');
      }
    } catch (error) {
      setResults(prev => [...prev, { 
        service: 'Get Valid Token', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }]);
      setTokenStatus('invalid');
    }
    
    setIsLoading(false);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);

    // First test basic connection
    await runTest('Connection Test', () => AuthService.testConnection());
    
    // Test Workspace Service
    await runTest('Workspace Service - Get All', () => WorkspaceService.getWorkspaces());
    
    // Test Space Service (if we have a workspace)
    try {
      const workspaces = await WorkspaceService.getWorkspaces();
      if (workspaces.data && workspaces.data.length > 0) {
        const workspaceId = workspaces.data[0]._id;
        await runTest('Space Service - Get by Workspace', () => 
          SpaceService.getSpacesByWorkspace(workspaceId)
        );
      }
    } catch (error) {
      setResults(prev => [...prev, { 
        service: 'Space Service - Get by Workspace', 
        success: false, 
        error: 'No workspaces available for testing' 
      }]);
    }

    // Test Board Service (if we have a space)
    try {
      const workspaces = await WorkspaceService.getWorkspaces();
      if (workspaces.data && workspaces.data.length > 0) {
        const workspaceId = workspaces.data[0]._id;
        const spaces = await SpaceService.getSpacesByWorkspace(workspaceId);
        if (spaces.data && spaces.data.length > 0) {
          const spaceId = spaces.data[0]._id;
          await runTest('Board Service - Get by Space', () => 
            BoardService.getBoardsBySpace(spaceId)
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

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getTokenStatusColor = () => {
    switch (tokenStatus) {
      case 'valid': return 'success';
      case 'invalid': return 'error';
      default: return 'default';
    }
  };

  const getTokenStatusText = () => {
    switch (tokenStatus) {
      case 'valid': return '✅ Valid';
      case 'invalid': return '❌ Invalid';
      default: return '❓ Unknown';
    }
  };

  return (
    <Container size="xl" className="py-8">
      <Stack spacing="lg">
        <Typography variant="h1" className="text-center">
          API Service Test Page
        </Typography>
        
        <Card padding="default">
          <Stack spacing="md">
            <Typography variant="body-large">
              This page tests the connection to the backend API using the test token.
            </Typography>
            
            <Card variant="outlined" padding="sm">
              <Stack spacing="sm">
                <Flex align="center" gap="sm">
                  <Typography variant="body-medium">
                    Token Status:
                  </Typography>
                  <Badge variant={getTokenStatusColor()}>
                    {getTokenStatusText()}
                  </Badge>
                </Flex>
                <Typography variant="body-small" className="text-muted-foreground">
                  If the token is invalid, click "Get Valid Token" to authenticate with test credentials.
                </Typography>
              </Stack>
            </Card>
            
            <Flex gap="md" wrap="wrap">
              <Button 
                onClick={getValidToken} 
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                🔑 Get Valid Token
              </Button>
              
              <Button 
                onClick={runAllTests} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? <Loading /> : '🧪'}
                Run All Tests
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearResults}
                disabled={isLoading}
              >
                Clear Results
              </Button>
            </Flex>
          </Stack>
        </Card>

        {results.length > 0 && (
          <Stack spacing="md">
            <Typography variant="h3">
              Test Results ({results.length})
            </Typography>
            
            <Stack spacing="md">
              {results.map((result, index) => (
                <Card key={index} variant={result.success ? "default" : "outlined"} className={result.success ? "" : "border-red-200 bg-red-50"}>
                  <Stack spacing="sm" className="p-4">
                    <Flex justify="between" align="center">
                      <Typography variant="body-medium" className="font-medium">
                        {result.service}
                      </Typography>
                      <Badge variant={result.success ? "success" : "error"}>
                        {result.success ? '✅ Success' : '❌ Failed'}
                      </Badge>
                    </Flex>
                    
                    {result.success && result.data && (
                      <Stack spacing="sm">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Response:
                        </Typography>
                        <Card variant="outlined" padding="sm">
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </Card>
                      </Stack>
                    )}
                    
                    {!result.success && result.error && (
                      <Typography variant="body-small" className="text-destructive">
                        Error: {result.error}
                      </Typography>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {isLoading && (
          <Card padding="default">
            <Stack spacing="md" align="center">
              <Loading className="mx-auto" />
              <Typography variant="body-medium">
                Running tests...
              </Typography>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
};
