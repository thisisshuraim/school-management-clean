import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  TextInput,
  Modal,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockAssignments = {
  'Math - 1B': [
    {
      id: 1,
      title: 'Algebra Practice',
      issued: 'Apr 10, 2024',
      deadline: 'Apr 18, 2024',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ],
  'Science - 5A': [
    {
      id: 2,
      title: 'Plant Cell Diagram',
      issued: 'Apr 14, 2024',
      deadline: 'Apr 21, 2024',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ]
};

const MyAssignments = () => {
  const isDark = useColorScheme() === 'dark';
  const [editing, setEditing] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const handleEdit = (assignment) => {
    setEditing(assignment);
    setNewTitle(assignment.title);
    setNewDeadline(assignment.deadline);
  };

  const handleSave = () => {
    Alert.alert('Updated', 'Assignment details updated');
    setEditing(null);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f9fafc' }
      ]}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📄 My Assignments</Text>

      {Object.entries(mockAssignments).map(([group, list]) => (
        <View key={group} style={styles.groupBlock}>
          <Text style={[styles.groupTitle, { color: isDark ? '#f8fafc' : '#111827' }]}>{group}</Text>

          {list.map((a) => (
            <View key={a.id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
              <Text style={[styles.title, { color: isDark ? '#f1f5f9' : '#111827' }]}>{a.title}</Text>
              <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>Issued: {a.issued}</Text>
              <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>Deadline: {a.deadline}</Text>

              <View style={{ flexDirection: 'row', marginTop: 8, gap: 16 }}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(a)}>
                  <Ionicons name="pencil-outline" size={16} color="#2563eb" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    Alert.alert('Download', `Opening: ${a.fileUrl}`);
                    Linking.openURL(a.fileUrl);
                  }}
                >
                  <Ionicons name="download-outline" size={16} color="#16a34a" />
                  <Text style={[styles.editText, { color: '#16a34a' }]}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ))}

      <Modal visible={!!editing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.modalHeading, { color: isDark ? '#fff' : '#111' }]}>Edit Assignment</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Title"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            />
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
              value={newDeadline}
              onChangeText={setNewDeadline}
              placeholder="Deadline (e.g., Apr 21, 2024)"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={handleSave}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} onPress={() => setEditing(null)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  groupBlock: {
    marginBottom: 24
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6
  },
  meta: {
    fontSize: 13,
    marginBottom: 4
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  editText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCard: {
    width: '90%',
    borderRadius: 16,
    padding: 20
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16
  },
  input: {
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default MyAssignments;
