
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Send, ArrowLeft, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { 
    currentUser, 
    users, 
    conversations, 
    getUserById, 
    getConversation, 
    getMessagesForConversation,
    sendMessage 
  } = useApp();
  const [activeConversation, setActiveConversation] = useState<string | null>(userId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeUser = activeConversation ? getUserById(activeConversation) : null;
  const activeConversationObj = activeConversation && currentUser
    ? getConversation(currentUser.id, activeConversation)
    : null;
  const activeMessages = activeConversationObj
    ? getMessagesForConversation(activeConversationObj.id)
    : [];

  const filteredConversations = conversations
    .filter(conv => currentUser && conv.participants.includes(currentUser.id))
    .filter(conv => {
      if (!searchQuery) return true;
      
      const otherParticipantId = conv.participants.find(id => id !== currentUser?.id);
      if (!otherParticipantId) return false;
      
      const otherUser = getUserById(otherParticipantId);
      if (!otherUser) return false;
      
      return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const filteredUsers = searchQuery ? users.filter(user => 
    user.id !== currentUser?.id && 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  useEffect(() => {
    if (userId && userId !== activeConversation) {
      setActiveConversation(userId);
      navigate(`/messages/${userId}`, { replace: true });
    }
  }, [userId, activeConversation, navigate]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);
  
  const handleSelectConversation = (userId: string) => {
    setActiveConversation(userId);
    navigate(`/messages/${userId}`);
    setSearchQuery('');
  };
  
  const handleSendMessage = () => {
    if (!currentUser || !activeConversation || !messageInput.trim()) return;
    
    sendMessage(currentUser.id, activeConversation, messageInput.trim());
    setMessageInput('');
  };
  
  const getOtherParticipant = (conversation: typeof conversations[0]) => {
    const otherId = conversation.participants.find(id => id !== currentUser?.id);
    return otherId ? getUserById(otherId) : null;
  };

  // Handle Enter key in message input  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  if (!currentUser) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view messages</h1>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }
  
  return (
    <main className="container-custom max-w-6xl py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh]">
        {/* Conversations List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="p-3 border-b">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              prefix={<Search className="h-4 w-4 text-muted-foreground mr-2" />}
            />
          </div>
          
          <ScrollArea className="flex-grow">
            {filteredConversations.length === 0 && searchQuery === '' ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No conversations yet</p>
                <p className="text-sm">Search for users to start chatting</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map(conversation => {
                  const otherUser = getOtherParticipant(conversation);
                  if (!otherUser) return null;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`
                        p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors
                        ${activeConversation === otherUser.id ? 'bg-gray-100' : ''}
                      `}
                      onClick={() => handleSelectConversation(otherUser.id)}
                    >
                      <Avatar>
                        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between">
                          <p className="font-medium truncate">{otherUser.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {conversation.updatedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {searchQuery && filteredUsers.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                      Search Results
                    </p>
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSelectConversation(user.id)}
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {searchQuery && filteredUsers.length === 0 && filteredConversations.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message Area */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
          {activeUser ? (
            <>
              {/* Conversation Header */}
              <div className="p-3 border-b flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden" 
                  onClick={() => setActiveConversation(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
                  <AvatarFallback>{activeUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{activeUser.name}</p>
                  <p className="text-xs text-muted-foreground">{activeUser.location}</p>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  {activeMessages.length > 0 ? (
                    activeMessages.map(message => {
                      const isFromMe = message.senderId === currentUser.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              max-w-[70%] p-3 rounded-lg
                              ${isFromMe 
                                ? 'bg-skillswap-teal text-white' 
                                : 'bg-gray-100 text-skillswap-darkGray'}
                            `}
                          >
                            <p>{message.content}</p>
                            <p className={`
                              text-xs mt-1
                              ${isFromMe ? 'text-white/80' : 'text-gray-500'}
                            `}>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No messages yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="p-3 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-grow"
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-4">
              <div>
                <h2 className="text-lg font-medium mb-2">Select a conversation</h2>
                <p className="text-muted-foreground">
                  Choose a user from the list or search for someone to start a new conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
