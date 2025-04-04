
import React, { ReactNode } from 'react';
import { UserProvider, useUser } from './providers/UserProvider';
import { SkillProvider, useSkill } from './providers/SkillProvider';
import { MessageProvider, useMessage } from './providers/MessageProvider';
import { ScheduleProvider, useSchedule } from './providers/ScheduleProvider';

// Re-export all hooks for easier access
export { useUser } from './providers/UserProvider';
export { useSkill } from './providers/SkillProvider';
export { useMessage } from './providers/MessageProvider';
export { useSchedule } from './providers/ScheduleProvider';

// Combine all provider contexts
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <SkillProvider>
        <MessageProvider>
          <ScheduleProvider>
            {children}
          </ScheduleProvider>
        </MessageProvider>
      </SkillProvider>
    </UserProvider>
  );
}

// Create a hook that combines all context hooks
export function useApp() {
  const user = useUser();
  const skill = useSkill();
  const message = useMessage();
  const schedule = useSchedule();

  return {
    // User context
    users: user.users,
    currentUser: user.currentUser,
    login: user.login,
    logout: user.logout,
    getUserById: user.getUserById,
    
    // Skill context
    skills: skill.skills,
    addSkill: skill.addSkill,
    addSkillToUser: skill.addSkillToUser,
    deleteSkill: skill.deleteSkill,
    getSkillById: skill.getSkillById,
    
    // Message context
    conversations: message.conversations,
    messages: message.messages,
    sendMessage: message.sendMessage,
    getConversation: message.getConversation,
    getMessagesForConversation: message.getMessagesForConversation,
    initiateVideoCall: message.initiateVideoCall,
    acceptVideoCall: message.acceptVideoCall,
    rejectVideoCall: message.rejectVideoCall,
    
    // Schedule context
    sessions: schedule.sessions,
    ratings: schedule.ratings,
    addAvailability: schedule.addAvailability,
    deleteAvailability: schedule.deleteAvailability,
    getUserAvailability: schedule.getUserAvailability,
    createSession: schedule.createSession,
    updateSessionStatus: schedule.updateSessionStatus,
    getUserSessions: schedule.getUserSessions,
    addRating: schedule.addRating,
    getUserRatings: schedule.getUserRatings,
    getAverageUserRating: schedule.getAverageUserRating,
  };
}
