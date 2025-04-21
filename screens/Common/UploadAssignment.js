import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
  LayoutAnimation, Platform, UIManager, useColorScheme, ActivityIndicator, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAssignments, uploadAssignment, deleteAssignment, getMyTeacherProfile } from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PAGE_SIZE = 5;

const UploadAssignmentShared = ({ userRole }) => {
  const isDark = useColorScheme() === 'dark';
  const isTeacher = userRole === 'teacher';

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ classSection: '', subject: '', title: '', deadline: new Date(), file: null });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAssignments();
    if (isTeacher) fetchTeacherProfile();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await getAssignments();
      setAssignments(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherProfile = async () => {
    try {
      const res = await getMyTeacherProfile();
      setAssignedSubjects(res.data.subjects || []);
      setAssignedClasses(res.data.assignedClasses || []);
    } catch {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.assets?.[0]) {
      setForm(prev => ({ ...prev, file: result.assets[0] }));
    }
  };

  const handleAdd = async () => {
    const { title, classSection, subject, deadline, file } = form;
    if (!title || !classSection || !subject || !deadline || !file) {
      Alert.alert('Missing', 'Fill all fields and pick a file');
      return;
    }
    if (new Date(deadline) < new Date()) {
      Alert.alert('Invalid Deadline', 'Deadline must be a future date.');
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('title', title);
      fd.append('classSection', classSection);
      fd.append('subject', subject);
      fd.append('deadline', deadline.toISOString().split('T')[0]);
      fd.append('file', { uri: file.uri, name: file.name, type: file.mimeType });

      await uploadAssignment(fd);
      await fetchAssignments();
      setForm({ classSection: '', subject: '', title: '', deadline: new Date(), file: null });
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteAssignment(id);
    await fetchAssignments();
  };

  const handleDownload = (url) => {
    if (!url) return Alert.alert('Error', 'No file URL available');
    const fullUrl = url.startsWith('http')
      ? url
      : `https://school-management-backend-uciz.onrender.com/${url.replace(/^\/\?/, '')}`;
    Linking.openURL(encodeURI(fullUrl));
  };

  const grouped = assignments
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    .reduce((acc, a) => {
      const key = a.classSection;
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});

  return (
    <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc', flexGrow: 1 }}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📚 All Assignments</Text>

      <TextInput
        placeholder="Search by title"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
        value={search}
        onChangeText={setSearch}
      />

      {(userRole === 'admin' || userRole === 'teacher') && (
        <>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setShowForm(!showForm);
          }}>
            <Text style={styles.accordionTitle}>Upload Assignment</Text>
            <Ionicons name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#2563eb" />
          </TouchableOpacity>

          {showForm && (
            <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <TextInput
                placeholder="Title"
                placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
              />

              {isTeacher ? (
                <>
                  <View style={[styles.pickerRow, { marginBottom: 12 }]}>
                    {assignedClasses.map(cls => (
                      <TouchableOpacity
                        key={cls}
                        style={[styles.pickerOption, form.classSection === cls && styles.pickerSelected]}
                        onPress={() => setForm({ ...form, classSection: cls })}
                      >
                        <Text style={{ color: form.classSection === cls ? '#fff' : isDark ? '#cbd5e1' : '#111827' }}>{cls}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[styles.pickerRow, { marginBottom: 12 }]}>
                    {assignedSubjects.map(subj => (
                      <TouchableOpacity
                        key={subj}
                        style={[styles.pickerOption, form.subject === subj && styles.pickerSelected]}
                        onPress={() => setForm({ ...form, subject: subj })}
                      >
                        <Text style={{ color: form.subject === subj ? '#fff' : isDark ? '#cbd5e1' : '#111827' }}>{subj}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                ["classSection", "subject"].map((field) => (
                  <TextInput
                    key={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
                    style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
                    value={form[field]}
                    onChangeText={(text) => setForm({ ...form, [field]: text })}
                  />
                ))
              )}

              <TouchableOpacity style={[styles.input, styles.deadlinePicker]} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={isDark ? '#fff' : '#000'} style={{ marginRight: 8 }} />
                <Text style={{ color: isDark ? '#fff' : '#000' }}>Deadline: {form.deadline.toDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={form.deadline}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  onChange={(e, date) => {
                    setShowDatePicker(false);
                    if (date && date > new Date()) setForm({ ...form, deadline: date });
                    else if (date) Alert.alert('Invalid Deadline', 'Deadline must be a future date.');
                  }}
                />
              )}

              <TouchableOpacity style={styles.uploadBtn} onPress={handleFilePick}>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.uploadText}>{form.file ? 'Change File' : 'Pick File'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Uploading...' : 'Upload Assignment'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {Object.keys(grouped).map((key) => (
        <View key={key} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.groupTitle, { color: isDark ? '#fff' : '#111827' }]}>Class {key}</Text>
          {grouped[key].map(a => (
            <View key={a._id} style={{ marginBottom: 16 }}>
              <Text style={[styles.meta, { color: isDark ? '#f1f5f9' : '#111827' }]}>📌 {a.title}</Text>
              <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>Subject: {a.subject || '-'}</Text>
              <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>Deadline: {a.deadline?.split('T')[0] || '-'}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleDownload(a.fileUrl)}>
                  <Ionicons name="download-outline" size={20} color="#2563eb" />
                </TouchableOpacity>
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <TouchableOpacity onPress={() => handleDelete(a._id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 },
  deadlinePicker: { flexDirection: 'row', alignItems: 'center', borderRadius: 10 },
  card: {
    borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2
  },
  groupTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  meta: { fontSize: 14, marginBottom: 2 },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dbeafe', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 10, marginBottom: 12
  },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
  uploadBtn: {
    flexDirection: 'row', backgroundColor: '#2563eb', padding: 12,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 12
  },
  uploadText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  saveBtn: {
    backgroundColor: '#22c55e', padding: 14,
    borderRadius: 12, alignItems: 'center'
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 16, marginTop: 6 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pickerOption: {
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 10, backgroundColor: '#e2e8f0'
  },
  pickerSelected: { backgroundColor: '#2563eb' }
});

export default UploadAssignmentShared;
