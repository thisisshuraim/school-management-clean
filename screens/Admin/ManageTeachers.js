import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  LayoutAnimation, Platform, UIManager, useColorScheme, ActivityIndicator, Switch, FlatList, Modal, Pressable
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  getTeachers, createTeacher, updateTeacher, deleteTeacher, register, updateUser, deleteUser
} from '../../utils/api';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ManageTeachers = () => {
  const isDark = useColorScheme() === 'dark';

  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    id: null, name: '', subjects: '', classes: '', classTeacher: false,
    classTeacherClass: '', username: '', password: '', userId: null, isBlocked: false
  });
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

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
    const { id, name, subjects, classes, classTeacher, classTeacherClass, username, password, userId, isBlocked } = form;
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
        const userId = teachers.find(t => t?._id === id)?.user._id;
        await updateUser(userId, { username, password, role: 'teacher', isBlocked });
        await updateTeacher(id, {
          name, subjects: subjectArr, assignedClasses: classArr,
          classTeacher, classTeacherClass, user: userId
        });
      } else {
        const userRes = await register({ username, password, role: 'teacher', isBlocked });
        const createdUserId = userRes?.data?._id;
        if (!createdUserId) throw new Error('User creation failed');
        await createTeacher({ name, subjects: subjectArr, assignedClasses: classArr,
          classTeacher, classTeacherClass, user: createdUserId });
      }

      await fetchTeachers();
      setForm({ id: null, name: '', subjects: '', classes: '', classTeacher: false,
        classTeacherClass: '', username: '', password: '', userId: null, isBlocked: false });
      setShowForm(false);
      setShowModal(false);
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
      userId: t.user?._id || '',
      isBlocked: t.user?.isBlocked || false
    });
    setShowModal(true);
  };

  const handleDelete = async (userId, teacherId) => {
    try {
      await deleteUser(userId);
      await deleteTeacher(teacherId);
      await fetchTeachers();
    } catch (err) {
      Alert.alert('Error', 'Failed to delete teacher');
    }
  };

  const filtered = teachers.filter(
    (t) => (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.user?.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const loadMore = () => {
    if (visibleCount < filtered.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setVisibleCount(prev => prev + 10);
    }
  };

  const renderTeacherCard = ({ item: t }) => (
    <View key={t._id} style={[styles.card, styles.teacherCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
      <View style={styles.teacherInfoRow}>
        <View style={styles.avatarCircle}><MaterialIcons name="person" size={22} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.teacherName, { color: isDark ? '#fff' : '#111827' }]}>
            {t.name} {t.user?.isBlocked && <Text style={{ color: '#ef4444' }}>(Blocked)</Text>}
          </Text>
          <Text style={[styles.teacherMeta, { color: isDark ? '#94a3b8' : '#6b7280', fontStyle: 'italic', fontWeight: '600' }]}>@{t.user?.username}</Text>
          <Text style={[styles.teacherMeta, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Subjects: {(t.subjects || []).join(', ')}</Text>
          <Text style={[styles.teacherMeta, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Classes: {(t.assignedClasses || []).join(', ')}</Text>
          {t.classTeacher && <Text style={{ color: '#22c55e', fontWeight: '600' }}>Class Teacher of {t.classTeacherClass}</Text>}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(t)}><Ionicons name="create-outline" size={20} color="#0ea5e9" /></TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Confirm Deletion', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(t?.user?._id, t?._id) }
          ])}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc' }}>
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
        <Text style={styles.accordionTitle}>Add New Teacher</Text>
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
            <Switch value={form.classTeacher} onValueChange={(val) => setForm({ ...form, classTeacher: val })} />
          </View>
          {form.classTeacher && (
            <TextInput placeholder="Class Teacher of (e.g., 5A)" placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
              value={form.classTeacherClass} onChangeText={(text) => setForm({ ...form, classTeacherClass: text })}
            />
          )}
          <View style={styles.switchRow}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>Blocked</Text>
            <Switch value={form.isBlocked} onValueChange={(val) => setForm({ ...form, isBlocked: val })} />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name='person-add-outline' size={18} color="#fff" />}
            <Text style={styles.addBtnText}>Add Teacher</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 24 }} /> : (
        <FlatList
          data={filtered.slice(0, visibleCount)}
          keyExtractor={(item) => item._id}
          renderItem={renderTeacherCard}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
        />
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowModal(false);
          setForm({ id: null, name: '', subjects: '', classes: '', classTeacher: false, classTeacherClass: '', username: '', password: '', userId: null, isBlocked: false });
        }}
      >
        <Pressable style={styles.modalOverlay} onPress={() => {
          setShowModal(false);
          setForm({ id: null, name: '', subjects: '', classes: '', classTeacher: false, classTeacherClass: '', username: '', password: '', userId: null, isBlocked: false });
        }}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.card, styles.modalBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <TouchableOpacity onPress={() => {
              setShowModal(false);
              setForm({ id: null, name: '', subjects: '', classes: '', classTeacher: false, classTeacherClass: '', username: '', password: '', userId: null, isBlocked: false });
            }} style={styles.closeIcon}>
              <Ionicons name="close" size={24} color="#ef4444" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Teacher</Text>
            {['name', 'subjects', 'classes', 'username', 'password'].map((field) => (
              <TextInput key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
                value={form[field]} secureTextEntry={field === 'password'}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
              />
            ))}
            <View style={styles.switchRow}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>Class Teacher</Text>
              <Switch value={form.classTeacher} onValueChange={(val) => setForm({ ...form, classTeacher: val })} />
            </View>
            {form.classTeacher && (
              <TextInput placeholder="Class Teacher of (e.g., 5A)" placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
                style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
                value={form.classTeacherClass} onChangeText={(text) => setForm({ ...form, classTeacherClass: text })}
              />
            )}
            <View style={styles.switchRow}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>Blocked</Text>
              <Switch value={form.isBlocked} onValueChange={(val) => setForm({ ...form, isBlocked: val })} />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name='create-outline' size={18} color="#fff" />}
              <Text style={styles.addBtnText}>Update Teacher</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 },
  card: {
    borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center'
  },
  modalBox: {
    width: '90%', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 16, borderRadius: 20
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: '#2563eb'
  },
  closeIcon: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
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
