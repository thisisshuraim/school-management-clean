import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Image, TouchableOpacity, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { setAuthToken } from './utils/api';
import LoginScreen from './screens/Auth/LoginScreen';
import Timetable from './screens/Student/Timetable';
import Marksheets from './screens/Student/Marksheets';
import UploadAssignmentShared from './screens/Common/UploadAssignment';
import ViewStudents from './screens/Teacher/ViewStudents';
import ManageTimetable from './screens/Admin/ManageTimetable';
import ManageStudents from './screens/Admin/ManageStudents';
import ManageTeachers from './screens/Admin/ManageTeachers';
import UploadMarksheet from './screens/Admin/UploadMarksheet';
import SharedDashboard from './screens/Common/Dashboard';
import ProfileSidebar from './components/ProfileSidebar';
import NotificationBell from './components/NotificationBell';
import UserContext from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import AllLectures from './screens/Common/AllLectures';
import UploadAnnouncement from './screens/Common/UploadAnnouncement';
import AnnouncementsTray from './screens/Common/AnnouncementsTray';
import { Ionicons } from '@expo/vector-icons';
import { connectSocket } from './utils/socket';
import { Asset } from 'expo-asset';
import Calendar from './screens/Common/Calendar';

const Stack = createNativeStackNavigator();

const AppLogo = () => (
  <Image
    source={require('./assets/toolbar-icon.png')}
    style={{ width: 36, height: 36 }}
    resizeMode="contain"
  />
);

const AppAvatar = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Ionicons
      name="person-circle-outline"
      size={36}
      style={{ marginRight: 6, borderRadius: 18 }}
    />
  </TouchableOpacity>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const preloadAssets = async () => {
    await Asset.loadAsync([
      require('./assets/login-icon.png'),
      require('./assets/toolbar-icon.png'),
      require('./assets/scalingsocials-icon.gif')
    ]);
  };

  useEffect(() => {
    preloadAssets();
  }, []);

  const handleLogin = async (userData) => {
    const role = userData?.role || userData?.user?.role || 'admin';
    const userId = userData?.user?._id || userData?._id;
    const token = userData?.token;
    setAuthToken(token);
    setUser({ ...userData, role, userId, token });

    connectSocket(token);
    await registerForPushNotificationsAsync(userId);
  };

  const handleLogout = () => {
    setShowProfile(false);
    setUser(null);
    setProfile(null);
    setAuthToken(null);
  };

  const commonOptions = () => ({
    animation: 'slide_from_right',
    headerTitle: AppLogo,
    headerRight: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <NotificationBell />
        <AppAvatar onPress={() => setShowProfile(true)} />
      </View>
    )
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <PaperProvider>
        <NotificationProvider>
          <UserContext.Provider value={{ user, setUser, profile, setProfile }}>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#ffffff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0
                  },
                  headerTintColor: '#111827',
                  headerTitleAlign: 'center',
                  headerBackTitleVisible: false
                }}
              >
                {!user ? (
                  <Stack.Screen name="Login" options={{ headerShown: false }}>
                    {(props) => <LoginScreen {...props} onLogin={(userData) => handleLogin(userData)} />}
                  </Stack.Screen>
                ) : (
                  <>
                    <Stack.Screen name="Dashboard" component={SharedDashboard} options={commonOptions()} />
                    {user.role.toLowerCase() === 'student' && (
                      <>
                        <Stack.Screen name="Timetable" component={Timetable} options={commonOptions()} />
                        <Stack.Screen name="Marksheets" component={Marksheets} options={commonOptions()} />
                        <Stack.Screen name="Assignments">
                          {(props) => <UploadAssignmentShared {...props} userRole="student" />}
                        </Stack.Screen>
                        <Stack.Screen name="AllLectures" component={AllLectures} options={commonOptions()} />
                        <Stack.Screen name="AnnouncementsTray" component={AnnouncementsTray} options={commonOptions()} />
                        <Stack.Screen name="Calendar" component={Calendar} options={commonOptions()} />
                      </>
                    )}
                    {user.role.toLowerCase() === 'teacher' && (
                      <>
                        <Stack.Screen name="ViewStudents" component={ViewStudents} options={commonOptions()} />
                        <Stack.Screen name="Assignments">
                          {(props) => <UploadAssignmentShared {...props} userRole="teacher" />}
                        </Stack.Screen>
                        <Stack.Screen name="Timetable" component={Timetable} options={commonOptions()} />
                        <Stack.Screen name="AllLectures" component={AllLectures} options={commonOptions()} />
                        <Stack.Screen name="UploadAnnouncement" component={UploadAnnouncement} options={commonOptions()} />
                        <Stack.Screen name="AnnouncementsTray" component={AnnouncementsTray} options={commonOptions()} />
                        <Stack.Screen name="Calendar" component={Calendar} options={commonOptions()} />
                      </>
                    )}
                    {user.role.toLowerCase() === 'admin' && (
                      <>
                        <Stack.Screen name="ManageStudents" component={ManageStudents} options={commonOptions()} />
                        <Stack.Screen name="ManageTeachers" component={ManageTeachers} options={commonOptions()} />
                        <Stack.Screen name="ManageTimetable" component={ManageTimetable} options={commonOptions()} />
                        <Stack.Screen name="UploadMarksheet" component={UploadMarksheet} options={commonOptions()} />
                        <Stack.Screen name="Assignments">
                          {(props) => <UploadAssignmentShared {...props} userRole="admin" />}
                        </Stack.Screen>
                        <Stack.Screen name="AllLectures" component={AllLectures} options={commonOptions()} />
                        <Stack.Screen name="UploadAnnouncement" component={UploadAnnouncement} options={commonOptions()} />
                        <Stack.Screen name="AnnouncementsTray" component={AnnouncementsTray} options={commonOptions()} />
                        <Stack.Screen name="Calendar" component={Calendar} options={commonOptions()} />
                      </>
                    )}
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
            {user && (
              <ProfileSidebar
                visible={showProfile}
                onClose={() => setShowProfile(false)}
                onLogout={handleLogout}
              />
            )}
          </UserContext.Provider>
        </NotificationProvider>
      </PaperProvider>
    </SafeAreaView>
  );
}