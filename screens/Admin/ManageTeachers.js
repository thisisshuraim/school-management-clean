import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PAGE_SIZE = 5;

const ManageTeachers = () => {
  const isDark = useColorScheme() === 'dark';

  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: 'Meera Joshi',
      subjects: 'Math, Science',
      classes: '1B, 5A',
      classTeacher: true,
      classTeacherClass: '5A',
      username: 'meera',
      password: ''
    }
  ]);

  const [form, setForm] = useState({
    id: null,
    name: '',
    subjects: '',
    classes: '',
    classTeacher: false,
    classTeacherClass: '',
    username: '',
    password: ''
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowForm((prev) => !prev);
  };

  const handleAddOrUpdate = () => {
    const { id, name, subjects, classes, classTeacher, classTeacherClass, username, password } = form;
    if (!name || !subjects || !classes || !username || (!id && !password)) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }
    if (classTeacher && !classTeacherClass) {
      Alert.alert('Missing field', 'Please enter the class for Class Teacher role.');
      return;
    }

    const newTeacher = { ...form };
    if (!classTeacher) newTeacher.classTeacherClass = '';

    if (id) {
      setTeachers((prev) => prev.map((t) => (t.id === id ? newTeacher : t)));
    } else {
      setTeachers([...teachers, { ...newTeacher, id: Date.now() }]);
    }

    setForm({ id: null, name: '', subjects: '', classes: '', classTeacher: false, classTeacherClass: '', username: '', password: '' });
    setPage(0);
    setShowForm(false);
  };

  const handleEdit = (teacher) => {
    setForm(teacher);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setTeachers(teachers.filter((t) => t.id !== id));
  };

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        backgroundColor: isDark ? '#0f172a' : '#f9fafc',
        flexGrow: 1
      }}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>👩‍🏫 Manage Teachers</Text>

      <TextInput
        placeholder="Search by name or username"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity style={styles.accordionHeader} onPress={toggleForm}>
        <Text style={styles.accordionTitle}>{form.id ? 'Edit Teacher' : 'Add New Teacher'}</Text>
        <Ionicons
          name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color="#2563eb"
        />
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {['name', 'subjects', 'classes', 'username', 'password'].map((field) => (
            <TextInput
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
              secureTextEntry={field === 'password'}
              value={form[field]}
              onChangeText={(text) => setForm({ ...form, [field]: text })}
            />
          ))}
          <Text style={styles.helperText}>Assigned Classes: comma-separated (e.g., 1A, 2B)</Text>

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

          <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate}>
            <Ionicons
              name={form.id ? 'create-outline' : 'person-add-outline'}
              size={18}
              color="#fff"
            />
            <Text style={styles.addBtnText}>{form.id ? 'Update' : 'Add Teacher'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.subheading, { color: isDark ? '#fff' : '#111827' }]}>Registered Teachers ({filtered.length})</Text>

      {paginated.map((t) => (
        <View key={t.id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.teacherText, { color: isDark ? '#fff' : '#111827' }]}>{t.name} — {t.username}</Text>
          <Text style={[styles.detailText, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>Subjects: {t.subjects}</Text>
          <Text style={[styles.detailText, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>Classes: {t.classes}</Text>
          {t.classTeacher && (
            <Text style={{ color: '#22c55e', fontWeight: '600' }}>Class Teacher of {t.classTeacherClass}</Text>
          )}
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEdit(t)}>
              <Ionicons name="create-outline" size={20} color="#0ea5e9" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(t.id)}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Previous</Text>
          </TouchableOpacity>
          <Text style={[styles.pageStatus, { color: isDark ? '#fff' : '#000' }]}>Page {page + 1} of {totalPages}</Text>
          <TouchableOpacity
            onPress={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  input: {
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    marginTop: -8
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563eb'
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  teacherText: {
    fontSize: 15,
    fontWeight: '600'
  },
  detailText: {
    fontSize: 14,
    marginTop: 2
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  pageBtn: {
    padding: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 8
  },
  pageBtnDisabled: {
    opacity: 0.5
  },
  pageBtnText: {
    color: '#1e293b',
    fontWeight: '600'
  },
  pageStatus: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ManageTeachers;