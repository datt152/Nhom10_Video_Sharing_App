// UserContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserId, setCurrentUserId, removeCurrentUserId } from '../types/config';

const UserContext = createContext<{
  userId: string | null;
  setUserId: (id: string) => void;
  logout: () => void;
}>({ userId: null, setUserId: () => {}, logout: () => {} });

export const UserProvider = ({ children }: any) => {
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const id = await getCurrentUserId();
      setUserIdState(id);
    };
    loadUser();
  }, []);

  const setUserId = async (id: string) => {
    setUserIdState(id);
    await setCurrentUserId(id);
  };

  const logout = async () => {
    setUserIdState(null);
    await removeCurrentUserId();
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
