import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      });

    } catch (err) {
      console.error("Invalid token", err);
      sessionStorage.removeItem("token");
      setToken(null);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,

      login: (jwtToken) => {
        sessionStorage.setItem("token", jwtToken);
        setToken(jwtToken);
      },

      logout: () => {
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};