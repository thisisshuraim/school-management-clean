import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  ScrollView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

const UploadMarksheet = () => {
  const isDark = useColorScheme() === 'dark';

  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*']
    });

    if (result.assets && result.assets.length > 0 && result.assets[0].size < 5 * 1024 * 1024) {
      setFile(result.assets[0]);
    } else if (result.assets[0].size >= 5 * 1024 * 1024) {
      Alert.alert('File too large', 'Please upload a file smaller than 5MB.');
    }
  };

  const handleUpload = () => {
    if (!username || !file) {
      Alert.alert('Missing Info', 'Please enter username and select a file.');
      return;
    }

    Alert.alert('Upload Success', `Marksheet for ${username} uploaded.`);
    setUsername('');
    setFile(null);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        backgroundColor: isDark ? '#0f172a' : '#f9fafc',
        flexGrow: 1
      }}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📄 Upload Marksheet</Text>

      <TextInput
        placeholder="Enter Student Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, {
          backgroundColor: isDark ? '#334155' : '#f1f5f9',
          color: isDark ? '#fff' : '#000'
        }]}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handlePickFile}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.uploadBtnText}>{file ? 'Change File' : 'Pick File'}</Text>
      </TouchableOpacity>

      {file && (
        <View style={styles.fileInfo}>
          <Ionicons name="document-outline" size={18} color={isDark ? '#facc15' : '#f59e0b'} />
          <Text style={[styles.fileText, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>{file.name}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleUpload}>
        <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.saveBtnText}>Upload Marksheet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 16
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 16
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10
  },
  fileText: {
    fontSize: 14,
    fontWeight: '500'
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default UploadMarksheet;