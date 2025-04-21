import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadMarksheet, getMarksheets, deleteMarksheet } from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const UploadMarksheet = () => {
  const isDark = useColorScheme() === 'dark';
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [marksheets, setMarksheets] = useState([]);

  useEffect(() => {
    fetchMarksheets();
  }, []);

  const fetchMarksheets = async () => {
    setLoading(true);
    try {
      const res = await getMarksheets();
      setMarksheets(res.data);
    } catch (err) {
      console.error('❌ Fetch error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload marksheet.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      quality: 1
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.fileName || 'marksheet.jpg',
        type: asset.mimeType || 'image/jpeg'
      });
    }
  };

  const handleUpload = async () => {
    if (!username || !file) {
      Alert.alert('Missing Info', 'Please enter username and select a file.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('username', username);
      formData.append('file', file);
      await uploadMarksheet(formData);
      Alert.alert('Upload Success', `Marksheet for ${username} uploaded.`);
      setUsername('');
      setFile(null);
      setShowForm(false);
      fetchMarksheets();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || '';
      Alert.alert('Upload Error', msg.includes('not found') ? 'User not found.' : msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this marksheet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMarksheet(id);
            fetchMarksheets();
          } catch {
            Alert.alert('Error', 'Failed to delete marksheet');
          }
        }
      }
    ]);
  };

  const filtered = marksheets.filter(m => m.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc', flexGrow: 1 }}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📄 Manage Marksheets</Text>

      <TextInput
        placeholder="Search by username"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity style={styles.accordionHeader} onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowForm(!showForm);
      }}>
        <Text style={styles.accordionTitle}>{showForm ? 'Close Upload Form' : 'Upload New Marksheet'}</Text>
        <Text style={{ fontSize: 18, color: '#2563eb' }}>{showForm ? '−' : '+'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.label, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>Student Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. john123"
            placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
            style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
          />

          <TouchableOpacity style={styles.uploadBtn} onPress={handlePickFile}>
            <Ionicons name="cloud-upload-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.uploadBtnText}>{file ? 'Change File' : 'Pick File'}</Text>
          </TouchableOpacity>

          {file && (
            <View style={styles.previewWrapper}>
              <Image source={{ uri: decodeURIComponent(file.uri) }} style={styles.previewImage} resizeMode="contain" />
              <Text style={styles.previewName}>{file.name}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpload} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Upload Marksheet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.heading, { marginTop: 32, fontSize: 20, color: isDark ? '#fff' : '#111827' }]}>📚 Uploaded Marksheets</Text>
      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : filtered.length === 0 ? (
        <Text style={{ color: isDark ? '#cbd5e1' : '#6b7280', marginTop: 20, textAlign: 'center' }}>No marksheets found.</Text>
      ) : (
        filtered.map((m) => (
          <View key={m._id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.fileText, { color: isDark ? '#fff' : '#000', marginBottom: 6 }]}>Username: {m.username}</Text>
            <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{new Date(m.createdAt).toLocaleString()}</Text>
            {m.fileUrl && (
              <Image
                source={{ uri: decodeURIComponent(m.fileUrl) }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(m._id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  input: { borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dbeafe', padding: 12, borderRadius: 10, marginBottom: 12
  },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
  card: {
    marginTop: 16, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4, elevation: 2
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb',
    padding: 12, borderRadius: 10, justifyContent: 'center', marginBottom: 16
  },
  uploadBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  fileInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe',
    padding: 10, borderRadius: 8, marginBottom: 20, gap: 10
  },
  fileText: { fontSize: 14, fontWeight: '500' },
  previewWrapper: { alignItems: 'center', marginBottom: 20 },
  previewImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 8 },
  previewName: { fontSize: 13, color: '#64748b' },
  saveBtn: {
    flexDirection: 'row', backgroundColor: '#22c55e',
    padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center'
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  deleteText: { color: '#fff', fontWeight: '600' }
});

export default UploadMarksheet;
