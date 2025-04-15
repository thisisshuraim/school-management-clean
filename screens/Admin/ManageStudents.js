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
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PAGE_SIZE = 5;

const ManageStudents = () => {
  const isDark = useColorScheme() === 'dark';

  const [students, setStudents] = useState([
    { id: 1, name: 'Ali Khan', class: '5', section: 'A', username: 'alikhan' }
  ]);

  const [form, setForm] = useState({
    id: null,
    name: '',
    class: '',
    section: '',
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
    const { id, name, class: cls, section, username, password } = form;
    if (!name || !cls || !section || !username || (!id && !password)) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }

    if (id) {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...form } : s)));
    } else {
      const newStudent = {
        ...form,
        id: Date.now()
      };
      setStudents([...students, newStudent]);
    }

    setForm({ id: null, name: '', class: '', section: '', username: '', password: '' });
    setPage(0);
    setShowForm(false);
  };

  const handleEdit = (student) => {
    setForm(student);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase())
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
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>👦 Manage Students</Text>

      {/* Search */}
      <TextInput
        placeholder="Search by name or username"
        placeholderTextColor={isDark ? '#94a3b8' : '#6b7280'}
        style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
        value={search}
        onChangeText={setSearch}
      />

      {/* Accordion Toggle */}
      <TouchableOpacity style={styles.accordionHeader} onPress={toggleForm}>
        <Text style={styles.accordionTitle}>{form.id ? 'Edit Student' : 'Add New Student'}</Text>
        <Ionicons
          name={showForm ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color="#2563eb"
        />
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {['name', 'class', 'section', 'username', 'password'].map((field) => (
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
          <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate}>
            <Ionicons name={form.id ? 'create-outline' : 'person-add-outline'} size={18} color="#fff" />
            <Text style={styles.addBtnText}>{form.id ? 'Update' : 'Add Student'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.subheading, { color: isDark ? '#fff' : '#111827' }]}>Registered Students ({filtered.length})</Text>

      {paginated.map((student) => (
        <View key={student.id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.studentText, { color: isDark ? '#fff' : '#111827' }]}> {student.name} ({student.class}{student.section}) — {student.username} </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEdit(student)}>
              <Ionicons name="create-outline" size={20} color="#0ea5e9" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(student.id)}>
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
  studentText: {
    fontSize: 15,
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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

export default ManageStudents;
