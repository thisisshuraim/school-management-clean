
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme,
  Alert, ActivityIndicator, Image, LayoutAnimation, Platform, UIManager,
  FlatList, Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadTimetable, getTimetable, deleteTimetable } from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PAGE_SIZE = 5;

const ManageTimetable = () => {
  const isDark = useColorScheme() === 'dark';
  const [className, setClassName] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await getTimetable();
      setTimetables(res.data);
    } catch (err) {
      console.error('Fetch error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const pickTimetable = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload timetable.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setTimetable({
        uri: asset.uri,
        name: asset.fileName || 'timetable.jpg',
        type: asset.mimeType || 'image/jpeg'
      });
    }
  };

  const handleUpload = async () => {
    if (!className || !timetable) {
      Alert.alert('Missing', 'Please select a class and timetable image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('classSection', className);
      formData.append('file', timetable);
      await uploadTimetable(formData);
      Alert.alert('Success', `Timetable for class ${className} uploaded.`);
      setClassName('');
      setTimetable(null);
      setShowForm(false);
      fetchTimetables();
    } catch (err) {
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteTimetable(id);
            fetchTimetables();
          } catch {
            Alert.alert('Error', 'Failed to delete timetable');
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

  const filtered = timetables.filter((t) =>
    t.classSection.toLowerCase().includes(search.toLowerCase())
  );

  const loadMore = () => {
    if (visibleCount < filtered.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setVisibleCount(prev => prev + PAGE_SIZE);
    }
  };

  const renderItem = ({ item }) => (
    <View key={item._id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
      <View style={styles.header}>
        <Ionicons name="grid-outline" size={24} color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={{ fontWeight: '700', color: isDark ? '#fff' : '#000' }}>Class {item.classSection}</Text>
      </View>
      {item.fileUrl && (
        <TouchableOpacity onPress={() => handleDownload(item.fileUrl)}>
          <Image source={{ uri: decodeURIComponent(item.fileUrl) }} style={styles.previewImage} resizeMode="contain" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📅 Manage Timetables</Text>
      <TextInput
        placeholder="Search by class"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
        value={search}
        onChangeText={setSearch}
      />
      <TouchableOpacity style={styles.accordionHeader} onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowForm(!showForm);
      }}>
        <Text style={styles.accordionTitle}>{showForm ? 'Close Upload Form' : 'Upload New Timetable'}</Text>
        <Text style={{ fontSize: 18, color: '#2563eb' }}>{showForm ? '−' : '+'}</Text>
      </TouchableOpacity>
      {showForm && (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <TextInput
            placeholder="Class (e.g., 5A)"
            placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
            style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
            value={className}
            onChangeText={setClassName}
          />
          <TouchableOpacity style={styles.uploadBtn} onPress={pickTimetable}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadText}>{timetable ? 'Change File' : 'Pick File'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleUpload} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Upload Timetable</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : (
        <FlatList
          data={filtered.slice(0, visibleCount)}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: { borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb',
    padding: 12, borderRadius: 10, justifyContent: 'center', marginBottom: 16
  },
  uploadText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  saveBtn: {
    backgroundColor: '#22c55e', padding: 14,
    borderRadius: 12, alignItems: 'center'
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  previewImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 12 },
  deleteBtn: {
    backgroundColor: '#ef4444', paddingVertical: 10,
    borderRadius: 8, alignItems: 'center'
  },
  deleteText: { color: '#fff', fontWeight: '600' },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dbeafe', padding: 12, borderRadius: 10, marginBottom: 12
  },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: '#2563eb' }
});

export default ManageTimetable;