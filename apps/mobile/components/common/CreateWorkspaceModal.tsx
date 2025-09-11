import React, { useEffect, useState } from 'react';
import { Modal, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface CreateWorkspaceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string }) => Promise<void> | void;
  submitting?: boolean;
}

export default function CreateWorkspaceModal({ visible, onClose, onSubmit, submitting }: CreateWorkspaceModalProps) {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!visible) {
      setName('');
      setDescription('');
    }
  }, [visible]);

  const canCreate = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canCreate) return;
    await onSubmit({ name: name.trim(), description: description.trim() || undefined });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Card style={{ padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Create Workspace</Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                <FontAwesome name="close" size={20} color={colors['muted-foreground']} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 16, gap: 12 }}>
              <View>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 6 }]}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Marketing Team"
                  placeholderTextColor={colors['muted-foreground']}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />
              </View>

              <View>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 6 }]}>Description (optional)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What is this workspace about?"
                  placeholderTextColor={colors['muted-foreground']}
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 80,
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={onClose}
                disabled={submitting}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: colors.secondary }}
              >
                <Text style={{ color: colors['secondary-foreground'] }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canCreate}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: canCreate ? colors.primary : colors.muted }}
              >
                <Text style={{ color: canCreate ? colors['primary-foreground'] : colors['muted-foreground'] }}>{submitting ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
