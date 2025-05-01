import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, useColorScheme, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAnnouncements } from '../../utils/api';
import UserContext from '../../context/UserContext';

const AnnouncementsTray = () => {
  const isDark = useColorScheme() === 'dark';
  const { user } = useContext(UserContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements();
      setAnnouncements(res.data);
    } catch {
      Alert.alert('Error', 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <View style={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc', flex: 1 }}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>🔔 Announcements</Text>

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : announcements.length === 0 ? (
        <Text style={{ color: isDark ? '#cbd5e1' : '#6b7280', textAlign: 'center', marginTop: 32 }}>
          No announcements yet.
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {announcements.map((a) => (
            <View key={a._id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <View style={styles.row}>
                <Ionicons name="megaphone-outline" size={24} color={isDark ? '#0ea5e9' : '#2563eb'} />
                <Text style={[styles.message, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>{a.message}</Text>
              </View>

              <View style={styles.footer}>
                <Text style={[styles.meta, { color: isDark ? '#94a3b8' : '#6b7280' }]}>
                  By <Text style={{ fontWeight: '600' }}>{a.createdByName}</Text>
                  {'  '}• Class <Text style={{ fontWeight: '600' }}>{a.classSection}</Text>
                </Text>
                <Text style={[styles.timestamp, { color: isDark ? '#64748b' : '#6b7280' }]}>
                  {new Date(a.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20
  },
  footer: {
    marginTop: 4
  },
  meta: {
    fontSize: 13,
    marginBottom: 2
  },
  timestamp: {
    fontSize: 12,
    fontStyle: 'italic'
  }
});

export default AnnouncementsTray;
