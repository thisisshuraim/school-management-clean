import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const UploadAssignment = () => {
  const isDark = useColorScheme() === 'dark';

  // dummy assigned options
  const assignedSubjects = ['Math', 'Science'];
  const assignedClasses = ['1B', '5A'];

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pdf, setPdf] = useState(null);

  const handlePickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true
    });

    if (result.type === 'success') {
      setPdf(result);
    }
  };

  const handleUpload = () => {
    if (!selectedClass || !selectedSubject || !title || !pdf) {
      Alert.alert('Incomplete', 'Please fill in all fields and select a PDF.');
      return;
    }

    // Simulate upload
    Alert.alert('Success', 'Assignment uploaded successfully!');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }
      ]}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>
        📤 Upload Assignment
      </Text>

      {/* Class Picker */}
      <Text style={[styles.label, { color: isDark ? '#f8fafc' : '#1e293b' }]}>
        Class & Section
      </Text>
      <View style={styles.pickerRow}>
        {assignedClasses.map((cls) => (
          <TouchableOpacity
            key={cls}
            style={[
              styles.pickerOption,
              selectedClass === cls && styles.pickerSelected
            ]}
            onPress={() => setSelectedClass(cls)}
          >
            <Text
              style={{
                color: selectedClass === cls ? '#fff' : isDark ? '#cbd5e1' : '#111827'
              }}
            >
              {cls}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subject Picker */}
      <Text style={[styles.label, { color: isDark ? '#f8fafc' : '#1e293b' }]}>
        Subject
      </Text>
      <View style={styles.pickerRow}>
        {assignedSubjects.map((subj) => (
          <TouchableOpacity
            key={subj}
            style={[
              styles.pickerOption,
              selectedSubject === subj && styles.pickerSelected
            ]}
            onPress={() => setSelectedSubject(subj)}
          >
            <Text
              style={{
                color: selectedSubject === subj ? '#fff' : isDark ? '#cbd5e1' : '#111827'
              }}
            >
              {subj}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <Text style={[styles.label, { color: isDark ? '#f8fafc' : '#1e293b' }]}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter assignment title"
        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
        style={[
          styles.input,
          {
            color: isDark ? '#fff' : '#000',
            backgroundColor: isDark ? '#1e293b' : '#fff'
          }
        ]}
      />

      {/* Deadline */}
      <Text style={[styles.label, { color: isDark ? '#f8fafc' : '#1e293b' }]}>Deadline</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Ionicons name="calendar-outline" size={16} color="#2563eb" />
        <Text style={{ color: '#2563eb', fontWeight: '500' }}>
          {deadline.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDeadline(selectedDate);
          }}
        />
      )}

      {/* PDF Picker */}
      <Text style={[styles.label, { color: isDark ? '#f8fafc' : '#1e293b' }]}>Upload PDF</Text>
      <TouchableOpacity onPress={handlePickPDF} style={styles.pdfButton}>
        <Ionicons name="document-attach-outline" size={18} color="#fff" />
        <Text style={styles.pdfText}>
          {pdf ? pdf.name : 'Choose PDF'}
        </Text>
      </TouchableOpacity>

      {/* Upload */}
      <TouchableOpacity onPress={handleUpload} style={styles.uploadButton}>
        <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
        <Text style={styles.uploadText}>Upload Assignment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#e2e8f0'
  },
  pickerSelected: {
    backgroundColor: '#2563eb'
  },
  input: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 4
  },
  dateButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#e0edff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4
  },
  pdfButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6
  },
  pdfText: {
    color: '#fff',
    fontWeight: '600'
  },
  uploadButton: {
    marginTop: 24,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default UploadAssignment;
