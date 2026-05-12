/** Composer principal da Home — "Pergunte qualquer coisa sobre carros…" */
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton}>
        <Feather name="message-circle" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Pergunte qualquer coisa sobre carros…"
        placeholderTextColor={Colors.textHint}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline={false}
      />

      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Feather name="arrow-right" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: Colors.radiusXl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
