"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthUser {
  token: string;
  is_admin: boolean;
  full_name: string;
  user_id: number;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("belediye_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("belediye_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: any) => {
    // Backend'den hangi isimle gelirse gelsin 'token' olarak kaydet
    const formattedUser: AuthUser = {
      ...userData,
      token: userData.token || userData.access_token
    };
    setUser(formattedUser);
    localStorage.setItem("belediye_user", JSON.stringify(formattedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("belediye_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
