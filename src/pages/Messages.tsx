import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Send, ArrowLeft, Search, Video, Calendar, X, PhoneCall } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Message as MessageType } from '@/types';
import { toast } from 'react-toastify';

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
    sendMessage,
    initiateVideoCall,
    acceptVideoCall,
    rejectVideoCall
  } = useApp();
  
  const [activeConversation, setActiveConversation] = useState<string | null>(userId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isVideoCallDialogOpen, setIsVideoCallDialogOpen] = useState(false);
  const [isIncomingCallDialogOpen, setIsIncomingCallDialogOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
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
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const latestMessages = activeMessages
      .filter(msg => msg.receiverId === currentUser.id && !msg.read)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const videoRequest = latestMessages.find(msg => msg.type === 'video-request');
    if (videoRequest && !isIncomingCallDialogOpen && !isVideoCallActive) {
      setIncomingCallFrom(videoRequest.senderId);
      setIsIncomingCallDialogOpen(true);
    }
    
    const videoAccepted = latestMessages.find(msg => msg.type === 'video-accepted');
    if (videoAccepted && !isVideoCallActive) {
      startVideoCall();
    }
  }, [activeMessages, currentUser]);
  
  const handleSelectConversation = (userId: string) => {
    setActiveConversation(userId);
    navigate(`/messages/${userId}`);
    setSearchQuery('');
  };
  
  const handleSendMessage = () => {
    if (!currentUser || !activeConversation || !messageInput.trim()) return;
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: activeConversation,
      content: messageInput.trim(),
      timestamp: new Date(),
      read: false,
      type: 'text' as const
    };
    
    if (activeConversationObj) {
      const conversationMessages = [...getMessagesForConversation(activeConversationObj.id), tempMessage];
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
    
    sendMessage(currentUser.id, activeConversation, messageInput.trim());
    setMessageInput('');
    
    toast({
      title: "Message sent",
      description: "Your message has been delivered",
      duration: 2000,
    });
  };
  
  const getOtherParticipant = (conversation: typeof conversations[0]) => {
    const otherId = conversation.participants.find(id => id !== currentUser?.id);
    return otherId ? getUserById(otherId) : null;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleInitiateVideoCall = () => {
    if (!currentUser || !activeConversation) return;
    
    initiateVideoCall(currentUser.id, activeConversation);
    setIsVideoCallDialogOpen(true);
  };
  
  const handleAcceptVideoCall = () => {
    if (!currentUser || !incomingCallFrom) return;
    
    acceptVideoCall(currentUser.id, incomingCallFrom);
    setIsIncomingCallDialogOpen(false);
    startVideoCall();
  };
  
  const handleRejectVideoCall = () => {
    if (!currentUser || !incomingCallFrom) return;
    
    rejectVideoCall(currentUser.id, incomingCallFrom);
    setIsIncomingCallDialogOpen(false);
    setIncomingCallFrom(null);
  };
  
  const startVideoCall = async () => {
    setIsVideoCallActive(true);
    setIsVideoCallDialogOpen(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setTimeout(() => {
        if (remoteVideoRef.current && localVideoRef.current) {
          remoteVideoRef.current.srcObject = localVideoRef.current.srcObject;
        }
      }, 2000);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };
  
  const endVideoCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const stream = remoteVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsVideoCallActive(false);
    setIsVideoCallDialogOpen(false);
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
      <h1 className="text-2xl font-bold mb-6 text-orange-600">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh]">
        <div className="md:col-span-1 border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8"
              />
            </div>
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
                          {conversation.lastMessage.type === 'video-request' ? '📹 Video call request' : 
                           conversation.lastMessage.type === 'video-accepted' ? '📹 Video call accepted' : 
                           conversation.lastMessage.type === 'video-rejected' ? '📹 Video call declined' : 
                           conversation.lastMessage.content}
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
        
        <div className="md:col-span-2 border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
          {activeUser ? (
            <>
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
                <div className="flex-grow">
                  <p className="font-medium">{activeUser.name}</p>
                  <p className="text-xs text-muted-foreground">{activeUser.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => navigate(`/schedule/${activeUser.id}`)}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleInitiateVideoCall}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  {activeMessages.length > 0 ? (
                    activeMessages.map(message => {
                      const isFromMe = message.senderId === currentUser.id;
                      
                      if (message.type && message.type !== 'text') {
                        return (
                          <div key={message.id} className="flex justify-center">
                            <div className="bg-gray-100 text-skillswap-darkGray rounded-lg px-4 py-2 text-sm">
                              {message.type === 'video-request' ? (
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  <span>
                                    {isFromMe 
                                      ? "You requested a video call" 
                                      : `${getUserById(message.senderId)?.name} requested a video call`}
                                  </span>
                                </div>
                              ) : message.type === 'video-accepted' ? (
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  <span>
                                    {isFromMe 
                                      ? "You accepted the video call" 
                                      : `${getUserById(message.senderId)?.name} accepted your video call`}
                                  </span>
                                </div>
                              ) : message.type === 'video-rejected' ? (
                                <div className="flex items-center gap-2">
                                  <X className="h-4 w-4" />
                                  <span>
                                    {isFromMe 
                                      ? "You declined the video call" 
                                      : `${getUserById(message.senderId)?.name} declined your video call`}
                                  </span>
                                </div>
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              max-w-[70%] p-3 rounded-lg
                              ${isFromMe 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 text-skillswap-darkGray'}
                            `}
                          >
                            <p>{message.content}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className={`
                                text-xs
                                ${isFromMe ? 'text-white/80' : 'text-gray-500'}
                              `}>
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              {isFromMe && (
                                <span className={`text-xs ${message.read ? 'text-white/80' : 'text-white/60'}`}>
                                  {message.read ? 'Read' : 'Delivered'}
                                </span>
                              )}
                            </div>
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
      
      <Dialog open={isVideoCallDialogOpen} onOpenChange={open => {
        if (!open) endVideoCall();
        setIsVideoCallDialogOpen(open);
      }}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Call {activeUser ? `with ${activeUser.name}` : ''}
              </div>
              <Button variant="destructive" size="sm" onClick={endVideoCall}>
                End Call
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full justify-center gap-4 relative">
            <div className="bg-gray-900 rounded-lg h-[calc(100%-100px)] overflow-hidden">
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute bottom-4 right-4 w-1/4 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video 
                ref={localVideoRef}
                autoPlay 
                playsInline
                muted
                className="w-full object-cover"
              />
            </div>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <PhoneCall className="h-6 w-6" />
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endVideoCall}>
                <X className="h-6 w-6" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <Video className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isIncomingCallDialogOpen} onOpenChange={setIsIncomingCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incoming Video Call</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-8">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage 
                src={incomingCallFrom ? getUserById(incomingCallFrom)?.avatar : undefined} 
                alt="Caller" 
              />
              <AvatarFallback className="text-3xl">
                {incomingCallFrom ? getUserById(incomingCallFrom)?.name.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-medium mb-6">
              {incomingCallFrom ? getUserById(incomingCallFrom)?.name : 'Someone'} is calling you
            </h3>
            
            <div className="flex gap-4">
              <Button variant="destructive" onClick={handleRejectVideoCall}>
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button variant="default" onClick={handleAcceptVideoCall}>
                <Video className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
