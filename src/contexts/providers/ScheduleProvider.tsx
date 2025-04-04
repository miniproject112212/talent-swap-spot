
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Availability, Session, Rating } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useUser } from './UserProvider';

type ScheduleContextType = {
  sessions: Session[];
  ratings: Rating[];
  addAvailability: (userId: string, availability: Omit<Availability, "id" | "userId" | "isBooked">) => void;
  deleteAvailability: (userId: string, availabilityId: string) => void;
  getUserAvailability: (userId: string) => Availability[];
  createSession: (session: Omit<Session, "id" | "status" | "rating">) => void;
  updateSessionStatus: (sessionId: string, status: Session['status']) => void;
  getUserSessions: (userId: string) => Session[];
  addRating: (rating: Omit<Rating, "id" | "timestamp">) => void;
  getUserRatings: (userId: string) => Rating[];
  getAverageUserRating: (userId: string) => number;
};

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const { toast } = useToast();
  const { users, updateUser } = useUser();

  const addAvailability = (userId: string, availability: Omit<Availability, "id" | "userId" | "isBooked">) => {
    const newAvailability: Availability = {
      id: `a${Math.random().toString(36).substr(2, 9)}`,
      userId,
      isBooked: false,
      ...availability,
    };

    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        availability: [...(user.availability || []), newAvailability]
      };
      updateUser(updatedUser);

      toast({
        title: "Availability added",
        description: "Your availability has been added successfully",
      });
    }
  };

  const deleteAvailability = (userId: string, availabilityId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.availability) {
      const updatedUser = {
        ...user,
        availability: user.availability.filter(a => a.id !== availabilityId)
      };
      updateUser(updatedUser);

      toast({
        title: "Availability removed",
        description: "The availability slot has been removed",
      });
    }
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

    const hostUser = users.find(u => u.id === session.hostUserId);
    if (hostUser && hostUser.availability) {
      const updatedUser = {
        ...hostUser,
        availability: hostUser.availability.map(a => {
          if (a.date.getTime() === session.date.getTime() && 
              a.startTime === session.startTime && 
              a.endTime === session.endTime) {
            return { ...a, isBooked: true, bookedWith: session.guestUserId };
          }
          return a;
        })
      };
      updateUser(updatedUser);
    }

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

  return (
    <ScheduleContext.Provider
      value={{
        sessions,
        ratings,
        addAvailability,
        deleteAvailability,
        getUserAvailability,
        createSession,
        updateSessionStatus,
        getUserSessions,
        addRating,
        getUserRatings,
        getAverageUserRating,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
