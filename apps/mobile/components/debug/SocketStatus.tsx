import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Card, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface SocketStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string | null;
  lastConnected?: Date | null;
  connectionCount?: number;
  namespace?: string;
}

export default function SocketStatus({
  isConnected,
  isConnecting,
  error,
  lastConnected,
  connectionCount = 0,
  namespace = 'default'
}: SocketStatusProps) {
  const colors = useThemeColors();

  const getStatusColor = () => {
    if (isConnecting) return colors.warning;
    if (isConnected) return colors.success;
    if (error) return colors.error;
    return colors['muted-foreground'];
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    if (error) return 'Error';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isConnecting) return '🔄';
    if (isConnected) return '🟢';
    if (error) return '🔴';
    return '⚪';
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
          Socket Status
        </Text>
        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
          {namespace}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={[TextStyles.body.medium, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[TextStyles.body.small, { color: colors.error }]}>
            Error: {error}
          </Text>
        </View>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
            Connection Count:
          </Text>
          <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
            {connectionCount}
          </Text>
        </View>

        {lastConnected && (
          <View style={styles.detailRow}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Last Connected:
            </Text>
            <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
              {lastConnected.toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorContainer: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginBottom: 8,
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});
