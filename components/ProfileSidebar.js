import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  SafeAreaView,
  Animated,
  Pressable,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserContext from '../context/UserContext';

const { width } = Dimensions.get('window');

const capitalizeFirst = (str = '') => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const ProfileSidebar = ({ visible, onClose, onLogout }) => {
  const { user, profile } = useContext(UserContext);
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#111827';
  const divider = isDark ? '#334155' : '#e2e8f0';

  const translateX = React.useRef(new Animated.Value(width)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : width,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [visible]);

  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const isStudent = user?.role?.toLowerCase() === 'student';
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <>
      {visible && <Pressable style={styles.backdrop} onPress={onClose} />}
      <Animated.View
        style={[styles.panel, { backgroundColor: bgColor, transform: [{ translateX }] }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={styles.innerContent}>
            <View style={styles.header}>
              <Ionicons
                name="person-circle-outline"
                size={64}
                style={{ marginBottom: 10, borderRadius: 32 }}
              />
              <Text style={[styles.name, { color: textColor }]}>👋 Hello, {profile?.name || user?.user?.username || 'User'}</Text>
              <View style={[styles.pill, { backgroundColor: isDark ? '#334155' : '#e0e7ff' }]}>
                <Text style={[styles.pillText, { color: isDark ? '#f8fafc' : '#1e3a8a' }]}>{capitalizeFirst(user?.role || 'User')}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              {isStudent && (
                <View style={styles.rowItem}>
                  <Ionicons name="school-outline" size={16} color={textColor} />
                  <Text style={[styles.metaValue, { color: textColor }]}>Class: {profile?.classSection || 'N/A'}</Text>
                </View>
              )}

              {isTeacher && (
                <>
                  {!!profile?.subjects?.length && (
                    <View style={styles.rowItem}>
                      <Ionicons name="book-outline" size={16} color={textColor} />
                      <Text style={[styles.metaValue, { color: textColor }]}>Subjects: {profile.subjects.join(', ')}</Text>
                    </View>
                  )}
                  {!!profile?.assignedClasses?.length && (
                    <View style={styles.rowItem}>
                      <Ionicons name="people-outline" size={16} color={textColor} />
                      <Text style={[styles.metaValue, { color: textColor }]}>Assigned: {profile.assignedClasses.join(', ')}</Text>
                    </View>
                  )}
                  {profile?.classTeacher && profile?.classTeacherClass && (
                    <View style={styles.rowItem}>
                      <Ionicons name="star-outline" size={16} color={textColor} />
                      <Text style={[styles.metaValue, { color: textColor }]}>Class Teacher: {profile.classTeacherClass}</Text>
                    </View>
                  )}
                </>
              )}

              {isAdmin && (
                <View style={styles.rowItem}>
                  <Ionicons name="settings-outline" size={16} color={textColor} />
                  <Text style={[styles.metaValue, { color: textColor }]}>Admin privileges enabled</Text>
                </View>
              )}

              <View style={[styles.divider, { backgroundColor: divider }]} />

              <View style={styles.rowItem}>
                <Ionicons name="person-circle-outline" size={16} color={textColor} />
                <Text style={[styles.metaValue, { color: textColor }]}>Username: {user?.user?.username || 'N/A'}</Text>
              </View>
              <View style={styles.rowItem}>
                <Ionicons name="id-card-outline" size={16} color={textColor} />
                <Text style={[styles.metaValue, { color: textColor }]}>ID: {user?.userId || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1
  },
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    maxWidth: 400,
    zIndex: 2,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: -4, height: 0 },
    shadowRadius: 12,
    elevation: 10,
    paddingTop: 40,
    paddingBottom: 36
  },
  innerContent: {
    paddingHorizontal: 24
  },
  header: {
    marginBottom: 20
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600'
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8
  },
  divider: {
    height: 1,
    marginVertical: 24
  },
  infoSection: {
    gap: 12
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center'
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