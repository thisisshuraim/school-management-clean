import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTeacherStudents } from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ViewStudents = () => {
  const isDark = useColorScheme() === 'dark';
  const [expandedClass, setExpandedClass] = useState(null);
  const [studentsByClass, setStudentsByClass] = useState({});

  const toggleClass = (className) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedClass(prev => (prev === className ? null : className));
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getTeacherStudents();
        const grouped = res.data.reduce((acc, s) => {
          const key = s.classSection;
          if (!acc[key]) acc[key] = [];
          acc[key].push(s);
          return acc;
        }, {});
        setStudentsByClass(grouped);
      } catch (err) {
        console.error('Failed to load students');
      }
    })();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }]}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>👥 Assigned Class Students</Text>

      {Object.entries(studentsByClass).map(([className, students]) => (
        <View key={className} style={styles.classBlock}>
          <TouchableOpacity
            onPress={() => toggleClass(className)}
            style={[styles.classHeader, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}
          >
            <Text style={[styles.classTitle, { color: isDark ? '#f8fafc' : '#111827' }]}>Class {className}</Text>
            <Ionicons
              name={expandedClass === className ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={isDark ? '#94a3b8' : '#6b7280'}
            />
          </TouchableOpacity>

          <View style={[styles.studentList, { height: expandedClass === className ? 'auto' : 0, overflow: 'hidden' }]}>
            {expandedClass === className && students.map((student) => (
              <View key={student._id} style={styles.studentRow}>
                <Ionicons name="person-circle-outline" size={18} color={isDark ? '#cbd5e1' : '#6b7280'} />
                <Text style={[styles.studentName, { color: isDark ? '#f8fafc' : '#111827' }]}> {student.name} </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    flexGrow: 1
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  classBlock: {
    marginBottom: 16
  },
  classHeader: {
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  studentList: {
    marginTop: 12,
    gap: 10,
    paddingHorizontal: 12
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  studentName: {
    fontSize: 15
  }
});

export default ViewStudents;
