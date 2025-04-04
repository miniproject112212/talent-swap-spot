
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageCircle, Calendar as CalendarIcon, Clock, Video, Plus, X } from 'lucide-react';
import { Availability, Session, Skill } from '@/types';
import { addDays, format, isSameDay, isToday, startOfDay } from 'date-fns';

export default function Schedule() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { 
    currentUser, 
    getUserById, 
    getUserAvailability, 
    addAvailability, 
    deleteAvailability, 
    createSession,
    getUserSessions,
    updateSessionStatus,
    getSkillById
  } = useApp();
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [addAvailabilityDialog, setAddAvailabilityDialog] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [isVideoCall, setIsVideoCall] = useState(true);
  
  // Get profile to display (current user or requested user)
  const profileUser = userId ? getUserById(userId) : currentUser;
  const isCurrentUserProfile = currentUser && (!userId || userId === currentUser.id);
  
  // Get availability and sessions data
  const userAvailability = profileUser ? getUserAvailability(profileUser.id) : [];
  const userSessions = currentUser ? getUserSessions(currentUser.id) : [];
  
  // Filter availability by selected date
  const availabilityForSelectedDate = userAvailability.filter(a => 
    isSameDay(a.date, selectedDate)
  );
  
  // Filter sessions by status
  const upcomingSessions = userSessions.filter(s => s.status === 'scheduled');
  const pastSessions = userSessions.filter(s => s.status === 'completed' || s.status === 'cancelled');
  
  if (!currentUser) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view the calendar</h1>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }
  
  const handleAddAvailability = () => {
    if (!currentUser) return;
    
    addAvailability(currentUser.id, {
      date: selectedDate,
      startTime,
      endTime,
    });
    
    setAddAvailabilityDialog(false);
  };
  
  const handleSelectAvailability = (availability: Availability) => {
    setSelectedAvailability(availability);
    setBookingDialog(true);
  };
  
  const handleBookSession = () => {
    if (!currentUser || !selectedAvailability || !selectedSkill) return;
    
    createSession({
      hostUserId: selectedAvailability.userId,
      guestUserId: currentUser.id,
      skillId: selectedSkill,
      date: selectedAvailability.date,
      startTime: selectedAvailability.startTime,
      endTime: selectedAvailability.endTime,
      isVideoCall,
    });
    
    setBookingDialog(false);
    setSelectedAvailability(null);
    setSelectedSkill('');
  };
  
  const handleUpdateSessionStatus = (sessionId: string, status: Session['status']) => {
    updateSessionStatus(sessionId, status);
  };
  
  // Generate time slots for selection
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  return (
    <main className="container-custom py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Schedule with {isCurrentUserProfile ? "Me" : profileUser.name}</CardTitle>
                {isCurrentUserProfile && (
                  <Button size="sm" variant="outline" onClick={() => setAddAvailabilityDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Availability
                  </Button>
                )}
              </div>
              <CardDescription>
                {isCurrentUserProfile 
                  ? "Manage your availability for skill swaps" 
                  : `View ${profileUser.name}'s availability and book a session`}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-center mb-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={date => date && setSelectedDate(date)}
                  disabled={(date) => date < startOfDay(new Date())}
                  className="rounded border p-2"
                />
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">
                  {isToday(selectedDate) 
                    ? "Today's Availability" 
                    : `Availability for ${format(selectedDate, 'MMM dd, yyyy')}`}
                </h3>
                
                {availabilityForSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {availabilityForSelectedDate.map((slot) => (
                      <div 
                        key={slot.id}
                        className="border rounded-md p-3 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                          {slot.isBooked && (
                            <Badge variant="secondary" className="ml-2">Booked</Badge>
                          )}
                        </div>
                        
                        {isCurrentUserProfile && !slot.isBooked ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteAvailability(currentUser.id, slot.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : !isCurrentUserProfile && !slot.isBooked && (
                          <Button 
                            size="sm"
                            onClick={() => handleSelectAvailability(slot)}
                          >
                            Book
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">
                    <p>No availability for this date</p>
                    {isCurrentUserProfile && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setAddAvailabilityDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {!isCurrentUserProfile && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate(`/profile/${profileUser.id}`)}>
                    View Profile
                  </Button>
                  <Button onClick={() => navigate(`/messages/${profileUser.id}`)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {isCurrentUserProfile && (
          <div className="lg:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>My Sessions</CardTitle>
                <CardDescription>Manage your upcoming and past skill swap sessions</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming">
                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => {
                          const otherUser = session.hostUserId === currentUser.id
                            ? getUserById(session.guestUserId)
                            : getUserById(session.hostUserId);
                          
                          const skillDetails = getSkillById(session.skillId);
                          
                          if (!otherUser || !skillDetails) return null;
                          
                          return (
                            <Card key={session.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <Avatar>
                                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-grow">
                                    <h3 className="font-medium">
                                      Session with {otherUser.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {format(session.date, 'MMM dd, yyyy')} • {session.startTime} - {session.endTime}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary">{skillDetails.name}</Badge>
                                      {session.isVideoCall && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                          <Video className="h-3 w-3 mr-1" /> Video Call
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {session.isVideoCall && (
                                      <Button 
                                        variant="outline"
                                        onClick={() => navigate(`/messages/${otherUser.id}`)}
                                      >
                                        <Video className="h-4 w-4 mr-2" />
                                        Join
                                      </Button>
                                    )}
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleUpdateSessionStatus(session.id, 'cancelled')}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border rounded-md">
                        <p>No upcoming sessions</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => navigate('/explore')}
                        >
                          Find People to Connect
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past">
                    {pastSessions.length > 0 ? (
                      <div className="space-y-4">
                        {pastSessions.map((session) => {
                          const otherUser = session.hostUserId === currentUser.id
                            ? getUserById(session.guestUserId)
                            : getUserById(session.hostUserId);
                          
                          const skillDetails = getSkillById(session.skillId);
                          
                          if (!otherUser || !skillDetails) return null;
                          
                          return (
                            <Card key={session.id} className="opacity-80">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <Avatar>
                                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">
                                        Session with {otherUser.name}
                                      </h3>
                                      <Badge
                                        variant={session.status === 'completed' ? 'default' : 'destructive'}
                                        className="ml-2"
                                      >
                                        {session.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {format(session.date, 'MMM dd, yyyy')} • {session.startTime} - {session.endTime}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary">{skillDetails.name}</Badge>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline"
                                    onClick={() => navigate(`/profile/${otherUser.id}`)}
                                  >
                                    View Profile
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border rounded-md">
                        <p>No past sessions</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Add Availability Dialog */}
      <Dialog open={addAvailabilityDialog} onOpenChange={setAddAvailabilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Set your availability for {format(selectedDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={startTime}
                  onValueChange={setStartTime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={endTime}
                  onValueChange={setEndTime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions
                      .filter(time => time > startTime)
                      .map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAvailabilityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAvailability}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Book Session Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a Session</DialogTitle>
            <DialogDescription>
              Book a skill swap session with {profileUser.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAvailability && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{format(selectedAvailability.date, 'MMMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedAvailability.startTime} - {selectedAvailability.endTime}</span>
              </div>
              
              <div>
                <Label htmlFor="skill">What skill would you like to learn?</Label>
                <Select
                  value={selectedSkill}
                  onValueChange={setSelectedSkill}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {profileUser.skillsToTeach.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name} ({skill.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="videoCall"
                  checked={isVideoCall}
                  onChange={() => setIsVideoCall(!isVideoCall)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="videoCall" className="cursor-pointer">
                  Make this a video call session
                </Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookSession} disabled={!selectedSkill}>Book Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
