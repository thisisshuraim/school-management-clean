import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, Image, LayoutAnimation, Platform, UIManager,
  useColorScheme, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  uploadMarksheet,
  getMarksheets,
  deleteMarksheet
} from '../../utils/api';
import { Linking } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PAGE_SIZE = 5;

const UploadMarksheet = () => {
  const isDark = useColorScheme() === 'dark';
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [marksheets, setMarksheets] = useState([]);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      Alert.alert('Missing Info', 'Please enter username and pick a file.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('username', username);
      formData.append('file', file);
      await uploadMarksheet(formData);
      Alert.alert('Success', `Marksheet uploaded for ${username}`);
      setUsername('');
      setFile(null);
      setShowForm(false);
      fetchMarksheets();
    } catch (err) {
      Alert.alert('Upload Failed', err?.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMarksheet(id);
            fetchMarksheets();
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        }
      }
    ]);
  };

  const handleDownload = (url) => {
    const fullUrl = url.startsWith('http')
      ? url
      : `https://school-management-backend-uciz.onrender.com/${url.replace(/^\/?/, '')}`;
    Linking.openURL(encodeURI(fullUrl));
  };

  const grouped = marksheets
    .filter(m => m.username?.toLowerCase().includes(search.toLowerCase()))
    .reduce((acc, m) => {
      const key = m.classSection || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {});

  const loadMore = (groupKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCounts(prev => ({
      ...prev,
      [groupKey]: (prev[groupKey] || PAGE_SIZE) + PAGE_SIZE
    }));
  };

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
          <TextInput
            placeholder="Student Username"
            placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
            style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
            value={username}
            onChangeText={setUsername}
          />

          <TouchableOpacity style={styles.uploadBtn} onPress={handlePickFile}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadText}>{file ? 'Change File' : 'Pick File'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpload} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Upload Marksheet</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : (
        Object.keys(grouped).map(groupKey => {
          const visible = visibleCounts[groupKey] || PAGE_SIZE;
          const hasMore = grouped[groupKey].length > visible;
          return (
            <View key={groupKey} style={styles.groupCard}>
              <Text style={styles.groupTitle}>Class {groupKey}</Text>
              {grouped[groupKey].slice(0, visible).map(m => (
                <View key={m._id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                  <Text style={[styles.assignmentTitle, { color: isDark ? '#fff' : '#000' }]}>
                    {m.fullName || 'Unnamed'} (@{m.username})
                  </Text>
                  {m.fileUrl && (
                    <TouchableOpacity onPress={() => handleDownload(m.fileUrl)}>
                      <Image source={{ uri: decodeURIComponent(m.fileUrl) }} style={styles.previewImage} resizeMode="contain" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(m._id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {hasMore && (
                <TouchableOpacity onPress={() => loadMore(groupKey)} style={{ marginTop: 6 }}>
                  <Text style={{ color: '#2563eb', fontWeight: '600' }}>Load More</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: { borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dbeafe', padding: 12, borderRadius: 10, marginBottom: 12
  },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb',
    padding: 12, borderRadius: 10, justifyContent: 'center', marginBottom: 12
  },
  uploadText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 },
  saveBtn: {
    backgroundColor: '#22c55e', padding: 14,
    borderRadius: 12, alignItems: 'center'
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4, elevation: 2
  },
  groupCard: { marginBottom: 24 },
  groupTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#2563eb' },
  assignmentTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  previewImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 12 },
  deleteBtn: {
    backgroundColor: '#ef4444', paddingVertical: 10,
    borderRadius: 8, alignItems: 'center'
  },
  deleteText: { color: '#fff', fontWeight: '600' }
});

export default UploadMarksheet;
