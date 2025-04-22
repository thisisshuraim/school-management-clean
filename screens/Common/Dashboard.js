import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, useColorScheme
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
      { icon: 'videocam-outline', label: 'Lectures', screen: 'AllLectures' }
    );
  } else if (isTeacher) {
    tiles.push(
      { icon: 'people-outline', label: 'Students', screen: 'ViewStudents' },
      { icon: 'document-text-outline', label: 'Assignments', screen: 'Assignments' },
      { icon: 'videocam-outline', label: 'Lectures', screen: 'AllLectures' }
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

      <View style={styles.grid}>
        {tiles.map((tile, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tile, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
            onPress={() => navigation.navigate(tile.screen)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={tile.icon}
              size={28}
              color={isDark ? '#60a5fa' : '#2563eb'}
              style={{ marginBottom: 10 }}
            />
            <Text style={[styles.tileLabel, { color: isDark ? '#f8fafc' : '#111827' }]}>{tile.label}</Text>
          </TouchableOpacity>
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  tile: {
    width: '48%',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center'
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center'
  }
});

export default SharedDashboard;
