import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, useColorScheme, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMyTeacherProfile, getMyStudentProfile } from '../../utils/api';
import UserContext from '../../context/UserContext';

const SharedDashboard = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const { user, profile, setProfile } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (user.role === 'teacher') {
          const res = await getMyTeacherProfile();
          setProfile(res.data);
        } else if (user.role === 'student') {
          const res = await getMyStudentProfile();
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Error loading profile info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [user]);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#2563eb" />;

  const isAdmin = user.role === 'admin';
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  const tiles = [];

  if (isAdmin) {
    tiles.push(
      { icon: 'people-outline', label: 'Students', screen: 'ManageStudents' },
      { icon: 'school-outline', label: 'Teachers', screen: 'ManageTeachers' },
      { icon: 'calendar-outline', label: 'Timetable', screen: 'ManageTimetable' },
      { icon: 'clipboard-outline', label: 'Marksheets', screen: 'UploadMarksheet' },
      { icon: 'document-text-outline', label: 'Assignments', screen: 'Assignments' },
      { icon: 'videocam-outline', label: 'Lectures', screen: 'AllLectures' },
      { icon: 'notifications-outline', label: 'Announcements', screen: 'UploadAnnouncement' }
    );
  } else if (isTeacher) {
    tiles.push(
      { icon: 'people-outline', label: 'Students', screen: 'ViewStudents' },
      { icon: 'document-text-outline', label: 'Assignments', screen: 'Assignments' },
      { icon: 'videocam-outline', label: 'Lectures', screen: 'AllLectures' },
      { icon: 'notifications-outline', label: 'Announcements', screen: 'UploadAnnouncement' }
    );
    if (profile?.classTeacher) {
      tiles.unshift({ icon: 'calendar-outline', label: 'Timetable', screen: 'Timetable' });
    }
  } else if (isStudent) {
    tiles.push(
      { icon: 'calendar-outline', label: 'Timetable', screen: 'Timetable' },
      { icon: 'document-text-outline', label: 'Assignments', screen: 'Assignments' },
      { icon: 'clipboard-outline', label: 'Marksheet', screen: 'Marksheets' },
      { icon: 'videocam-outline', label: 'Lectures', screen: 'AllLectures' }
    );
  }
  tiles.unshift({ icon: 'calendar-number-outline', label: 'Calendar', screen: 'Calendar' })

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#111827' }]}>
        Hi, {isAdmin ? 'Admin' : profile?.name || user.username}
      </Text>

      {isTeacher && (
        <>
          <Text style={[styles.subtitle, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>
            Subjects: {profile?.subjects?.join(', ')}
          </Text>
          {profile?.classTeacher && (
            <Text style={[styles.subtitle, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>
              Class Teacher of: {profile?.classTeacherClass}
            </Text>
          )}
        </>
      )}

      {isStudent && (
        <Text style={[styles.subtitle, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>
          Class: {profile?.classSection}
        </Text>
      )}

      <View style={styles.listContainer}>
        {tiles.map((tile, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                shadowColor: isDark ? '#000' : '#d1d5db'
              }
            ]}
            onPress={() => navigation.navigate(tile.screen)}
            activeOpacity={0.9}
          >
            <View style={styles.iconTextRow}>
              <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#334155' : '#e0f2fe' }]}>
                <Ionicons name={tile.icon} size={22} color={isDark ? '#60a5fa' : '#2563eb'} />
              </View>
              <Text style={[styles.cardLabel, { color: isDark ? '#f1f5f9' : '#111827' }]}>
                {tile.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#94a3b8' : '#9ca3af'} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
          onPress={() => {
            Linking.openURL('https://facebook.com/profile.php?id=61550218709493');
          }}
        >
          <Ionicons name="logo-facebook" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.socialText}>Like us on Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: '#FBBF24' }]}
          onPress={() => {
            Linking.openURL('https://play.google.com/store/apps/details?id=com.stanthonyschool');
          }}
        >
          <Ionicons name="star-outline" size={18} color="#000" style={{ marginRight: 8 }} />
          <Text style={[styles.socialText, { color: '#000' }]}>Rate our app</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 20,
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
    marginBottom: 16
  },
  listContainer: {
    marginTop: 20
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  footerButtons: {
    marginTop: 20,
    gap: 12
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  socialText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  }
});

export default SharedDashboard;
