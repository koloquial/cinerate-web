'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const MongoContext = createContext();

export const MongoProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const res = await fetch('/api/user/data', {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`
            }
          });
          const data = await res.json();
          setProfile(data);
        } catch (err) {
          console.error('Failed to load Mongo profile', err);
        }
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <MongoContext.Provider value={{ profile }}>
      {children}
    </MongoContext.Provider>
  );
};

export const useMongo = () => useContext(MongoContext);
