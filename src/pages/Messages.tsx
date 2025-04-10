
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMessages } from '@/contexts/providers/MessageProvider';
import { useUsers } from '@/contexts/providers/UserProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Message as MessageType } from '@/types';
import { toast } from 'sonner';

export default function Messages() {
  const { userId } = useParams();
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { messages, sendMessage, markAsRead } = useMessages();
  const { users, currentUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<number | null>(
    userId ? parseInt(userId) : null
  );

  // Filter conversations
  const conversations = users.filter(
    (user) => user.id !== currentUser?.id
  );

  // Get current conversation
  const currentConversation = messages.filter(
    (msg) =>
      (msg.senderId === currentUser?.id && msg.recipientId === selectedUser) ||
      (msg.recipientId === currentUser?.id && msg.senderId === selectedUser)
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Get unread message counts
  const getUnreadCount = (userId: number) => {
    return messages.filter(
      (msg) => msg.recipientId === currentUser?.id && msg.senderId === userId && !msg.read
    ).length;
  };

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (selectedUser && currentUser) {
      const unreadMessages = messages.filter(
        (msg) => msg.recipientId === currentUser.id && msg.senderId === selectedUser && !msg.read
      );
      
      unreadMessages.forEach((msg) => {
        markAsRead(msg.id);
      });
    }
  }, [selectedUser, messages, currentUser, markAsRead]);

  // Send message
  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    if (currentUser && selectedUser) {
      sendMessage({
        senderId: currentUser.id,
        recipientId: selectedUser,
        content: message,
        timestamp: new Date(),
        read: false,
      });
      setMessage('');
      toast("Message sent successfully!");
    } else {
      toast("Please select a user to message");
    }
  };

  // Get recipient name
  const getRecipientName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="p-4">
          <h2 className="font-semibold text-xl mb-4">Conversations</h2>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            variant="outline" 
            className="w-full mb-4"
          >
            New Message
          </Button>
          
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {conversations.map((user) => {
                const unreadCount = getUnreadCount(user.id);
                return (
                  <Link 
                    key={user.id} 
                    to={`/messages/${user.id}`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <div className={`flex items-center p-3 rounded-md hover:bg-muted transition-colors ${
                      selectedUser === user.id ? 'bg-muted' : ''
                    }`}>
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={user.avatar} alt={user.firstName} />
                        <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Message Area */}
        <Card className="p-4 col-span-1 md:col-span-2 flex flex-col h-[600px]">
          {selectedUser ? (
            <>
              {/* Message header */}
              <div className="border-b pb-3 mb-3">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    {selectedUser && (
                      <>
                        <AvatarImage 
                          src={users.find(u => u.id === selectedUser)?.avatar} 
                          alt={getRecipientName(selectedUser)} 
                        />
                        <AvatarFallback>
                          {getRecipientName(selectedUser).slice(0, 2)}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <h2 className="font-semibold text-xl">
                    {selectedUser && getRecipientName(selectedUser)}
                  </h2>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 p-2">
                  {currentConversation.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.senderId === currentUser?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className="text-xs mt-1 flex justify-end items-center">
                          {formatTime(msg.timestamp)}
                          {msg.senderId === currentUser?.id && (
                            <Check 
                              className={`h-4 w-4 ml-1 ${msg.read ? 'text-green-500' : 'text-gray-400'}`} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h3 className="text-xl font-medium mb-2">No Conversation Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a conversation from the list or start a new message
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                New Message
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* New Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              {conversations.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-3 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user.id);
                    setIsDialogOpen(false);
                  }}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.avatar} alt={user.firstName} />
                    <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
