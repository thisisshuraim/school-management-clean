import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  useColorScheme
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

const TIMETABLE_IMAGE =
  'https://placehold.co/1000x700/eeeeee/111111.png?text=Timetable';

const classTeacher = 'Mrs. Fernandes';

const Timetable = () => {
  const isDark = useColorScheme() === 'dark';

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to media library.');
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'timetable.jpg';
      const download = await FileSystem.downloadAsync(TIMETABLE_IMAGE, fileUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Alert.alert('Downloaded', 'Timetable saved to gallery.');
    } catch (err) {
      Alert.alert('Download failed', err.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }
      ]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#111827' }]}>📅 Timetable</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>
        Class Teacher: {classTeacher}
      </Text>

      <Image
        source={{ uri: TIMETABLE_IMAGE }}
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
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20
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

export default Timetable;
