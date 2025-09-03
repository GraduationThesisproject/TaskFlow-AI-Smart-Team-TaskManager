import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text, Card, Button, ButtonText } from '../../components/Themed';
import { useThemeColors } from '../../components/ThemeProvider';
import { TextStyles } from '../../constants/Fonts';

// Import components directly to avoid potential circular dependencies
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Toast from '../../components/common/Toast';
import Badge from '../../components/common/Badge';
import Divider from '../../components/common/Divider';
import Icon from '../../components/common/Icon';
import FormField from '../../components/forms/FormField';
import InputField from '../../components/forms/InputField';
import TaskCard from '../../components/cards/TaskCard';
import LoginForm from '../../components/auth/LoginForm';
import SocketStatus from '../../components/debug/SocketStatus';

export default function ComponentsTestScreen() {
  const colors = useThemeColors();
  const [showLoading, setShowLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 2000);
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    console.log('OAuth login:', provider);
  };

  const throwError = () => {
    throw new Error('This is a test error for ErrorBoundary!');
  };

  const sampleTask = {
    id: 'task-1',
    title: 'Complete Mobile App',
    description: 'Finish building the TaskFlow mobile application with all components',
    status: 'in-progress' as const,
    priority: 'high' as const,
    assignee: {
      id: 'user-1',
      name: 'John Doe',
    },
    dueDate: '2024-01-15',
    tags: ['frontend', 'mobile', 'react-native'],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center', marginVertical: 20 }]}>
        🧪 Components Test Screen
      </Text>

      {/* Themed Components Section */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
          🎨 Themed Components
        </Text>
        
        <View style={styles.componentRow}>
          <TouchableOpacity 
            onPress={() => console.log('Primary button pressed')}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
              Primary Button
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentRow}>
          <TouchableOpacity 
            onPress={() => console.log('Secondary button pressed')}
            style={[styles.button, { backgroundColor: colors.secondary }]}
          >
            <Text style={{ color: colors['secondary-foreground'], textAlign: 'center' }}>
              Secondary Button
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentRow}>
          <TouchableOpacity 
            onPress={() => console.log('Destructive button pressed')}
            style={[styles.button, { backgroundColor: colors.destructive }]}
          >
            <Text style={{ color: colors['destructive-foreground'], textAlign: 'center' }}>
              Destructive Button
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentRow}>
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
            This is themed text with custom colors
          </Text>
        </View>
      </Card>

      {/* Common Components Section */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
          🔧 Common Components
        </Text>

        <View style={styles.componentRow}>
          <TouchableOpacity 
            onPress={() => setShowLoading(true)}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
              Show Loading Spinner
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentRow}>
          <TouchableOpacity 
            onPress={() => setShowDialog(true)}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
              Show Confirmation Dialog
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentRow}>
          <TouchableOpacity 
            onPress={() => setShowToast(true)}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
              Show Toast Message
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentRow}>
          <TouchableOpacity 
            onPress={() => setShowError(true)}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
              Test Error Boundary
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentRow}>
          <EmptyState
            title="No Tasks Found"
            description="Create your first task to get started"
            actionText="Create Task"
            onAction={() => console.log('Create task action')}
          />
        </View>

        <View style={styles.componentRow}>
          <View style={styles.badgeContainer}>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </View>
        </View>

        <View style={styles.componentRow}>
          <Divider />
        </View>

        <View style={styles.componentRow}>
          <Icon name="🌟" size={32} />
          <Icon name="🚀" size={24} />
          <Icon name="💡" size={20} />
        </View>
      </Card>

      {/* Form Components Section */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
          📝 Form Components
        </Text>

        <FormField label="Name" required>
          <InputField
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your name"
          />
        </FormField>

        <FormField label="Email" required>
          <InputField
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </FormField>

        <FormField label="Password" required>
          <InputField
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Enter your password"
            secureTextEntry
          />
        </FormField>
      </Card>

      {/* Card Components Section */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
          🃏 Card Components
        </Text>

        <TaskCard
          {...sampleTask}
          onPress={() => console.log('Task card pressed')}
          onLongPress={() => console.log('Task card long pressed')}
        />
      </Card>

      {/* Auth Components Section */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
          🔐 Auth Components
        </Text>

        <LoginForm
          onSubmit={handleLogin}
          onOAuthLogin={handleOAuthLogin}
          onForgotPassword={() => console.log('Forgot password')}
          onSignup={() => console.log('Sign up')}
          error="This is a test error message"
        />
      </Card>

      {/* Debug Components Section */}
      <Card style={styles.section}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
          🐛 Debug Components
        </Text>

        <SocketStatus
          isConnected={true}
          isConnecting={false}
          connectionCount={5}
          namespace="test-namespace"
        />

        <SocketStatus
          isConnected={false}
          isConnecting={true}
          error="Connection timeout"
          namespace="error-namespace"
        />
      </Card>

      {/* Loading Overlay */}
      {showLoading && (
        <LoadingSpinner
          text="Loading components..."
          overlay
        />
      )}

      {/* Toast Message */}
      <Toast
        message="This is a test toast message!"
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showDialog}
        title="Test Confirmation"
        message="This is a test confirmation dialog. Are you sure you want to proceed?"
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        onConfirm={() => {
          console.log('Confirmed!');
          setShowDialog(false);
        }}
        onCancel={() => setShowDialog(false)}
        variant="default"
      />

      {/* Error Boundary Test */}
      {showError && (
        <ErrorBoundary>
          <View>
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
              This will throw an error when you press the button below:
            </Text>
            <TouchableOpacity 
              onPress={throwError}
              style={[styles.button, { backgroundColor: colors.destructive }]}
            >
              <Text style={{ color: colors['destructive-foreground'], textAlign: 'center' }}>
                Throw Error
              </Text>
            </TouchableOpacity>
          </View>
        </ErrorBoundary>
      )}

      <View style={{ height: 100 }} />
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
  componentRow: {
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
