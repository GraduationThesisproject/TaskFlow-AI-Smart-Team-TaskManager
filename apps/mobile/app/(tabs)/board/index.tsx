import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Board } from '@/components/board';
import { useAppSelector } from '@/store';

export default function BoardScreen() {
  const params = useLocalSearchParams();
  const boardId = (params.boardId as string) || '68d3ba2c40e60ac01a39a39d'; // Fallback for testing
  const boardName = (params.boardName as string) || 'Board';
  const authState = useAppSelector(state => state.auth);

  console.log('[BoardScreen] Params:', params);
  console.log('[BoardScreen] boardId:', boardId);
  console.log('[BoardScreen] Auth state:', { isAuthenticated: !!authState.user, user: authState.user?.email });

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: boardName, headerShown: false }} />
      <Board boardId={boardId} editable showFilters />
    </View>
  );
}
