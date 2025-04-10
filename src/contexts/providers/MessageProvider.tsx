
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message, Conversation } from '@/types';
import { mockConversations, mockMessages } from '@/data/mockData';
import { useToast } from "@/hooks/use-toast";

type MessageContextType = {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (senderId: string, receiverId: string, content: string, type?: Message['type']) => void;
  getConversation: (userId1: string, userId2: string) => Conversation | undefined;
  getMessagesForConversation: (conversationId: string) => Message[];
  initiateVideoCall: (senderId: string, receiverId: string) => void;
  acceptVideoCall: (senderId: string, receiverId: string) => void;
  rejectVideoCall: (senderId: string, receiverId: string) => void;
  markAsRead: (messageId: string) => void;
};

export const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const { toast } = useToast();

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

  const markAsRead = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
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
    <MessageContext.Provider
      value={{
        conversations,
        messages,
        sendMessage,
        getConversation,
        getMessagesForConversation,
        initiateVideoCall,
        acceptVideoCall,
        rejectVideoCall,
        markAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}
