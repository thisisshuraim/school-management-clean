import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAnnouncements, markAnnouncementRead } from '../../utils/api';
import NotificationContext from '../../context/NotificationContext';

const AnnouncementsTray = () => {
  const isDark = useColorScheme() === 'dark';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setHasUnread } = useContext(NotificationContext);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await getAnnouncements();
      const cleanList = Array.isArray(list) ? list : list?.data || [];

      setAnnouncements(cleanList);

      const unread = cleanList.filter((a) => !a.read);
      await Promise.all(
        unread.map((a) =>
          markAnnouncementRead(a._id).catch((err) =>
            console.warn('Failed to mark read:', a._id)
          )
        )
      );

      setHasUnread(false);
    } catch (err) {
      console.error('Fetch error', err);
      Alert.alert('Error', 'Failed to fetch announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements().then(() => setHasUnread(false));
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={{
        padding: 24,
        backgroundColor: isDark ? '#0f172a' : '#f9fafc',
        flex: 1,
      }}
    >
      <Text
        style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}
      >
        🔔 Announcements
      </Text>

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : announcements.length === 0 ? (
        <Text
          style={{
            color: isDark ? '#cbd5e1' : '#6b7280',
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          No announcements yet.
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {announcements.map((a) => (
            <View
              key={a._id}
              style={[
                styles.card,
                { backgroundColor: isDark ? '#1e293b' : '#fff' },
              ]}
            >
              <View style={styles.row}>
                <Ionicons
                  name="megaphone-outline"
                  size={24}
                  color={isDark ? '#0ea5e9' : '#2563eb'}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? '#f1f5f9' : '#0f172a' },
                    ]}
                  >
                    {a.title}
                  </Text>
                  <Text
                    style={[
                      styles.message,
                      { color: isDark ? '#e2e8f0' : '#1e293b' },
                    ]}
                  >
                    {a.message}
                  </Text>
                </View>
              </View>

              <View style={styles.footer}>
                <Text
                  style={[
                    styles.meta,
                    { color: isDark ? '#94a3b8' : '#6b7280' },
                  ]}
                >
                  By{' '}
                  <Text style={{ fontWeight: '600' }}>{a.createdByName}</Text>{' '}
                  • Class{' '}
                  <Text style={{ fontWeight: '600' }}>{a.classSection}</Text>
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    { color: isDark ? '#64748b' : '#6b7280' },
                  ]}
                >
                  {formatDate(a.createdAt)}
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
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
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  footer: {
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default AnnouncementsTray;
