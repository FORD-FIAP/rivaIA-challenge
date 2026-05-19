/** Composer principal da Home — "Pergunte à RIVA..." */

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
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor={Colors.textHint}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn}>
          <Feather name="plus" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addBtn}>
          <Feather name="arrow-right" size={14} color={Colors.textSecondary}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.inputBg,
    borderRadius: Colors.radiusXl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
    minHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
