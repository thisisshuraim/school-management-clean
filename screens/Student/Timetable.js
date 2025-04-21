import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
  useColorScheme, Image, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMyTimetable } from '../../utils/api';

const Timetable = () => {
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timetable, setTimetable] = useState(null);

  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyTimetable();
      setTimetable(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Timetable not available';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleDownload = () => {
    if (timetable?.fileUrl) {
      Linking.openURL(decodeURIComponent(timetable.fileUrl));
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📅 Timetable</Text>

      {loading && <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />}

      {!loading && error && (
        <View style={styles.fallback}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && timetable && (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>
            Class: {timetable.classSection}
          </Text>

          <Image
            source={{ uri: decodeURIComponent(timetable.fileUrl) }}
            style={styles.image}
            resizeMode="contain"
          />

          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  errorText: { textAlign: 'center', fontSize: 16, color: '#ef4444', marginTop: 12 },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 20
  },
  card: {
    borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2
  },
  meta: { fontSize: 14, marginBottom: 8 },
  downloadBtn: {
    flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center',
    marginTop: 12, padding: 12, backgroundColor: '#2563eb', borderRadius: 10
  },
  downloadText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  image: {
    width: '100%', height: 300, borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb', marginTop: 12
  }
});

export default Timetable;
