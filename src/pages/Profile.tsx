import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Save, User, MapPin, Mail, CalendarDays, GraduationCap } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import AddSkillForm from '@/components/AddSkillForm';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, getUserById, updateUser, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [editedBio, setEditedBio] = useState(currentUser?.bio || '');
  const [editedLocation, setEditedLocation] = useState(currentUser?.location || '');

  const profileUser = userId ? getUserById(userId) : currentUser;

  if (!profileUser) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditedName(profileUser.name);
    setEditedBio(profileUser.bio);
    setEditedLocation(profileUser.location);
  };

  const handleSaveProfile = () => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      name: editedName,
      bio: editedBio,
      location: editedLocation,
    };

    updateUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <main className="container-custom py-12">
      <Card className="border-2 border-orange-200 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-orange-600">
            {profileUser.id === currentUser?.id ? "Your Profile" : profileUser.name}
          </CardTitle>
          {profileUser.id === currentUser?.id && (
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveProfile} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={handleEditProfile}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {profileUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                {isEditing ? (
                  <Input
                    placeholder="Your Name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  <CardTitle className="text-xl font-bold">{profileUser.name}</CardTitle>
                )}
                <p className="text-muted-foreground">
                  {profileUser.email}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-lg font-medium">
                <User className="mr-2 h-5 w-5 inline-block align-middle" />
                About
              </Label>
              {isEditing ? (
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                />
              ) : (
                <CardDescription>{profileUser.bio}</CardDescription>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-lg font-medium">
                <MapPin className="mr-2 h-5 w-5 inline-block align-middle" />
                Location
              </Label>
              {isEditing ? (
                <Input
                  placeholder="Your Location"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                />
              ) : (
                <CardDescription>{profileUser.location}</CardDescription>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-lg font-medium">
                <GraduationCap className="mr-2 h-5 w-5 inline-block align-middle" />
                Skills to Teach
              </Label>
              <ScrollArea className="h-[200px] w-full rounded-md border">
                <div className="p-4">
                  {profileUser.skillsToTeach.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {profileUser.skillsToTeach.map((skill) => (
                        <li key={skill.id}>{skill.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <CardDescription>No skills to teach yet.</CardDescription>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="grid gap-2">
              <Label className="text-lg font-medium">
                <GraduationCap className="mr-2 h-5 w-5 inline-block align-middle" />
                Skills to Learn
              </Label>
              <ScrollArea className="h-[200px] w-full rounded-md border">
                <div className="p-4">
                  {profileUser.skillsToLearn.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {profileUser.skillsToLearn.map((skill) => (
                        <li key={skill.id}>{skill.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <CardDescription>No skills to learn yet.</CardDescription>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end space-x-2 p-4">
          {profileUser.id === currentUser?.id && (
            <>
              {/* Add Skill Dialog */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
                    <Plus size={16} />
                    Add Skill
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                    <DialogDescription>
                      Select whether you want to teach this skill or learn it
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="teach">
                    <TabsList className="grid grid-cols-2 w-full mb-6">
                      <TabsTrigger value="teach">Skills to Teach</TabsTrigger>
                      <TabsTrigger value="learn">Skills to Learn</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="teach">
                      <AddSkillForm type="teach" onAddComplete={() => setOpen(false)} />
                    </TabsContent>
                    
                    <TabsContent value="learn">
                      <AddSkillForm type="learn" onAddComplete={() => setOpen(false)} />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </Card>
    </main>
  );
}
