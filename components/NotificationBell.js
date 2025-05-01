import React, { useContext, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAnnouncements } from '../utils/api';
import NotificationContext from '../context/NotificationContext';
import { getSocket } from '../utils/socket';

const NotificationBell = () => {
  const navigation = useNavigation();
  const { hasUnread, setHasUnread } = useContext(NotificationContext);

  const checkNotifications = async () => {
    try {
      const res = await getAnnouncements();
      const unread = res?.data?.some(a => !a.read);
      setHasUnread(unread);
    } catch {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    checkNotifications();

    const socket = getSocket();
    socket?.on('new-announcement', () => {
      setHasUnread(true);
    });

    return () => {
      socket?.off('new-announcement');
    };
  }, []);

  const handlePress = () => {
    setHasUnread(false);
    navigation.navigate('AnnouncementsTray');
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Ionicons name="notifications-outline" size={28} color="#111827" />
      {hasUnread && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    position: 'absolute',
    right: 2,
    top: 2
  }
});

export default NotificationBell;
