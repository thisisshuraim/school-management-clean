import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Modal,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 5;

const initialAssignments = [
  {
    id: 1,
    class: '5',
    section: 'A',
    title: 'Math Homework',
    subject: 'Math',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2024-04-20'
  },
  {
    id: 2,
    class: '5',
    section: 'A',
    title: 'Science Worksheet',
    subject: 'Science',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2024-04-22'
  },
  {
    id: 3,
    class: '6',
    section: 'B',
    title: 'English Essay',
    subject: 'English',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2024-04-23'
  }
];

const AllAssignmentsAdmin = () => {
  const isDark = useColorScheme() === 'dark';
  const [assignments, setAssignments] = useState(initialAssignments);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);

  const sorted = [...assignments].sort((a, b) => a.class.localeCompare(b.class));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const grouped = paginated.reduce((acc, a) => {
    const key = `${a.class}${a.section}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const handleEdit = () => {
    if (!selected.title || !selected.deadline) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    setAssignments(prev =>
      prev.map(a => (a.id === selected.id ? { ...a, ...selected } : a))
    );
    setEditModal(false);
  };

  const openEdit = (a) => {
    setSelected({ ...a });
    setEditModal(true);
  };

  const handleDownload = (url) => {
    Linking.openURL(url);
  };

  const totalPages = Math.ceil(assignments.length / PAGE_SIZE);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, backgroundColor: isDark ? '#0f172a' : '#f9fafc' }}
    >
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111827' }]}>📚 All Assignments</Text>

      {Object.keys(grouped).map((key) => (
        <View key={key} style={[styles.block, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.groupTitle, { color: isDark ? '#f8fafc' : '#1e293b' }]}>Class {key}</Text>
          {grouped[key].map((a) => (
            <View key={a.id} style={styles.card}>
              <Text style={[styles.title, { color: isDark ? '#f1f5f9' : '#111827' }]}>{a.title}</Text>
              <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>Subject: {a.subject}</Text>
              <Text style={[styles.meta, { color: isDark ? '#cbd5e1' : '#6b7280' }]}>Deadline: {a.deadline}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleDownload(a.fileUrl)}>
                  <Ionicons name="download-outline" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(a)}>
                  <Ionicons name="create-outline" size={20} color="#10b981" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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

      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#111827' }]}>Edit Assignment</Text>
            <TextInput
              placeholder="Title"
              value={selected?.title}
              onChangeText={(text) => setSelected((prev) => ({ ...prev, title: text }))}
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              placeholder="Deadline (YYYY-MM-DD)"
              value={selected?.deadline}
              onChangeText={(text) => setSelected((prev) => ({ ...prev, deadline: text }))}
              style={[styles.input, { backgroundColor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#fff' : '#000' }]}
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleEdit}>
                <Text style={styles.saveText}>Save</Text>
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
    fontWeight: '700',
    marginBottom: 24
  },
  block: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14
  },
  card: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  meta: {
    fontSize: 14,
    marginBottom: 4
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 6
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16
  },
  cancelText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600'
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  }
});

export default AllAssignmentsAdmin;