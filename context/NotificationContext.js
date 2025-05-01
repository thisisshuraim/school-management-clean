import React, { createContext, useState, useEffect, useContext } from 'react';
import UserContext from './UserContext';
import { getAnnouncements } from '../utils/api';
import { socket } from '../utils/socket';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [hasUnread, setHasUnread] = useState(false);

  const checkUnread = async () => {
    try {
      const data = await getAnnouncements();
      const unread = data.some(a => !a.read);
      setHasUnread(unread);
    } catch {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('new-announcement', (announcement) => {
      setHasUnread(true); // Mark bell red immediately
    });

    checkUnread();

    return () => {
      socket.off('new-announcement');
      socket.disconnect();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ hasUnread, setHasUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
