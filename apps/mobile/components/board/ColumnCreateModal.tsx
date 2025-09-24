import React, { useState, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { X, Check } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.7 : SCREEN_HEIGHT * 0.65;

interface ColumnCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color?: string }) => void;
}

export const ColumnCreateModal: React.FC<ColumnCreateModalProps> = ({ visible, onClose, onSave }) => {
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color: color.trim() || undefined });
    setName('');
    setColor('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setColor('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>        
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>              
              <View style={[styles.header, { borderBottomColor: colors.border }]}>                
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={colors.foreground} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                  <Text style={[styles.title, { color: colors.foreground }]}>Create Column</Text>
                </View>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView ref={scrollViewRef} style={styles.content} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>                
                <View style={styles.section}>                  
                  <Text style={[styles.label, { color: colors['muted-foreground'] }]}>Name</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter column name..."
                    placeholderTextColor={colors['muted-foreground']}
                    autoFocus
                  />
                </View>

                <View style={styles.section}>                  
                  <Text style={[styles.label, { color: colors['muted-foreground'] }]}>Color (optional)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                    value={color}
                    onChangeText={setColor}
                    placeholder="#DBEAFE or any CSS color"
                    placeholderTextColor={colors['muted-foreground']}
                  />
                </View>
              </ScrollView>

              <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>                
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: name.trim() ? colors.primary : colors.muted, opacity: name.trim() ? 1 : 0.5 }]}
                  onPress={handleSave}
                  disabled={!name.trim()}
                >
                  <Check size={18} color="white" />
                  <Text style={styles.saveText}>Create Column</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  safeArea: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  keyboardAvoid: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  modal: {
    width: '92%',
    maxWidth: 520,
    maxHeight: MODAL_HEIGHT,
    minHeight: SCREEN_HEIGHT * 0.35,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  closeButton: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  section: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  footer: { padding: 12, borderTopWidth: 1 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 8 },
  saveText: { color: 'white', fontSize: 14, fontWeight: '600' },
});


