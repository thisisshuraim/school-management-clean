import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
  LayoutAnimation, Platform, UIManager, useColorScheme, ActivityIndicator, Switch
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  getTeachers, createTeacher, updateTeacher, deleteTeacher, register, deleteUser
} from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ManageTeachers = () => {
  const isDark = useColorScheme() === 'dark';

  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    subjects: '',
    classes: '',
    classTeacher: false,
    classTeacherClass: '',
    username: '',
    password: '',
    userId: null
  });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const PAGE_SIZE = 5;

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await getTeachers();
      setTeachers(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    const { id, name, subjects, classes, classTeacher, classTeacherClass, username, password, userId } = form;
    if (!name || !subjects || !classes || !username || (!id && !password)) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }
    if (classTeacher && !classTeacherClass) {
      Alert.alert('Missing field', 'Please enter the class for Class Teacher role.');
      return;
    }

    try {
      setSaving(true);

      const subjectArr = subjects.split(',').map(s => s.trim()).filter(Boolean);
      const classArr = classes.split(',').map(c => c.trim()).filter(Boolean);

      if (id) {
        await updateTeacher(id, {
          name,
          subjects: subjectArr,
          assignedClasses: classArr,
          classTeacher,
          classTeacherClass,
          user: userId
        });
      } else {
        const userRes = await register({ username, password, role: 'teacher' });
        const createdUserId = userRes?.data?._id;
        if (!createdUserId) throw new Error('User creation failed');

        await createTeacher({
          name,
          subjects: subjectArr,
          assignedClasses: classArr,
          classTeacher,
          classTeacherClass,
          user: createdUserId
        });
      }

      await fetchTeachers();
      setForm({ id: null, name: '', subjects: '', classes: '', classTeacher: false, classTeacherClass: '', username: '', password: '', userId: null });
      setShowForm(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || '';
      Alert.alert(msg.includes('duplicate key') ? 'Username Exists' : 'Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setForm({
      id: t._id,
      name: t.name || '',
      subjects: Array.isArray(t.subjects) ? t.subjects.join(', ') : '',
      classes: Array.isArray(t.assignedClasses) ? t.assignedClasses.join(', ') : '',
      classTeacher: t.classTeacher || false,
      classTeacherClass: t.classTeacherClass || '',
      username: t.user?.username || '',
      password: '',
      userId: t.user?._id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      await deleteTeacher(id);
      await fetchTeachers();
    } catch {
      Alert.alert('Error', 'Failed to delete teacher');
    }
  };

  const filtered = teachers.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.user?.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc', flexGrow: 1 }}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>👩‍🏫 Manage Teachers</Text>

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
        <Text style={styles.accordionTitle}>{form.id ? 'Edit Teacher' : 'Add New Teacher'}</Text>
        <Ionicons name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#2563eb" />
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {['name', 'subjects', 'classes', 'username', 'password'].map((field) => (
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
            <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>Class Teacher</Text>
            <Switch
              value={form.classTeacher}
              onValueChange={(val) => setForm({ ...form, classTeacher: val })}
            />
          </View>

          {form.classTeacher && (
            <TextInput
              placeholder="Class Teacher of (e.g., 5A)"
              placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
              value={form.classTeacherClass}
              onChangeText={(text) => setForm({ ...form, classTeacherClass: text })}
            />
          )}

          <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name={form.id ? 'create-outline' : 'person-add-outline'} size={18} color="#fff" />}
            <Text style={styles.addBtnText}>{form.id ? 'Update' : 'Add Teacher'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 24 }} />
      ) : (
        filtered.length > 0 ? paginated.map((t) => (
          <View key={t._id} style={[styles.card, styles.teacherCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.teacherInfoRow}>
              <View style={styles.avatarCircle}>
                <MaterialIcons name="person" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.teacherName, { color: isDark ? '#fff' : '#111827' }]}>{t.name}</Text>
                <Text style={[styles.teacherMeta, { color: isDark ? '#94a3b8' : '#6b7280', fontStyle: 'italic', fontWeight: '600' }]}>@{t.user?.username}</Text>
                <Text style={[styles.teacherMeta, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Subjects: {(t.subjects || []).join(', ')}</Text>
                <Text style={[styles.teacherMeta, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Classes: {(t.assignedClasses || []).join(', ')}</Text>
                {t.classTeacher && (
                  <Text style={{ color: '#22c55e', fontWeight: '600' }}>Class Teacher of {t.classTeacherClass}</Text>
                )}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(t)}>
                  <Ionicons name="create-outline" size={20} color="#0ea5e9" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  Alert.alert(
                    'Confirm Deletion',
                    'Are you sure you want to delete this teacher?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(t._id) }
                    ]
                  );
                }}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )) : (
          <Text style={{ textAlign: 'center', color: isDark ? '#94a3b8' : '#6b7280', marginTop: 20 }}>
            No teachers found.
          </Text>
        )
      )}
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
  teacherCard: { padding: 12 },
  teacherInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    backgroundColor: '#2563eb', width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  teacherName: { fontSize: 16, fontWeight: '700' },
  teacherMeta: { fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, marginLeft: 16 },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dbeafe', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 10, marginBottom: 12
  },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: '#2563eb' },
  addBtn: {
    flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 12,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }
});

export default ManageTeachers;
