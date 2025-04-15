import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 2; // 2 columns + spacing

const StudentDashboard = ({ navigation, route }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const username = route?.params?.username || 'Student';

  const cards = [
    {
      title: 'Timetable',
      icon: 'calendar-outline',
      screen: 'Timetable'
    },
    {
      title: 'Assignments',
      icon: 'document-text-outline',
      screen: 'Assignments'
    },
    {
      title: 'Marksheet',
      icon: 'bar-chart-outline',
      screen: 'Marksheets'
    }
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#111' : '#f9fafc' }]}>
      <Text style={[styles.greeting, { color: isDark ? '#fff' : '#111' }]}>
        Hi, {username} 👋
      </Text>
      <Text style={[styles.subtext, { color: isDark ? '#aaa' : '#555' }]}>Here’s what you can access:</Text>

      <View style={styles.grid}>
        {cards.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1f2937' : '#fff',
                shadowColor: isDark ? '#000' : '#cbd5e1'
              }
            ]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.85}
          >
            <Ionicons name={item.icon} size={32} color={isDark ? '#60a5fa' : '#2563eb'} />
            <Text style={[styles.cardText, { color: isDark ? '#e5e7eb' : '#111827' }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    flexGrow: 1
  },
  greeting: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 6
  },
  subtext: {
    fontSize: 15,
    marginBottom: 24
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between'
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3
  },
  cardText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center'
  }
});

export default StudentDashboard;
