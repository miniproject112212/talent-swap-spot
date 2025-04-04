import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Skill, Conversation, Message, SkillCategory, SkillLevel, Availability, Session, Rating } from '../types';
import { mockUsers, mockSkills, mockConversations, mockMessages } from '../data/mockData';
import { useToast } from "@/hooks/use-toast";

type AppContextType = {
  users: User[];
  currentUser: User | null;
  skills: Skill[];
  conversations: Conversation[];
  messages: Message[];
  sessions: Session[];
  ratings: Rating[];
  login: (userId: string) => void;
  logout: () => void;
  addSkill: (skill: Omit<Skill, "id">) => void;
  addSkillToUser: (userId: string, skillId: string, type: 'teach' | 'learn') => void;
  deleteSkill: (skillId: string, userId: string) => void;
  sendMessage: (senderId: string, receiverId: string, content: string, type?: Message['type']) => void;
  getConversation: (userId1: string, userId2: string) => Conversation | undefined;
  getMessagesForConversation: (conversationId: string) => Message[];
  getUserById: (userId: string) => User | undefined;
  getSkillById: (skillId: string) => Skill | undefined;
  addAvailability: (userId: string, availability: Omit<Availability, "id" | "userId" | "isBooked">) => void;
  deleteAvailability: (userId: string, availabilityId: string) => void;
  getUserAvailability: (userId: string) => Availability[];
  createSession: (session: Omit<Session, "id" | "status" | "rating">) => void;
  updateSessionStatus: (sessionId: string, status: Session['status']) => void;
  getUserSessions: (userId: string) => Session[];
  addRating: (rating: Omit<Rating, "id" | "timestamp">) => void;
  getUserRatings: (userId: string) => Rating[];
  getAverageUserRating: (userId: string) => number;
  initiateVideoCall: (senderId: string, receiverId: string) => void;
  acceptVideoCall: (senderId: string, receiverId: string) => void;
  rejectVideoCall: (senderId: string, receiverId: string) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Default logged in for demo
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
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
    const updatedSkills = skills.filter(s => !(s.id === skillId && s.userId === userId));
    setSkills(updatedSkills);
    
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

  const sendMessage = (senderId: string, receiverId: string, content: string, type: Message['type'] = 'text') => {
    const newMessage: Message = {
      id: `m${messages.length + 1}`,
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
      type,
    };
    
    setMessages([...messages, newMessage]);
    
    const existingConversation = conversations.find(
      c => c.participants.includes(senderId) && c.participants.includes(receiverId)
    );
    
    if (existingConversation) {
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

  const addAvailability = (userId: string, availability: Omit<Availability, "id" | "userId" | "isBooked">) => {
    const newAvailability: Availability = {
      id: `a${Math.random().toString(36).substr(2, 9)}`,
      userId,
      isBooked: false,
      ...availability,
    };

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          availability: [...(user.availability || []), newAvailability]
        };
      }
      return user;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prevUser => {
        if (prevUser) {
          return {
            ...prevUser,
            availability: [...(prevUser.availability || []), newAvailability]
          };
        }
        return prevUser;
      });
    }

    toast({
      title: "Availability added",
      description: "Your availability has been added successfully",
    });
  };

  const deleteAvailability = (userId: string, availabilityId: string) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId && user.availability) {
        return {
          ...user,
          availability: user.availability.filter(a => a.id !== availabilityId)
        };
      }
      return user;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prevUser => {
        if (prevUser && prevUser.availability) {
          return {
            ...prevUser,
            availability: prevUser.availability.filter(a => a.id !== availabilityId)
          };
        }
        return prevUser;
      });
    }

    toast({
      title: "Availability removed",
      description: "The availability slot has been removed",
    });
  };

  const getUserAvailability = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.availability || [];
  };

  const createSession = (session: Omit<Session, "id" | "status" | "rating">) => {
    const newSession: Session = {
      id: `s${Math.random().toString(36).substr(2, 9)}`,
      status: 'scheduled',
      ...session,
    };

    setSessions([...sessions, newSession]);

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === session.hostUserId && user.availability) {
        return {
          ...user,
          availability: user.availability.map(a => {
            if (a.date.getTime() === session.date.getTime() && 
                a.startTime === session.startTime && 
                a.endTime === session.endTime) {
              return { ...a, isBooked: true, bookedWith: session.guestUserId };
            }
            return a;
          })
        };
      }
      return user;
    }));

    toast({
      title: "Session scheduled",
      description: "Your skill swap session has been scheduled",
    });
  };

  const updateSessionStatus = (sessionId: string, status: Session['status']) => {
    setSessions(prevSessions => prevSessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, status };
      }
      return s;
    }));

    toast({
      title: `Session ${status}`,
      description: `Your session has been marked as ${status}`,
    });
  };

  const getUserSessions = (userId: string) => {
    return sessions.filter(s => s.hostUserId === userId || s.guestUserId === userId);
  };

  const addRating = (rating: Omit<Rating, "id" | "timestamp">) => {
    const newRating: Rating = {
      id: `r${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...rating,
    };

    setRatings([...ratings, newRating]);

    setSessions(prevSessions => prevSessions.map(s => {
      if (s.id === rating.sessionId) {
        return { ...s, rating: newRating };
      }
      return s;
    }));

    toast({
      title: "Rating submitted",
      description: "Thank you for your feedback",
    });
  };

  const getUserRatings = (userId: string) => {
    return ratings.filter(r => r.toUserId === userId);
  };

  const getAverageUserRating = (userId: string) => {
    const userRatings = getUserRatings(userId);
    
    if (userRatings.length === 0) return 0;
    
    const sum = userRatings.reduce((total, rating) => total + rating.score, 0);
    return sum / userRatings.length;
  };

  const initiateVideoCall = (senderId: string, receiverId: string) => {
    sendMessage(
      senderId, 
      receiverId, 
      "Would you like to join a video call?", 
      'video-request'
    );

    toast({
      title: "Video call requested",
      description: "Waiting for response...",
    });
  };

  const acceptVideoCall = (senderId: string, receiverId: string) => {
    sendMessage(
      senderId,
      receiverId,
      "Video call accepted. Joining now...",
      'video-accepted'
    );

    toast({
      title: "Video call accepted",
      description: "Connecting to video call...",
    });
  };

  const rejectVideoCall = (senderId: string, receiverId: string) => {
    sendMessage(
      senderId,
      receiverId,
      "Can't join a video call right now.",
      'video-rejected'
    );

    toast({
      title: "Video call rejected",
      description: "The video call was declined",
    });
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        skills,
        conversations,
        messages,
        sessions,
        ratings,
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
        addAvailability,
        deleteAvailability,
        getUserAvailability,
        createSession,
        updateSessionStatus,
        getUserSessions,
        addRating,
        getUserRatings,
        getAverageUserRating,
        initiateVideoCall,
        acceptVideoCall,
        rejectVideoCall,
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
