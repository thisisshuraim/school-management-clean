import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
  LayoutAnimation, Platform, UIManager, useColorScheme, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getStudents, createStudent, updateStudent, deleteStudent, register, deleteUser
} from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ManageStudents = () => {
  const isDark = useColorScheme() === 'dark';

  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', classSection: '', username: '', password: '', userId: null });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newClassSection, setNewClassSection] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    const { id, name, classSection, username, password, userId } = form;
    if (!name || !classSection || !username || (!id && !password)) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }

    try {
      setSaving(true);

      if (id) {
        const payload = { name, classSection, user: userId };
        await updateStudent(id, payload);
      } else {
        const userRes = await register({ username, password, role: 'student' });
        const createdUserId = userRes?.data?._id;
        if (!createdUserId) throw new Error('User creation failed');

        const studentPayload = { name, classSection, user: createdUserId };
        await createStudent(studentPayload);
      }

      await fetchStudents();
      setForm({ id: null, name: '', classSection: '', username: '', password: '', userId: null });
      setShowForm(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || '';
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        Alert.alert('Username Exists', 'This username is already taken.');
      } else {
        Alert.alert('Error', msg || 'Failed to save student');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setForm({
      id: student._id,
      name: student.name || '',
      classSection: student.classSection || '',
      username: student.user?.username || '',
      password: '',
      userId: student.user?._id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      await deleteStudent(id);
      await fetchStudents();
    } catch {
      Alert.alert('Error', 'Failed to delete student');
    }
  };

  const handleMove = async () => {
    if (!newClassSection || !selectedStudent) return;
    try {
      await updateStudent(selectedStudent._id, { classSection: newClassSection, user: selectedStudent.user?._id });
      setMoveModalVisible(false);
      setSelectedStudent(null);
      setNewClassSection('');
      fetchStudents();
    } catch (err) {
      Alert.alert('Error', 'Failed to move student');
    }
  };

  const filtered = students.filter((s) =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.user?.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, s) => {
    const key = s.classSection;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc', flexGrow: 1 }}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>👦 Manage Students</Text>

      <TextInput
        placeholder="Search by name or username"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity style={styles.accordionHeader} onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowForm(!showForm);
      }}>
        <Text style={styles.accordionTitle}>{form.id ? 'Edit Student' : 'Add New Student'}</Text>
        <Ionicons name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#2563eb" />
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {['name', 'classSection', 'username', 'password'].map((field) => (
            <TextInput
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
              value={form[field] || ''}
              secureTextEntry={field === 'password'}
              onChangeText={(text) => setForm({ ...form, [field]: text })}
            />
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name={form.id ? 'create-outline' : 'person-add-outline'} size={18} color="#fff" />}
            <Text style={styles.addBtnText}>{form.id ? 'Update' : 'Add Student'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {Object.keys(grouped).length === 0 ? (
        <Text style={{ textAlign: 'center', color: isDark ? '#94a3b8' : '#6b7280', marginTop: 20 }}>
          No students found.
        </Text>
      ) : (
        Object.keys(grouped).map((section) => (
          <View key={section} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 12, color: isDark ? '#f8fafc' : '#1e293b' }}>Class {section}</Text>
            {grouped[section].map((student) => (
              <View key={student._id} style={styles.studentRow}>
                <View>
                  <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#000' }}>{student.name}</Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 'bold', fontStyle: 'italic' }}>@{student.user?.username}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(student)}>
                    <Ionicons name="create-outline" size={20} color="#0ea5e9" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    Alert.alert(
                      'Confirm Deletion',
                      'Are you sure you want to delete this student?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(student._id) }
                      ]
                    );
                  }}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setSelectedStudent(student);
                    setNewClassSection(student.classSection);
                    setMoveModalVisible(true);
                  }}>
                    <Ionicons name="swap-horizontal-outline" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))
      )}

      <Modal
        visible={moveModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#111827' }]}>Move {selectedStudent?.name}</Text>
            <TextInput
              placeholder="Enter new class-section (e.g., 5B)"
              value={newClassSection}
              onChangeText={setNewClassSection}
              placeholderTextColor="#94a3b8"
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setMoveModalVisible(false)}>
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
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dbeafe', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 10, marginBottom: 12
  },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
  card: {
    borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, elevation: 2
  },
  studentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12
  },
  actions: { flexDirection: 'row', gap: 12 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center'
  },
  modalBox: {
    width: '85%', padding: 24, borderRadius: 20, elevation: 6
  },
  modalTitle: {
    fontSize: 20, fontWeight: '700', marginBottom: 20
  },
  modalActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 6
  },
  cancelBtn: {
    paddingVertical: 10, paddingHorizontal: 16
  },
  cancelText: {
    fontSize: 15, color: '#6b7280', fontWeight: '600'
  },
  moveBtn: {
    backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10
  },
  moveText: {
    color: '#fff', fontSize: 15, fontWeight: '600'
  },
  addBtn: {
    flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 12,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 6 }
});

export default ManageStudents;
