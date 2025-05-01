import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, useColorScheme, Alert, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserContext from '../../context/UserContext';
import { sendAnnouncement, getMyTeacherProfile } from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const UploadAnnouncement = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const { user } = useContext(UserContext);
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classInput, setClassInput] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isTeacher) {
      fetchAssignedClasses();
    }
  }, []);

  const fetchAssignedClasses = async () => {
    try {
      const res = await getMyTeacherProfile();
      setAssignedClasses(res.data?.assignedClasses || []);
    } catch {
      Alert.alert('Error', 'Failed to load teacher profile');
    }
  };

  const handleSubmit = async () => {
    const targetClasses = isAdmin
      ? classInput.split(',').map(cls => cls.trim().toUpperCase()).filter(Boolean)
      : selectedClasses;

    if (!title || !message || targetClasses.length === 0) {
      Alert.alert('Missing Fields', 'Please fill in all fields and select classes');
      return;
    }

    try {
      setSaving(true);
      await sendAnnouncement({ title, message, classSection: targetClasses.join(',') }, user?.role);
      Alert.alert('Success', 'Announcement sent');
      setTitle('');
      setMessage('');
      setClassInput('');
      setSelectedClasses([]);
      navigation.goBack();
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Failed to send announcement');
    } finally {
      setSaving(false);
    }
  };

  const toggleClass = (cls) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📢 Upload Announcement</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }]}
      />

      <TextInput
        placeholder="Write announcement here..."
        value={message}
        multiline
        numberOfLines={6}
        onChangeText={setMessage}
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.textArea, { backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }]}
      />

      {isAdmin ? (
        <>
          <Text style={[styles.label, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>Classes (comma separated)</Text>
          <TextInput
            placeholder="e.g. 1A, 2B"
            value={classInput}
            onChangeText={setClassInput}
            placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
            style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }]}
          />
        </>
      ) : (
        <>
          <Text style={[styles.label, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>Select Classes</Text>
          <View style={styles.pickerRow}>
            {assignedClasses.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[styles.pickerOption, selectedClasses.includes(cls) && styles.pickerSelected]}
                onPress={() => toggleClass(cls)}
              >
                <Text style={{ color: selectedClasses.includes(cls) ? '#fff' : isDark ? '#cbd5e1' : '#111827' }}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
        {saving ? (
          <Text style={styles.submitText}>Sending...</Text>
        ) : (
          <>
            <Ionicons name="send-outline" size={20} color="#fff" />
            <Text style={styles.submitText}>Send Announcement</Text>
          </>
        )}
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  textArea: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top'
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
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
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default UploadAnnouncement;
