/**
 * Enhanced UserContext
 *
 * Provides:
 *  - user         : Firebase Auth user object (or null)
 *  - profile      : backend profile (role, progress summary)
 *  - loading      : true while auth is initializing
 *  - isAdmin      : convenience boolean
 *  - refreshProfile : refetch /auth/me
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getMe } from "../api/auth";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getMe();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchProfile]);

  const isAdmin = profile?.role === "admin";

  return (
    <UserContext.Provider
      value={{ user, profile, loading, isAdmin, refreshProfile: fetchProfile }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
}
