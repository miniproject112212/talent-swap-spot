
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Skill, Conversation, Message, SkillCategory, SkillLevel } from '../types';
import { mockUsers, mockSkills, mockConversations, mockMessages } from '../data/mockData';
import { useToast } from "@/hooks/use-toast";

type AppContextType = {
  users: User[];
  currentUser: User | null;
  skills: Skill[];
  conversations: Conversation[];
  messages: Message[];
  login: (userId: string) => void;
  logout: () => void;
  addSkill: (skill: Omit<Skill, "id">) => void;
  addSkillToUser: (userId: string, skillId: string, type: 'teach' | 'learn') => void;
  deleteSkill: (skillId: string, userId: string) => void;
  sendMessage: (senderId: string, receiverId: string, content: string) => void;
  getConversation: (userId1: string, userId2: string) => Conversation | undefined;
  getMessagesForConversation: (conversationId: string) => Message[];
  getUserById: (userId: string) => User | undefined;
  getSkillById: (skillId: string) => Skill | undefined;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Default logged in for demo
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
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

  const addSkill = (skill: Omit<Skill, "id">) => {
    if (!currentUser) return;
    
    const newSkill: Skill = {
      ...skill,
      id: `s${skills.length + 1}`,
      userId: currentUser.id,
    };
    
    setSkills([...skills, newSkill]);
    toast({
      title: "Skill added",
      description: `${skill.name} has been added successfully`,
    });
  };

  const addSkillToUser = (userId: string, skillId: string, type: 'teach' | 'learn') => {
    const user = users.find(u => u.id === userId);
    const skill = skills.find(s => s.id === skillId);
    
    if (!user || !skill) return;
    
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (type === 'teach') {
          return { ...u, skillsToTeach: [...u.skillsToTeach, skill] };
        } else {
          return { ...u, skillsToLearn: [...u.skillsToLearn, skill] };
        }
      }
      return u;
    });
    
    setUsers(updatedUsers);
    
    // Update current user if it's them
    if (currentUser && currentUser.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
    
    toast({
      title: "Skill added to profile",
      description: `${skill.name} has been added to your ${type === 'teach' ? 'teaching' : 'learning'} skills`,
    });
  };

  const deleteSkill = (skillId: string, userId: string) => {
    // Remove from global skills if the user created it
    const updatedSkills = skills.filter(s => !(s.id === skillId && s.userId === userId));
    setSkills(updatedSkills);
    
    // Remove from user's skills
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          skillsToTeach: u.skillsToTeach.filter(s => s.id !== skillId),
          skillsToLearn: u.skillsToLearn.filter(s => s.id !== skillId),
        };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    
    // Update current user if needed
    if (currentUser && currentUser.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
    
    toast({
      title: "Skill removed",
      description: "The skill has been removed successfully",
    });
  };

  const sendMessage = (senderId: string, receiverId: string, content: string) => {
    // Create new message
    const newMessage: Message = {
      id: `m${messages.length + 1}`,
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
    };
    
    setMessages([...messages, newMessage]);
    
    // Find or create conversation
    const existingConversation = conversations.find(
      c => c.participants.includes(senderId) && c.participants.includes(receiverId)
    );
    
    if (existingConversation) {
      // Update existing conversation
      const updatedConversations = conversations.map(c => {
        if (c.id === existingConversation.id) {
          return {
            ...c,
            lastMessage: newMessage,
            updatedAt: new Date(),
          };
        }
        return c;
      });
      
      setConversations(updatedConversations);
    } else {
      // Create new conversation
      const newConversation: Conversation = {
        id: `c${conversations.length + 1}`,
        participants: [senderId, receiverId],
        lastMessage: newMessage,
        updatedAt: new Date(),
      };
      
      setConversations([...conversations, newConversation]);
    }
    
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully",
    });
  };

  const getConversation = (userId1: string, userId2: string) => {
    return conversations.find(
      c => c.participants.includes(userId1) && c.participants.includes(userId2)
    );
  };

  const getMessagesForConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return [];
    
    const [userId1, userId2] = conversation.participants;
    
    return messages.filter(
      m => 
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const getSkillById = (skillId: string) => {
    return skills.find(s => s.id === skillId);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        skills,
        conversations,
        messages,
        login,
        logout,
        addSkill,
        addSkillToUser,
        deleteSkill,
        sendMessage,
        getConversation,
        getMessagesForConversation,
        getUserById,
        getSkillById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
