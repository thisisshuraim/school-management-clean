import { createContext } from 'react';

const UserContext = createContext({
  user: null,
  setUser: () => {},
  profile: null,
  setProfile: () => {}
});

export default UserContext;
