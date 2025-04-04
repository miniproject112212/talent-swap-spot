
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/data/mockData';
import { useToast } from "@/hooks/use-toast";

type UserContextType = {
  users: User[];
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  getUserById: (userId: string) => User | undefined;
  updateUser: (updatedUser: User) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Default logged in for demo
  const { toast } = useToast();

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        login,
        logout,
        getUserById,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
