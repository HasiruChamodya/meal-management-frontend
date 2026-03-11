import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MOCK_USERS } from "@/lib/constants";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mealflow_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("mealflow_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("mealflow_user");
    }
  }, [user]);

  const login = useCallback((role) => {
    const mockUser = MOCK_USERS.find((u) => u.role === role);
    if (mockUser) setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthContext = {
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context ?? defaultAuthContext;
};