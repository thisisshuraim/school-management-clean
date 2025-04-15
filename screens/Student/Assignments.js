import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const assignmentData = {
  Math: {
    teacher: 'Mrs. Sharma',
    assignments: [
      {
        id: 1,
        title: 'Algebra Practice',
        issued: 'Apr 10, 2024',
        deadline: 'Apr 18, 2024'
      }
    ]
  },
  Science: {
    teacher: 'Mr. Khan',
    assignments: [
      {
        id: 2,
        title: 'Photosynthesis Diagram',
        issued: 'Apr 14, 2024',
        deadline: 'Apr 21, 2024'
      }
    ]
  },
  English: {
    teacher: 'Ms. Das',
    assignments: [
      {
        id: 3,
        title: 'Essay on Climate Change',
        issued: 'Apr 11, 2024',
        deadline: 'Apr 19, 2024'
      }
    ]
  }
};

const subjectColors = {
  Math: '#4f46e5',
  Science: '#10b981',
  English: '#f97316'
};

const Assignments = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [expanded, setExpanded] = useState(null);

  const toggleSection = (subject) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => (prev === subject ? null : subject));
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#111' : '#f9fafc' }
      ]}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111' }]}>
        📂 Assignments
      </Text>

      {Object.entries(assignmentData).map(([subject, data]) => {
        const subjectColor = subjectColors[subject] || '#3b82f6';
        return (
          <View key={subject} style={styles.subjectBlock}>
            <TouchableOpacity
              onPress={() => toggleSection(subject)}
              style={[
                styles.subjectHeader,
                {
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderLeftColor: subjectColor
                }
              ]}
              activeOpacity={0.8}
            >
              <View>
                <Text style={[styles.subjectTitle, { color: isDark ? '#f8fafc' : '#111827' }]}>
                  {subject}
                </Text>
                <Text style={[styles.teacherText, { color: isDark ? '#94a3b8' : '#6b7280' }]}>
                  Teacher: {data.teacher}
                </Text>
              </View>
              <Ionicons
                name={expanded === subject ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#94a3b8' : '#6b7280'}
              />
            </TouchableOpacity>

            {expanded === subject && (
              <View style={styles.assignmentsList}>
                {data.assignments.map((assignment) => (
                  <View
                    key={assignment.id}
                    style={[
                      styles.card,
                      { backgroundColor: isDark ? '#0f172a' : '#ffffff' }
                    ]}
                  >
                    <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#111827' }]}>
                      {assignment.title}
                    </Text>

                    <View style={styles.tagsRow}>
                      <View style={[styles.tag, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                        <Ionicons name="calendar-outline" size={14} color={isDark ? '#f8fafc' : '#1e293b'} />
                        <Text style={[styles.tagText, { color: isDark ? '#f1f5f9' : '#1e293b' }]}>
                          {assignment.issued}
                        </Text>
                      </View>
                      <View style={[styles.tag, { backgroundColor: isDark ? '#4b5563' : '#fef3c7' }]}>
                        <Ionicons name="alarm-outline" size={14} color={isDark ? '#fcd34d' : '#92400e'} />
                        <Text style={[styles.tagText, { color: isDark ? '#fef08a' : '#92400e' }]}>
                          {assignment.deadline}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.downloadBtn}>
                      <MaterialCommunityIcons name="file-pdf-box" size={18} color="#fff" />
                      <Text style={styles.downloadText}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24
  },
  subjectBlock: {
    marginBottom: 16
  },
  subjectHeader: {
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  teacherText: {
    fontSize: 13,
    marginTop: 2
  },
  assignmentsList: {
    marginTop: 12,
    gap: 12
  },
  card: {
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999
  },
  tagText: {
    fontSize: 13,
    marginLeft: 6
  },
  downloadBtn: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  downloadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
});

export default Assignments;
