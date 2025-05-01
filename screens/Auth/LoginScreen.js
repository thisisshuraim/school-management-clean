import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../../utils/api';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ username, password }); // ✅ API call
      onLogin(res.data); // ✅ send user + token to App.js
    } catch (err) {
      Alert.alert('Login Failed', err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={64}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/login-icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome 👋</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://stanthonyschools.info')}
          style={styles.aboutCard}
          activeOpacity={0.8}
        >
          <Ionicons name="school-outline" size={18} color="#2563eb" style={{ marginRight: 6 }} />
          <Text style={styles.aboutCardText}>Learn more about St. Anthony's School</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://scalingsocials.com')}
          style={styles.scalingCard}
          activeOpacity={0.8}
        >
          <Text style={styles.scalingCardText}>Designed and Developed by</Text>
          <Image
            source={require('../../assets/scalingsocials-icon.gif')}
            style={styles.scalingCardLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 18
  },
  loginButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center'
  },
  loginText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600'
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f2fe',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 28
  },
  aboutCardText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14
  },
  scalingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16
  },
  scalingCardText: {
    color: '#f1f5f9',
    fontWeight: '500',
    fontSize: 14,
    marginRight: 8
  },
  scalingCardLogo: {
    width: 100,
    height: 30
  }
});

export default LoginScreen;
