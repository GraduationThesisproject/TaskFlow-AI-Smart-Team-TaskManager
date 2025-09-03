import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, View, Card, TextInput } from '@/components/Themed';
import { TouchableOpacity } from 'react-native';
import { useTheme, useThemeColors, useThemeColor } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { ThemeUtils } from '@/utils/themeUtils';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchMockData, fetchUserProfile, fetchWorkspaces, fetchTasks, clearData } from '@/store/slices/testSlice';
import { useSocket } from '@/hooks/socket/useSocket';
import { testSocketConnection, checkBackendHealth, getConnectionTips } from '@/utils/socketTest';
import { env } from '@/config/env';

export default function TabOneScreen() {
  const { theme, toggleTheme, setUserPrimaryColor } = useTheme();
  const colors = useThemeColors();
  const screenWidth = Dimensions.get('window').width;
  const dispatch = useAppDispatch();
  
  // Redux state
  const { data, isLoading, error, lastFetched } = useAppSelector(state => state.test);
  const { isLoading: appLoading } = useAppSelector(state => state.app);

  // Socket test state
  const [socketTestResult, setSocketTestResult] = useState<any>(null);
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);
  const [socketMessages, setSocketMessages] = useState<string[]>([]);
  const [isSocketTesting, setIsSocketTesting] = useState(false);

  // Socket connections for testing
  const testSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/test',
  });

  const notificationSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/notifications',
  });

  const chatSocket = useSocket({
    url: env.SOCKET_URL,
    autoConnect: false,
    namespace: '/chat',
  });

  // Test different color tokens
  const primaryColor = useThemeColor('primary');
  const accentColor = useThemeColor('accent');
  const successColor = useThemeColor('success');
  const warningColor = useThemeColor('warning');
  const errorColor = useThemeColor('error');

  // Test responsive font size
  const responsiveFontSize = ThemeUtils.getResponsiveFontSize('lg', screenWidth);

  // Test color palette creation
  const colorPalette = ThemeUtils.createColorPalette(primaryColor);

  // Test gradient creation
  const gradient = ThemeUtils.createGradient(primaryColor, accentColor, 5);

  // Test API calls
  const handleFetchMockData = () => {
    dispatch(fetchMockData());
  };

  const handleFetchUserProfile = () => {
    dispatch(fetchUserProfile());
  };

  const handleFetchWorkspaces = () => {
    dispatch(fetchWorkspaces());
  };

  const handleFetchTasks = () => {
    dispatch(fetchTasks());
  };

  const handleClearData = () => {
    dispatch(clearData());
  };

  // Socket test functions
  const handleTestSocketConnection = async () => {
    setIsSocketTesting(true);
    setSocketTestResult(null);
    
    try {
      const result = await testSocketConnection();
      setSocketTestResult(result);
      addSocketMessage(`Socket test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.error || 'Connected'}`);
    } catch (error) {
      setSocketTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      addSocketMessage(`Socket test: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSocketTesting(false);
    }
  };

  const handleCheckBackendHealth = async () => {
    try {
      const isHealthy = await checkBackendHealth();
      setBackendHealth(isHealthy);
      addSocketMessage(`Backend health check: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    } catch (error) {
      setBackendHealth(false);
      addSocketMessage(`Backend health check: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleConnectTestSocket = () => {
    addSocketMessage('Connecting to test socket...');
    testSocket.connect();
  };

  const handleDisconnectTestSocket = () => {
    addSocketMessage('Disconnecting test socket...');
    testSocket.disconnect();
  };

  const handleConnectNotificationSocket = () => {
    addSocketMessage('Connecting to notification socket...');
    notificationSocket.connect();
  };

  const handleConnectChatSocket = () => {
    addSocketMessage('Connecting to chat socket...');
    chatSocket.connect();
  };

  const handleSendTestMessage = () => {
    if (testSocket.isConnected) {
      testSocket.emit('test:message', {
        message: 'Hello from mobile app!',
        timestamp: new Date().toISOString(),
        platform: 'mobile'
      });
      addSocketMessage('Sent test message to server');
    } else {
      addSocketMessage('Cannot send message - socket not connected');
    }
  };

  const handleClearSocketMessages = () => {
    setSocketMessages([]);
  };

  const addSocketMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSocketMessages(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]); // Keep last 10 messages
  };

  // Socket event listeners
  useEffect(() => {
    const testSocketInstance = testSocket.socket;
    if (testSocketInstance) {
      testSocketInstance.on('connect', () => {
        addSocketMessage('Test socket connected');
      });

      testSocketInstance.on('disconnect', (reason) => {
        addSocketMessage(`Test socket disconnected: ${reason}`);
      });

      testSocketInstance.on('test:response', (data) => {
        addSocketMessage(`Received test response: ${JSON.stringify(data)}`);
      });

      testSocketInstance.on('error', (error) => {
        addSocketMessage(`Test socket error: ${error.message || error}`);
      });

      return () => {
        testSocketInstance.off('connect');
        testSocketInstance.off('disconnect');
        testSocketInstance.off('test:response');
        testSocketInstance.off('error');
      };
    }
  }, [testSocket.socket]);

  useEffect(() => {
    const notificationSocketInstance = notificationSocket.socket;
    if (notificationSocketInstance) {
      notificationSocketInstance.on('connect', () => {
        addSocketMessage('Notification socket connected');
      });

      notificationSocketInstance.on('disconnect', (reason) => {
        addSocketMessage(`Notification socket disconnected: ${reason}`);
      });

      notificationSocketInstance.on('notification:new', (data) => {
        addSocketMessage(`New notification: ${data.title || 'Unknown'}`);
      });

      return () => {
        notificationSocketInstance.off('connect');
        notificationSocketInstance.off('disconnect');
        notificationSocketInstance.off('notification:new');
      };
    }
  }, [notificationSocket.socket]);

  useEffect(() => {
    const chatSocketInstance = chatSocket.socket;
    if (chatSocketInstance) {
      chatSocketInstance.on('connect', () => {
        addSocketMessage('Chat socket connected');
      });

      chatSocketInstance.on('disconnect', (reason) => {
        addSocketMessage(`Chat socket disconnected: ${reason}`);
      });

      chatSocketInstance.on('message:new', (data) => {
        addSocketMessage(`New chat message: ${data.content || 'Unknown'}`);
      });

      return () => {
        chatSocketInstance.off('connect');
        chatSocketInstance.off('disconnect');
        chatSocketInstance.off('message:new');
      };
    }
  }, [chatSocket.socket]);

  return (
    <ScrollView style={styles.container}>
      {/* Socket Connection Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
          Socket Connection Test
        </Text>
        
        {/* Socket Status */}
        <View style={styles.statusRow}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Test Socket: {testSocket.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Notifications: {notificationSocket.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Chat: {chatSocket.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
        </View>

        {testSocket.error && (
          <Text style={[TextStyles.body.small, { color: colors.error }]}>
            Test Socket Error: {testSocket.error}
          </Text>
        )}

        {notificationSocket.error && (
          <Text style={[TextStyles.body.small, { color: colors.error }]}>
            Notification Socket Error: {notificationSocket.error}
          </Text>
        )}

        {chatSocket.error && (
          <Text style={[TextStyles.body.small, { color: colors.error }]}>
            Chat Socket Error: {chatSocket.error}
          </Text>
        )}
      </Card>

      {/* Socket Test Buttons */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Socket Test Controls
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            onPress={handleTestSocketConnection}
            style={[styles.button, { backgroundColor: colors.primary }]}
            disabled={isSocketTesting}
          >
            <Text style={{ color: colors['primary-foreground'] }}>
              {isSocketTesting ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleCheckBackendHealth}
            style={[styles.button, { backgroundColor: colors.accent }]}
          >
            <Text style={{ color: colors['accent-foreground'] }}>
              Check Backend
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            onPress={handleConnectTestSocket}
            style={[styles.button, { backgroundColor: colors.secondary }]}
            disabled={testSocket.isConnected}
          >
            <Text style={{ color: colors['secondary-foreground'] }}>
              Connect Test
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleDisconnectTestSocket}
            style={[styles.button, { backgroundColor: colors.destructive }]}
            disabled={!testSocket.isConnected}
          >
            <Text style={{ color: colors['destructive-foreground'] }}>
              Disconnect Test
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            onPress={handleConnectNotificationSocket}
            style={[styles.button, { backgroundColor: colors.success }]}
            disabled={notificationSocket.isConnected}
          >
            <Text style={{ color: '#ffffff' }}>
              Connect Notifications
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleConnectChatSocket}
            style={[styles.button, { backgroundColor: colors.warning }]}
            disabled={chatSocket.isConnected}
          >
            <Text style={{ color: '#000000' }}>
              Connect Chat
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleSendTestMessage}
          style={[styles.button, { backgroundColor: colors.primary }]}
          disabled={!testSocket.isConnected}
        >
          <Text style={{ color: colors['primary-foreground'] }}>
            Send Test Message
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Socket Test Results */}
      {socketTestResult && (
        <Card style={styles.section}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Connection Test Results
          </Text>
          
          <View style={[
            styles.resultBox, 
            { backgroundColor: socketTestResult.success ? colors.success : colors.error }
          ]}>
            <Text style={[
              TextStyles.body.medium, 
              { color: socketTestResult.success ? '#ffffff' : '#ffffff' }
            ]}>
              Status: {socketTestResult.success ? 'SUCCESS' : 'FAILED'}
            </Text>
            {socketTestResult.error && (
              <Text style={[
                TextStyles.body.small, 
                { color: socketTestResult.success ? '#ffffff' : '#ffffff' }
              ]}>
                Error: {socketTestResult.error}
              </Text>
            )}
            {socketTestResult.details && (
              <Text style={[
                TextStyles.caption.small, 
                { color: socketTestResult.success ? '#ffffff' : '#ffffff' }
              ]}>
                Details: {JSON.stringify(socketTestResult.details)}
              </Text>
            )}
          </View>
        </Card>
      )}

      {/* Backend Health Status */}
      {backendHealth !== null && (
        <Card style={styles.section}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Backend Health Status
          </Text>
          
          <View style={[
            styles.resultBox, 
            { backgroundColor: backendHealth ? colors.success : colors.error }
          ]}>
            <Text style={[
              TextStyles.body.medium, 
              { color: '#ffffff' }
            ]}>
              Backend: {backendHealth ? 'HEALTHY' : 'UNHEALTHY'}
            </Text>
          </View>
        </Card>
      )}

      {/* Socket Messages Log */}
      <Card style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Socket Messages Log
          </Text>
          <TouchableOpacity 
            onPress={handleClearSocketMessages}
            style={[styles.smallButton, { backgroundColor: colors.destructive }]}
          >
            <Text style={{ color: colors['destructive-foreground'], fontSize: 12 }}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.messageLog}>
          {socketMessages.length === 0 ? (
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], fontStyle: 'italic' }]}>
              No messages yet. Try connecting to sockets or sending test messages.
            </Text>
          ) : (
            socketMessages.map((message, index) => (
              <Text key={index} style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {message}
              </Text>
            ))
          )}
        </View>
      </Card>

      {/* Connection Tips */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Troubleshooting Tips
        </Text>
        
        {getConnectionTips().map((tip, index) => (
          <Text key={index} style={[TextStyles.body.small, { color: colors['muted-foreground'], marginVertical: 2 }]}>
            • {tip}
          </Text>
        ))}
      </Card>

      {/* Redux Store Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
          Redux Store Test
        </Text>
        <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
          Store Status: {isLoading ? 'Loading...' : 'Ready'}
        </Text>
        {error && (
          <Text style={[TextStyles.body.small, { color: colors.error }]}>
            Error: {error}
          </Text>
        )}
        {lastFetched && (
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Last fetched: {new Date(lastFetched).toLocaleTimeString()}
          </Text>
        )}
      </Card>

      {/* API Test Buttons */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          API Test Buttons
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            onPress={handleFetchMockData}
            style={[styles.button, { backgroundColor: colors.primary }]}
            disabled={isLoading}
          >
            <Text style={{ color: colors['primary-foreground'] }}>
              {isLoading ? 'Loading...' : 'Fetch Mock Data'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleFetchUserProfile}
            style={[styles.button, { backgroundColor: colors.accent }]}
            disabled={isLoading}
          >
            <Text style={{ color: colors['accent-foreground'] }}>
              Fetch Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            onPress={handleFetchWorkspaces}
            style={[styles.button, { backgroundColor: colors.secondary }]}
            disabled={isLoading}
          >
            <Text style={{ color: colors['secondary-foreground'] }}>
              Fetch Workspaces
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleFetchTasks}
            style={[styles.button, { backgroundColor: colors.success }]}
            disabled={isLoading}
          >
            <Text style={{ color: '#ffffff' }}>
              Fetch Tasks
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleClearData}
          style={[styles.button, { backgroundColor: colors.destructive }]}
        >
          <Text style={{ color: colors['destructive-foreground'] }}>
            Clear Data
          </Text>
        </TouchableOpacity>
      </Card>

      {/* API Data Display */}
      {data && (
        <Card style={styles.section}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            API Response Data
          </Text>
          
          {data.user && (
            <View style={styles.dataSection}>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                User Profile
              </Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                Name: {data.user.name}
              </Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                Email: {data.user.email}
              </Text>
            </View>
          )}

          {data.workspaces && (
            <View style={styles.dataSection}>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                Workspaces ({data.workspaces.length})
              </Text>
              {data.workspaces.map((workspace: any, index: number) => (
                <Text key={index} style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  • {workspace.name} ({workspace.members} members)
                </Text>
              ))}
            </View>
          )}

          {data.tasks && (
            <View style={styles.dataSection}>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                Tasks ({data.tasks.length})
              </Text>
              {data.tasks.map((task: any, index: number) => (
                <Text key={index} style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  • {task.title} ({task.status})
                </Text>
              ))}
            </View>
          )}

          {data.timestamp && (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              Timestamp: {new Date(data.timestamp).toLocaleString()}
            </Text>
          )}
        </Card>
      )}

      {/* Theme Information */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
          Theme System Test
        </Text>
        <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
          Current theme: {theme}
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={{ color: colors['primary-foreground'] }}>Toggle Theme</Text>
        </TouchableOpacity>
      </Card>

      {/* Color Tokens Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Color Tokens
        </Text>
        
        <View style={styles.colorGrid}>
          <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]}>
            <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'] }]}>
              Primary
            </Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.accent }]}>
            <Text style={[TextStyles.caption.small, { color: colors['accent-foreground'] }]}>
              Accent
            </Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.success }]}>
            <Text style={[TextStyles.caption.small, { color: '#ffffff' }]}>
              Success
            </Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.warning }]}>
            <Text style={[TextStyles.caption.small, { color: '#000000' }]}>
              Warning
            </Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.error }]}>
            <Text style={[TextStyles.caption.small, { color: '#ffffff' }]}>
              Error
            </Text>
          </View>
        </View>
      </Card>

      {/* Font System Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Font System
        </Text>
        
        <Text style={[TextStyles.display.large, { color: colors.foreground }]}>
          Display Large
        </Text>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
          Heading H1
        </Text>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Heading H2
        </Text>
        <Text style={[TextStyles.body.large, { color: colors.foreground }]}>
          Body Large Text
        </Text>
        <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
          Body Medium Text
        </Text>
        <Text style={[TextStyles.caption.large, { color: colors['muted-foreground'] }]}>
          Caption Text
        </Text>
        
        {/* Test responsive font size */}
        <Text style={[styles.responsiveText, { fontSize: responsiveFontSize, color: colors.foreground }]}>
          Responsive Font Size: {responsiveFontSize}px
        </Text>
      </Card>

      {/* Component Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Themed Components
        </Text>
        
        <TextInput 
          placeholder="Test input field"
          style={styles.input}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors['primary-foreground'] }}>Primary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.secondary }]}>
            <Text style={{ color: colors['secondary-foreground'] }}>Secondary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.destructive }]}>
            <Text style={{ color: colors['destructive-foreground'] }}>Destructive</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Color Palette Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Color Palette
        </Text>
        
        <View style={styles.colorGrid}>
          <View style={[styles.colorSwatch, { backgroundColor: colorPalette.light }]}>
            <Text style={[TextStyles.caption.small, { color: colorPalette.contrast }]}>
              Light
            </Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colorPalette.main }]}>
            <Text style={[TextStyles.caption.small, { color: colorPalette.contrast }]}>
              Main
            </Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colorPalette.dark }]}>
            <Text style={[TextStyles.caption.small, { color: colorPalette.contrast }]}>
              Dark
            </Text>
          </View>
        </View>
      </Card>

      {/* Gradient Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Gradient Test
        </Text>
        
        <View style={styles.gradientContainer}>
          {gradient.map((color, index) => (
            <View 
              key={index} 
              style={[
                styles.gradientSwatch, 
                { backgroundColor: color }
              ]} 
            />
          ))}
        </View>
      </Card>

      {/* Shadow Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Shadow Test
        </Text>
        
        <View style={[
          styles.shadowTest,
          ThemeUtils.getThemeShadowStyle(colors, 4, 0.2)
        ]}>
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
            Elevated Card with Shadow
          </Text>
        </View>
      </Card>

      {/* Custom Color Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Custom Color Test
        </Text>
        
        <TouchableOpacity 
          onPress={() => setUserPrimaryColor('#FF6B6B')}
          style={[styles.button, { backgroundColor: '#FF6B6B' }]}
        >
          <Text style={{ color: '#ffffff' }}>Set Red Primary</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setUserPrimaryColor('#4ECDC4')}
          style={[styles.button, { backgroundColor: '#4ECDC4' }]}
        >
          <Text style={{ color: '#ffffff' }}>Set Teal Primary</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setUserPrimaryColor('#45B7D1')}
          style={[styles.button, { backgroundColor: '#45B7D1' }]}
        >
          <Text style={{ color: '#ffffff' }}>Set Blue Primary</Text>
        </TouchableOpacity>
      </Card>

      {/* Spacing and Border Radius Test */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Spacing & Border Radius
        </Text>
        
        <View style={[
          styles.spacingTest,
          { 
            margin: ThemeUtils.getSpacing('md'),
            padding: ThemeUtils.getSpacing('lg'),
            borderRadius: ThemeUtils.getBorderRadius('lg'),
            backgroundColor: colors.secondary
          }
        ]}>
          <Text style={[TextStyles.body.medium, { color: colors['secondary-foreground'] }]}>
            Spacing: md margin, lg padding, lg border radius
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    padding: 16,
  },
  button: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statusRow: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  messageLog: {
    maxHeight: 200,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  input: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  colorSwatch: {
    width: 80,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  gradientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  gradientSwatch: {
    flex: 1,
    height: 40,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  shadowTest: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  spacingTest: {
    marginTop: 16,
  },
  responsiveText: {
    marginTop: 8,
  },
  dataSection: {
    marginVertical: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});
