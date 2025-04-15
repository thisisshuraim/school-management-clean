import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TeacherDashboard = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';

  const teacher = {
    name: 'Ms. Meera Joshi',
    subjects: ['Math', 'Science'],
    assignedClasses: ['1B', '5A'],
    classTeacherOf: '5A'
  };

  const tiles = [
    {
      icon: 'people-outline',
      label: 'View Students',
      onPress: () => navigation.navigate('ViewStudents')
    },
    {
      icon: 'cloud-upload-outline',
      label: 'Upload Assignment',
      onPress: () => navigation.navigate('UploadAssignment')
    },
    {
      icon: 'document-text-outline',
      label: 'My Assignments',
      onPress: () => navigation.navigate('MyAssignments')
    }
  ];

  if (teacher.classTeacherOf) {
    tiles.unshift({
      icon: 'calendar-outline',
      label: 'View Timetable',
      onPress: () => navigation.navigate('Timetable')
    });
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }
      ]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#111827' }]}>👩‍🏫 Hello, {teacher.name}</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>Subjects: {teacher.subjects.join(', ')}</Text>
      {teacher.classTeacherOf && (
        <Text style={[styles.subtitle, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>Class Teacher of: {teacher.classTeacherOf}</Text>
      )}

      <View style={styles.grid}>
        {tiles.map((tile, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tile, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
            onPress={tile.onPress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={tile.icon}
              size={28}
              color={isDark ? '#60a5fa' : '#2563eb'}
              style={{ marginBottom: 10 }}
            />
            <Text style={[styles.tileLabel, { color: isDark ? '#f8fafc' : '#111827' }]}> {tile.label} </Text>
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

export default TeacherDashboard;