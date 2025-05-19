import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getCalendar, uploadCalendar } from '../../utils/api';
import UserContext from '../../context/UserContext';

const Calendar = () => {
  const isDark = useColorScheme() === 'dark';
  const { user } = useContext(UserContext);
  const role = user.role;
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await getCalendar();
        setCalendar(res.data || null);
      } catch (err) {
        console.error('Failed to load calendar:', err);
        Alert.alert('Error', 'Unable to load the calendar.');
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        const asset = result.assets[0];

        // Extract file details
        const localUri = asset.uri;
        const filename = asset.fileName || localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : 'jpg';

        // Mime type determination
        let mimeType = asset.type || `image/${ext}`;
        if (ext === 'jpg') mimeType = 'image/jpeg';

        // Create FormData object
        const formData = new FormData();
        formData.append('file', {
          uri: localUri,
          name: filename,
          type: mimeType,
        });

        // Upload the file
        await uploadCalendar(formData);
        Alert.alert('Success', 'Calendar image uploaded successfully.');

        // Refresh calendar after upload
        const res = await getCalendar();
        setCalendar(res.data || null);
      }
    } catch (err) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { flex: 1 }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!calendar) {
    return (
      <View style={[styles.centered, { flex: 1, paddingHorizontal: 24 }]}>
        <Ionicons name="calendar-outline" size={80} color={isDark ? '#555' : '#ccc'} />
        <Text style={[styles.emptyText, { color: isDark ? '#aaa' : '#444' }]}>
          No calendar available yet.
        </Text>
        {role === 'admin' && (
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} activeOpacity={0.7}>
            <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Calendar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#111827' }]}>📅 Calendar</Text>

      <Image source={{ uri: calendar.fileUrl }} style={styles.image} resizeMode="cover" />

      {role === 'admin' && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
          activeOpacity={0.7}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Uploading...' : 'Upload/Replace'}
          </Text>
        </TouchableOpacity>
      )}

      {calendar.fileUrl && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => Linking.openURL(calendar.fileUrl)}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-download-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.uploadButtonText}>Download Calendar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24
  },
  image: {
    width: '100%',
    aspectRatio: 1000 / 700,
    borderRadius: 14,
    marginBottom: 24,
    backgroundColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center'
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    marginTop: 12
  }
});

export default Calendar;
