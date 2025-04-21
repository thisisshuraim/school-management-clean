import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
  LayoutAnimation, Platform, UIManager, useColorScheme, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getLectures, uploadLecture, deleteLecture } from '../../utils/api';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import UserContext from '../../context/UserContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PAGE_SIZE = 5;

const handleDownload = async (url) => {
  if (!url || !url.startsWith('http')) {
    Alert.alert('Invalid URL');
    return;
  }

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to media library.');
      return;
    }

    const fileUri = FileSystem.documentDirectory + url.split('/').pop();
    const download = await FileSystem.downloadAsync(url, fileUri);
    await MediaLibrary.saveToLibraryAsync(download.uri);
    Alert.alert('Downloaded', 'Lecture saved to gallery.');
  } catch (err) {
    Alert.alert('Download failed', err.message);
  }
};

const AllLectures = () => {
  const isDark = useColorScheme() === 'dark';
  const { user, profile } = useContext(UserContext);

  const isTeacher = user?.role?.toLowerCase() === 'teacher';

  const [lectures, setLectures] = useState([]);
  const [form, setForm] = useState({ classSection: '', subject: '', title: '', file: null });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const res = await getLectures();
      setLectures(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLectures(); }, []);

  const handleFilePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: [ImagePicker.MediaType.VIDEO] });
    if (!result.canceled && result.assets?.length > 0) {
      const video = result.assets[0];
      setForm(prev => ({ ...prev, file: { uri: video.uri, name: video.fileName || 'video.mp4', type: video.type || 'video/mp4' } }));
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

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this lecture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteLecture(id);
          await fetchLectures();
        }
      }
    ]);
  };

  const grouped = lectures
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    .reduce((acc, a) => {
      const key = a.classSection;
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});

  const classOptions = isTeacher ? (profile?.assignedClasses || []) : [];
  const subjectOptions = isTeacher ? (profile?.subjects || []) : [];

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

      <TouchableOpacity style={styles.accordionHeader} onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowForm(!showForm);
      }}>
        <Text style={styles.accordionTitle}>Upload Lecture</Text>
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

          {isTeacher && (
            <>
              <View style={[styles.pickerRow, { marginBottom: 12 }]}>
                {classOptions.map((cls) => (
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
                {subjectOptions.map((subj) => (
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
          )}

          {!isTeacher && (["classSection", "subject"].map((field) => (
            <TextInput
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
              value={form[field]}
              onChangeText={(text) => setForm({ ...form, [field]: text })}
            />
          )))}

          <TouchableOpacity style={styles.uploadBtn} onPress={handleFilePick}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadText}>{form.file ? 'Change File' : 'Pick File'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
            <Text style={styles.saveText}>{saving ? 'Uploading...' : 'Upload Lecture'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : Object.keys(grouped).length === 0 ? (
        <Text style={{ color: isDark ? '#cbd5e1' : '#6b7280', marginTop: 20, textAlign: 'center' }}>No lectures found.</Text>
      ) : (
        Object.keys(grouped).map((key) => (
          <View key={key} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.groupTitle, { color: isDark ? '#fff' : '#111827' }]}>Class {key}</Text>
            {grouped[key].map(a => (
              <View key={a._id} style={{ marginBottom: 16 }}>
                <Text style={[styles.meta, { color: isDark ? '#f1f5f9' : '#111827' }]}>🎬 {a.title}</Text>
                <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>Subject: {a.subject || '-'}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleDownload(a.videoUrl)}>
                    <Ionicons name="download-outline" size={20} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(a._id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
