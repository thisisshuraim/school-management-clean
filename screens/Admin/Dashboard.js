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

const AdminDashboard = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';

  const tiles = [
    {
      icon: 'people-outline',
      label: 'Manage Students',
      onPress: () => navigation.navigate('ManageStudents')
    },
    {
      icon: 'school-outline',
      label: 'Manage Teachers',
      onPress: () => navigation.navigate('ManageTeachers')
    },
    {
      icon: 'calendar-outline',
      label: 'Upload Timetable',
      onPress: () => navigation.navigate('ManageTimetable')
    },
    {
      icon: 'document-text-outline',
      label: 'Upload Marksheet',
      onPress: () => navigation.navigate('UploadMarksheet')
    },
    {
      icon: 'albums-outline',
      label: 'View Classes',
      onPress: () => navigation.navigate('ViewClasses')
    },
    {
      icon: 'documents-outline',
      label: 'All Assignments',
      onPress: () => navigation.navigate('AllAssignments')
    }
  ];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }
      ]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#111827' }]}>🧑‍💼 Admin Dashboard</Text>

      <View style={styles.grid}>
        {tiles.map((tile, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tile, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
            onPress={tile.onPress}
            activeOpacity={0.85}
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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24
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

export default AdminDashboard;