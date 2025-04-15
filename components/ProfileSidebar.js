import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  SafeAreaView
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProfileSidebar = ({ visible, onClose, user = {}, onLogout }) => {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#111827';
  const subColor = isDark ? '#cbd5e1' : '#374151';
  const divider = isDark ? '#334155' : '#e2e8f0';

  const isTeacher = user.role === 'Teacher';
  const isStudent = user.role === 'Student';

  const upcomingDeadlines = user.deadlines || [
    { subject: 'Math', due: 'Apr 18' },
    { subject: 'Science', due: 'Apr 20' }
  ];

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      backdropOpacity={0.3}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <SafeAreaView style={[styles.panel, { backgroundColor: bgColor }]}>
        <View style={styles.innerContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.name, { color: textColor }]}>👋 Hello, {user.username || 'User'}</Text>

            {isStudent && (
              <>
                <Text style={[styles.metaLabel, { color: subColor }]}>Class</Text>
                <Text style={[styles.metaValue, { color: textColor }]}>{`${user.class || '5'}${user.section || 'A'}`}</Text>
              </>
            )}

            {isTeacher && user.assignedClasses && (
              <>
                <Text style={[styles.metaLabel, { color: subColor }]}>Assigned Classes</Text>
                <Text style={[styles.metaValue, { color: textColor }]}> {user.assignedClasses.join(', ')} </Text>
              </>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: divider }]} />

          {/* Info Section */}
          {(isStudent || isTeacher) && (
            <View style={styles.infoSection}>
              <Text style={[styles.metaLabel, { color: subColor, marginBottom: 12 }]}>Upcoming Deadlines</Text>
              {upcomingDeadlines.map((item, index) => (
                <View key={index} style={styles.deadlineRow}>
                  <Ionicons name="calendar-outline" size={18} color={textColor} style={styles.icon} />
                  <Text style={[styles.deadlineText, { color: textColor }]}>{item.subject}</Text>
                  <Text style={[styles.deadlineDate, { color: textColor }]}>{item.due}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  panel: {
    width: width * 0.75,
    maxWidth: 400,
    height: '100%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: -4, height: 0 },
    shadowRadius: 12,
    elevation: 10,
    paddingTop: 40,
    paddingBottom: 36,
    justifyContent: 'space-between'
  },
  innerContent: {
    paddingHorizontal: 24,
    flexGrow: 1
  },
  header: {
    marginBottom: 28
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6
  },
  divider: {
    height: 1,
    marginBottom: 28
  },
  infoSection: {
    marginBottom: 36
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  icon: {
    marginRight: 10
  },
  deadlineText: {
    fontSize: 15,
    flex: 1
  },
  deadlineDate: {
    fontSize: 15,
    fontWeight: '600'
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 24
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ProfileSidebar;
