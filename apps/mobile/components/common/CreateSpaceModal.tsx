import React, { useState, useEffect } from 'react';
import { Modal, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type Visibility = 'private' | 'public';

interface CreateSpaceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string; visibility: Visibility }) => Promise<void> | void;
  submitting?: boolean;
}

export default function CreateSpaceModal({ visible, onClose, onSubmit, submitting }: CreateSpaceModalProps) {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');

  useEffect(() => {
    if (!visible) {
      setName('');
      setDescription('');
      setVisibility('private');
    }
  }, [visible]);

  const canCreate = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canCreate) return;
    await onSubmit({ name: name.trim(), description: description.trim() || undefined, visibility });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Card style={{ padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: colors.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Create Space</Text>
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
                  placeholder="e.g. Engineering"
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
                  placeholder="Brief summary of the space"
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

              <View>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 6 }]}>Visibility</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setVisibility('private')}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: visibility === 'private' ? colors.primary : colors.card,
                    }}
                  >
                    <Text style={[TextStyles.caption.small, { color: visibility === 'private' ? colors['primary-foreground'] : colors.foreground }]}>Private</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setVisibility('public')}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: visibility === 'public' ? colors.primary : colors.card,
                    }}
                  >
                    <Text style={[TextStyles.caption.small, { color: visibility === 'public' ? colors['primary-foreground'] : colors.foreground }]}>Public</Text>
                  </TouchableOpacity>
                </View>
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