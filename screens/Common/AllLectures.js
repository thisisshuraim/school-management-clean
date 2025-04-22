
import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
  LayoutAnimation, Platform, UIManager, useColorScheme, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getLectures, uploadLecture, deleteLecture, getMyTeacherProfile } from '../../utils/api';
import UserContext from '../../context/UserContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const GROUP_SCROLL_SIZE = 5;

const AllLectures = () => {
  const isStudent = user?.role?.toLowerCase() === 'student';
  const studentClass = isStudent ? profile?.classSection : null;

  const isDark = useColorScheme() === 'dark';
  const { user } = useContext(UserContext);
  const isTeacher = user?.role === 'teacher';

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [form, setForm] = useState({ classSection: '', subject: '', title: '', file: null });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visibleCounts, setVisibleCounts] = useState({});

  useEffect(() => {
    fetchLectures();
    if (isTeacher) fetchTeacherProfile();
  }, []);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const res = await getLectures();
      setLectures(isStudent ? res.data.filter(l => l.classSection === studentClass) : res.data);
    } catch {
      Alert.alert('Error', 'Failed to load lectures');
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    if (!result.canceled && result.assets?.length > 0) {
      const video = result.assets[0];
      setForm(prev => ({ ...prev, file: { uri: video.uri, name: video.fileName || 'video.mp4', type: video.mimeType || 'video/mp4' } }));
    }
  };

  const handleAdd = async () => {
    const { title, classSection, subject, file } = form;
    if (!title || !classSection || !subject || !file) {
      Alert.alert('Missing', 'Fill all fields and pick a file');
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('title', title);
      fd.append('classSection', classSection);
      fd.append('subject', subject);
      fd.append('video', { uri: file.uri, name: file.name, type: file.type });

      await uploadLecture(fd);
      await fetchLectures();
      setForm({ classSection: '', subject: '', title: '', file: null });
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteLecture(id);
    await fetchLectures();
  };

  const handleDownload = (url) => {
    if (!url) return Alert.alert('Error', 'No video URL available');
    Linking.openURL(url);
  };

  const grouped = lectures
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    .reduce((acc, a) => {
      const classKey = a.classSection || 'Unknown';
      const subjectKey = a.subject || 'General';
      if (!acc[classKey]) acc[classKey] = {};
      if (!acc[classKey][subjectKey]) acc[classKey][subjectKey] = [];
      acc[classKey][subjectKey].push(a);
      return acc;
    }, {});

  const loadMore = (classKey, subjectKey) => {
    const groupKey = `${classKey}::${subjectKey}`;
    setVisibleCounts(prev => ({
      ...prev,
      [groupKey]: (prev[groupKey] || GROUP_SCROLL_SIZE) + GROUP_SCROLL_SIZE
    }));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc', flexGrow: 1 }}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>🎥 All Lectures</Text>

      <TextInput
        placeholder="Search by title"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
        value={search}
        onChangeText={setSearch}
      />

      {(user?.role === 'admin' || isTeacher) && (
        <>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setShowForm(!showForm);
          }}>
            <Text style={styles.accordionTitle}>Upload Lecture</Text>
            <Ionicons name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#2563eb" />
          </TouchableOpacity>

          {!isStudent && showForm && (
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

              <TouchableOpacity style={styles.uploadBtn} onPress={handleFilePick}>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.uploadText}>{form.file ? 'Change File' : 'Pick File'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Uploading...' : 'Upload Lecture'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : (
        Object.keys(grouped).map((classKey) => (
          <View key={classKey} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.groupTitle, { color: isDark ? '#fff' : '#111827' }]}>Class {classKey}</Text>
            {Object.keys(grouped[classKey]).map(subjectKey => {
              const groupKey = `${classKey}::${subjectKey}`;
              const visible = visibleCounts[groupKey] || GROUP_SCROLL_SIZE;
              const subjectLectures = grouped[classKey][subjectKey].slice(0, visible);
              const hasMore = grouped[classKey][subjectKey].length > visible;

              return (
                <View key={subjectKey} style={{ marginTop: 12, paddingLeft: 12 }}>
                  <Text style={{ fontWeight: '600', color: '#0ea5e9', marginBottom: 8 }}>{subjectKey}</Text>
                  {subjectLectures.map(a => (
                    <View key={a._id} style={{ marginBottom: 16, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: isDark ? '#334155' : '#d1d5db' }}>
                      <Text style={[styles.meta, { color: isDark ? '#f1f5f9' : '#111827', fontWeight: '600', fontSize: 15 }]}>🎬 {a.title}</Text>
                <Text style={[styles.meta, { color: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }]}>Uploaded: {new Date(a.createdAt).toLocaleDateString()}</Text>
                      <View style={styles.actions}>
                        <TouchableOpacity onPress={() => handleDownload(a.videoUrl)}>
                          <Ionicons name="download-outline" size={20} color="#2563eb" />
                        </TouchableOpacity>
                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                          <TouchableOpacity onPress={() => handleDelete(a._id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                  {hasMore && (
                    <TouchableOpacity onPress={() => loadMore(classKey, subjectKey)} style={{ marginTop: 4 }}>
                      <Text style={{ color: '#2563eb', fontWeight: '600' }}>Load More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 },
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

export default AllLectures;