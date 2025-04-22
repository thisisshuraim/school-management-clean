import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  LayoutAnimation, Platform, UIManager, useColorScheme,
  ActivityIndicator, Modal, FlatList, Switch, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getStudents, createStudent, updateStudent, deleteStudent,
  register, updateUser, deleteUser
} from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ManageStudents = () => {
  const isDark = useColorScheme() === 'dark';

  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', classSection: '', username: '', password: '', userId: null, isBlocked: false });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [groupVisibleCounts, setGroupVisibleCounts] = useState({});

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    const { id, name, classSection, username, password, isBlocked } = form;
    if (!name || !classSection || !username || (!id && !password)) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }

    try {
      setSaving(true);
      if (id) {
        const userId = students.find(s => s?._id === id)?.user._id;
        await updateUser(userId, { username, password, role: 'student', isBlocked });
        await updateStudent(id, { name, classSection, user: userId });
      } else {
        const userRes = await register({ username, password, role: 'student', isBlocked });
        const createdUserId = userRes?.data?._id;
        if (!createdUserId) throw new Error('User creation failed');
        await createStudent({ name, classSection, user: createdUserId });
      }

      await fetchStudents();
      resetForm();
      setEditModalVisible(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || '';
      Alert.alert(msg.includes('duplicate key') || msg.includes('E11000') ? 'Username Exists' : 'Error', msg);
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
      userId: student.user?._id || '',
      isBlocked: student.user?.isBlocked || false
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (userId, studentId) => {
    try {
      await deleteUser(userId);
      await deleteStudent(studentId);
      await fetchStudents();
    } catch {
      Alert.alert('Error', 'Failed to delete student');
    }
  };

  const resetForm = () => setForm({ id: null, name: '', classSection: '', username: '', password: '', userId: null, isBlocked: false });

  const filtered = students.filter((s) =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.user?.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, student) => {
    const key = student.classSection || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(student);
    return acc;
  }, {});

  const handleLoadMore = (classSection) => {
    setGroupVisibleCounts(prev => ({
      ...prev,
      [classSection]: (prev[classSection] || 5) + 5
    }));
  };

  const renderStudentItem = (student) => (
    <View key={student._id} style={styles.studentRow}>
      <View>
        <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#000' }}>
          {student.name} {student.user?.isBlocked && <Text style={{ color: '#ef4444' }}>(Blocked)</Text>}
        </Text>
        <Text style={{ color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 'bold', fontStyle: 'italic' }}>@{student.user?.username}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(student)}>
          <Ionicons name="create-outline" size={20} color="#0ea5e9" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Confirm Deletion', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => handleDelete(student.user?._id, student._id) }
        ])}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f9fafc' }} contentContainerStyle={{ padding: 24 }}>
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
        <Text style={styles.accordionTitle}>Add New Student</Text>
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
              value={form[field]}
              secureTextEntry={field === 'password'}
              onChangeText={(text) => setForm({ ...form, [field]: text })}
            />
          ))}
          <View style={styles.switchRow}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>Blocked</Text>
            <Switch value={form.isBlocked} onValueChange={(val) => setForm({ ...form, isBlocked: val })} />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name='person-add-outline' size={18} color="#fff" />}
            <Text style={styles.addBtnText}>Add Student</Text>
          </TouchableOpacity>
        </View>
      )}

      {Object.keys(grouped).map((classSection) => {
        const visible = groupVisibleCounts[classSection] || 5;
        const groupStudents = grouped[classSection].slice(0, visible);
        const hasMore = grouped[classSection].length > visible;

        return (
          <View key={classSection} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.classHeader, { color: isDark ? '#fff' : '#111827' }]}>Class {classSection}</Text>
            {groupStudents.map(renderStudentItem)}
            {hasMore && (
              <TouchableOpacity onPress={() => handleLoadMore(classSection)} style={{ marginTop: 8 }}>
                <Text style={{ color: '#2563eb', fontWeight: '600' }}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEditModalVisible(false);
          resetForm();
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => {
            setEditModalVisible(false);
            resetForm();
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
          >
            <TouchableOpacity style={styles.closeIcon} onPress={() => {
              setEditModalVisible(false);
              resetForm();
            }}>
              <Ionicons name="close" size={24} color="#ef4444" />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#111827' }]}>Edit Student</Text>
            {['name', 'classSection', 'username', 'password'].map((field) => (
              <TextInput
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
                value={form[field]}
                secureTextEntry={field === 'password'}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
              />
            ))}
            <View style={styles.switchRow}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>Blocked</Text>
              <Switch value={form.isBlocked} onValueChange={(val) => setForm({ ...form, isBlocked: val })} />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name='create-outline' size={18} color="#fff" />}
              <Text style={styles.addBtnText}>Update Student</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 },
  card: {
    borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, elevation: 2
  },
  classHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dbeafe', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 10, marginBottom: 12
  },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
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
  closeIcon: {
    position: 'absolute', top: 10, right: 10, zIndex: 10
  },
  addBtn: {
    flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 12,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }
});

export default ManageStudents;