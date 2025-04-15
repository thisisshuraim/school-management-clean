import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const initialData = [
  { id: 1, name: 'Ali Khan', username: 'ali123', class: '5', section: 'A' },
  { id: 2, name: 'Sara Khan', username: 'sara456', class: '5', section: 'A' },
  { id: 3, name: 'John Doe', username: 'john789', class: '4', section: 'B' }
];

const ViewClasses = () => {
  const isDark = useColorScheme() === 'dark';
  const [students, setStudents] = useState(initialData);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newClassSection, setNewClassSection] = useState('');

  const grouped = students.reduce((acc, s) => {
    const key = `${s.class}${s.section}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const openModal = (student) => {
    setSelected(student);
    setNewClassSection(`${student.class}${student.section}`);
    setModalVisible(true);
  };

  const handleMove = () => {
    if (!newClassSection || newClassSection.length < 2) {
      Alert.alert('Invalid Input', 'Please enter a valid class-section (e.g., 6B)');
      return;
    }

    const classPart = newClassSection.slice(0, -1);
    const sectionPart = newClassSection.slice(-1);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === selected.id ? { ...s, class: classPart, section: sectionPart } : s
      )
    );
    setModalVisible(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc' }}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>🏫 View & Manage Classes</Text>

      {Object.keys(grouped).map((key) => (
        <View key={key} style={[styles.classBlock, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
          <Text style={[styles.classTitle, { color: isDark ? '#f1f5f9' : '#1f2937' }]}>Class {key}</Text>
          {grouped[key].map((s) => (
            <TouchableOpacity key={s.id} style={styles.studentRow} onPress={() => openModal(s)}>
              <View>
                <Text style={[styles.studentName, { color: isDark ? '#e2e8f0' : '#111827' }]}>{s.name}</Text>
                <Text style={[styles.username, { color: isDark ? '#94a3b8' : '#6b7280' }]}>{s.username}</Text>
              </View>
              <Ionicons name="swap-horizontal-outline" size={20} color="#3b82f6" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#111827' }]}>Move {selected?.name}</Text>

            <TextInput
              placeholder="Enter new class-section (e.g., 5B)"
              value={newClassSection}
              onChangeText={setNewClassSection}
              placeholderTextColor="#94a3b8"
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moveBtn} onPress={handleMove}>
                <Text style={styles.moveText}>Move</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20
  },
  classBlock: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0'
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600'
  },
  username: {
    fontSize: 13,
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    padding: 24,
    borderRadius: 20,
    elevation: 6
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 14
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 6
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  cancelText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600'
  },
  moveBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  moveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  }
});

export default ViewClasses;