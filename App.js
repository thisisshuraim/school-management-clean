import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import LoginScreen from './screens/Auth/LoginScreen';
import StudentDashboard from './screens/Student/Dashboard';
import Timetable from './screens/Student/Timetable';
import Marksheets from './screens/Student/Marksheets';
import Assignments from './screens/Student/Assignments';

import TeacherDashboard from './screens/Teacher/Dashboard';
import ViewStudents from './screens/Teacher/ViewStudents';
import UploadAssignment from './screens/Teacher/UploadAssignment';
import MyAssignments from './screens/Teacher/MyAssignments';

import AdminDashboard from './screens/Admin/Dashboard';
import ManageTimetable from './screens/Admin/ManageTimetable';
import ManageStudents from './screens/Admin/ManageStudents';
import ManageTeachers from './screens/Admin/ManageTeachers';
import ViewClasses from './screens/Admin/ViewClasses';
import UploadMarksheet from './screens/Admin/UploadMarksheet';
import AllAssignments from './screens/Admin/AllAssignments';

import ProfileSidebar from './components/ProfileSidebar';

const Stack = createNativeStackNavigator();

const AppLogo = () => (
  <Image
    source={{ uri: 'https://img.icons8.com/color/96/school-building.png' }}
    style={{ width: 32, height: 32 }}
    resizeMode="contain"
  />
);

const AppAvatar = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Image
      source={{ uri: 'https://ui-avatars.com/api/?name=User&background=random&rounded=true' }}
      style={styles.avatar}
    />
  </TouchableOpacity>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setShowProfile(false);
    setUser(null);
  };

  const commonOptions = () => ({
    animation: 'slide_from_right',
    headerTitle: AppLogo,
    headerRight: () => <AppAvatar onPress={() => setShowProfile(true)} />
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <PaperProvider>
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
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
            ) : user.role === 'Student' ? (
              <>
                <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={commonOptions()} />
                <Stack.Screen name="Timetable" component={Timetable} options={commonOptions()} />
                <Stack.Screen name="Marksheets" component={Marksheets} options={commonOptions()} />
                <Stack.Screen name="Assignments" component={Assignments} options={commonOptions()} />
              </>
            ) : user.role === 'Teacher' ? (
              <>
                <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={commonOptions()} />
                <Stack.Screen name="ViewStudents" component={ViewStudents} options={commonOptions()} />
                <Stack.Screen name="UploadAssignment" component={UploadAssignment} options={commonOptions()} />
                <Stack.Screen name="MyAssignments" component={MyAssignments} options={commonOptions()} />
                <Stack.Screen name="Timetable" component={Timetable} options={commonOptions()} />
              </>
            ) : (
              <>
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={commonOptions()} />
                <Stack.Screen name="ManageStudents" component={ManageStudents} options={commonOptions()} />
                <Stack.Screen name="ManageTeachers" component={ManageTeachers} options={commonOptions()} />
                <Stack.Screen name="ManageTimetable" component={ManageTimetable} options={commonOptions()} />
                <Stack.Screen name="ViewClasses" component={ViewClasses} options={commonOptions()} />
                <Stack.Screen name="UploadMarksheet" component={UploadMarksheet} options={commonOptions()} />
                <Stack.Screen name="AllAssignments" component={AllAssignments} options={commonOptions()} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>

        {user && (
          <ProfileSidebar
            visible={showProfile}
            onClose={() => setShowProfile(false)}
            user={user}
            onLogout={handleLogout}
          />
        )}
      </PaperProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 6
  }
});
