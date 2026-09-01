/** Composer principal da Home — "Pergunte à RIVA...", com anexo de imagem e gravação de voz */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { Colors } from '../../theme/colors';

export interface ChatAttachment {
  imageUri?: string;
  audioUri?: string;
}

interface ChatInputProps {
  onSend: (message: string, attachment?: ChatAttachment) => void;
}

/** Remove o contorno de foco padrão do navegador (react-native-web) — sem efeito no nativo. */
const webNoOutline = { outlineStyle: 'none' } as unknown as { outlineWidth: number };

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  function handleSend() {
    if (!text.trim() && !imageUri) return;
    onSend(text.trim(), imageUri ? { imageUri } : undefined);
    setText('');
    setImageUri(null);
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleToggleRecording() {
    if (isRecording) {
      await audioRecorder.stop();
      setIsRecording(false);
      if (audioRecorder.uri) {
        onSend('', { audioUri: audioRecorder.uri });
      }
      return;
    }

    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) return;

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  }

  return (
    <View style={styles.container}>
      {imageUri && (
        <View style={styles.attachmentRow}>
          <Image source={{ uri: imageUri }} style={styles.attachmentThumb} />
          <TouchableOpacity style={styles.attachmentRemove} onPress={() => setImageUri(null)}>
            <Feather name="x" size={12} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {isRecording ? (
        <View style={styles.recordingRow}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingLabel}>Gravando áudio...</Text>
        </View>
      ) : (
        <TextInput
          style={[styles.input, webNoOutline]}
          placeholder="Pergunte à RIVA"
          placeholderTextColor={Colors.textHint}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={false}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={handlePickImage}>
          <Feather name="plus" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, isRecording && styles.addBtnRecording]}
          onPress={handleToggleRecording}
        >
          <Feather name="mic" size={14} color={isRecording ? Colors.textPrimary : Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Feather name="arrow-right" size={14} color={Colors.textPrimary} />
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
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentThumb: {
    width: 48,
    height: 48,
    borderRadius: Colors.radiusMd,
  },
  attachmentRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    marginTop: -28,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  recordingLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
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
  addBtnRecording: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
