import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  uploadTimetable,
  getTimetable,
  deleteTimetable
} from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ManageTimetable = () => {
  const isDark = useColorScheme() === 'dark';
  const [className, setClassName] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [timetables, setTimetables] = useState([]);

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
      mediaTypes: [ImagePicker.MediaType.IMAGE],
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
      formData.append('file', {
        uri: timetable.uri,
        name: timetable.name,
        type: timetable.type
      });

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

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this timetable?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteTimetable(id);
            fetchTimetables();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete timetable');
          }
        }
      }
    ]);
  };

  const filtered = timetables.filter((t) =>
    t.classSection.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>🗓 Manage Timetables</Text>

      <TextInput
        placeholder="Search class (e.g., 5A)"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }]}
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
            style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }]}
            placeholder="Class (e.g., 5A)"
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={className}
            onChangeText={setClassName}
          />
          <TouchableOpacity style={styles.btn} onPress={pickTimetable}>
            <Text style={styles.btnText}>{timetable ? timetable.name : 'Pick Timetable Image'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.heading, { marginTop: 32, fontSize: 20, color: isDark ? '#fff' : '#111827' }]}>📚 Existing Timetables</Text>
      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : filtered.length === 0 ? (
        <Text style={{ color: isDark ? '#cbd5e1' : '#6b7280', marginTop: 20, textAlign: 'center' }}>No timetables available.</Text>
      ) : (
        filtered.map((item) => (
          <View key={item._id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.classLabel, { color: isDark ? '#fff' : '#000' }]}>Class: {item.classSection}</Text>
            <Image source={{ uri: decodeURIComponent(item.fileUrl) }} style={styles.image} />
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  card: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2
  },
  classLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600'
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563eb'
  }
});

export default ManageTimetable;
