import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Simple admin credentials (in production, this would be handled server-side)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "truthprotocol2024";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    const adminStatus = localStorage.getItem("isAdmin");
    if (adminStatus === "true") {
      setIsAdmin(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    console.log('🔐 Login attempt - Username:', username);
    console.log('🔐 Login attempt - Password:', password);
    console.log('🔐 Expected - Username:', ADMIN_USERNAME);
    console.log('🔐 Expected - Password:', ADMIN_PASSWORD);
    console.log('🔐 Username match?', username === ADMIN_USERNAME);
    console.log('🔐 Password match?', password === ADMIN_PASSWORD);
    console.log('🔐 Username length:', username.length, 'Expected:', ADMIN_USERNAME.length);
    console.log('🔐 Password length:', password.length, 'Expected:', ADMIN_PASSWORD.length);
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('✅ Login successful!');
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      return true;
    }
    console.log('❌ Login failed!');
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}