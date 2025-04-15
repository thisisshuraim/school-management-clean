import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const ManageTimetable = () => {
  const isDark = useColorScheme() === 'dark';
  const [className, setClassName] = useState('');
  const [timetable, setTimetable] = useState(null);

  const pickTimetable = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
    if (result.type === 'success') setTimetable(result);
  };

  const handleUpload = () => {
    if (!className || !timetable) {
      Alert.alert('Missing', 'Please select a class and timetable image');
      return;
    }
    Alert.alert('Uploaded', `Timetable for class ${className} uploaded.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>🗓 Upload Timetable</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }]}
        placeholder="Class (e.g., 5A)"
        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
        value={className}
        onChangeText={setClassName}
      />
      <TouchableOpacity style={styles.btn} onPress={pickTimetable}>
        <Text style={styles.btnText}>{timetable ? timetable.name : 'Pick Timetable Image'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
        <Text style={styles.uploadText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  btn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16
  },
  btnText: {
    color: '#fff',
    fontWeight: '600'
  },
  uploadBtn: {
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  uploadText: {
    color: '#fff',
    fontWeight: '700'
  }
});

export default ManageTimetable;