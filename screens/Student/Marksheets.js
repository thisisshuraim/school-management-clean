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
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { getMyStudentMarksheet } from '../../utils/api';

const Marksheets = () => {
  const isDark = useColorScheme() === 'dark';
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarksheet = async () => {
      try {
        const res = await getMyStudentMarksheet();
        const [latest] = res.data;
        setMarksheet(latest || null);
      } catch (err) {
        console.error('Failed to load marksheet:', err);
        Alert.alert('Error', 'Unable to load your marksheet.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarksheet();
  }, []);

  const handleDownload = async () => {
    if (!marksheet) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to media library.');
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'marksheet.jpg';
      const download = await FileSystem.downloadAsync(marksheet.fileUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Alert.alert('Downloaded', 'Marksheet saved to gallery.');
    } catch (err) {
      Alert.alert('Download failed', err.message);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#2563eb" />;
  }

  if (!marksheet) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: isDark ? '#fff' : '#111827', fontSize: 16 }}>No marksheet available yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }
      ]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#111827' }]}>🧾 Marksheet</Text>

      <Image
        source={{ uri: marksheet.fileUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <TouchableOpacity style={styles.button} onPress={handleDownload}>
        <Ionicons name="download-outline" size={18} color="#fff" />
        <Text style={styles.buttonText}>Download</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  image: {
    width: '100%',
    aspectRatio: 1000 / 700,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: '#e5e7eb'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default Marksheets;
