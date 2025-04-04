
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import SkillCard from '@/components/SkillCard';
import { MessageCircle, Plus, MapPin, Calendar, Edit, Camera, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allSkillCategories, allSkillLevels } from '@/data/mockData';
import { Skill, SkillCategory, SkillLevel, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, getUserById, addSkill, addSkillToUser, deleteSkill, updateUser } = useApp();
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [formType, setFormType] = useState<'teach' | 'learn'>('teach');
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState<SkillCategory>('Technology');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Beginner');
  const [skillDescription, setSkillDescription] = useState('');
  const [skillImage, setSkillImage] = useState<string | null>(null);
  
  // Profile edit state
  const [editedUser, setEditedUser] = useState<User | null>(null);
  
  // Get profile to display (current user or requested user)
  const profileUser = userId ? getUserById(userId) : currentUser;
  const isCurrentUserProfile = currentUser && (!userId || userId === currentUser.id);
  
  if (!profileUser) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }
  
  const handleAddSkill = () => {
    if (!currentUser) return;
    
    const newSkill: Omit<Skill, 'id'> = {
      name: skillName,
      category: skillCategory,
      description: skillDescription,
      level: skillLevel,
      userId: currentUser.id,
      image: skillImage || `https://source.unsplash.com/random/800x600/?${skillName.split(' ')[0]},india`
    };
    
    addSkill(newSkill);
    
    // Clean up form
    setSkillName('');
    setSkillCategory('Technology');
    setSkillLevel('Beginner');
    setSkillDescription('');
    setSkillImage(null);
    setAddSkillDialogOpen(false);
  };
  
  const handleSkillImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSkillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editedUser) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setEditedUser({
        ...editedUser,
        avatar: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };
  
  const startEditing = () => {
    if (!profileUser) return;
    setEditedUser({...profileUser});
    setEditMode(true);
  };
  
  const saveProfile = () => {
    if (!editedUser) return;
    
    updateUser(editedUser);
    setEditMode(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  return (
    <main className="container-custom py-8">
      <Card className="border-2 border-primary/20">
        <CardHeader className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-primary/50">
                {editMode ? (
                  <AvatarImage src={editedUser?.avatar} alt={editedUser?.name} />
                ) : (
                  <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                )}
                <AvatarFallback className="text-3xl bg-secondary text-primary">
                  {editMode ? editedUser?.name.charAt(0) : profileUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {editMode && (
                <>
                  <button 
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </>
              )}
            </div>
            
            <div className="flex-grow">
              {editMode ? (
                <div className="space-y-3 mb-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={editedUser?.name || ''}
                      onChange={(e) => setEditedUser({...editedUser!, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      value={editedUser?.location || ''}
                      onChange={(e) => setEditedUser({...editedUser!, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio"
                      value={editedUser?.bio || ''}
                      onChange={(e) => setEditedUser({...editedUser!, bio: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">{profileUser.name}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profileUser.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {profileUser.joinedDate.toLocaleDateString()}</span>
                  </div>
                </>
              )}
              
              <div className="mt-4 flex flex-wrap gap-2">
                {isCurrentUserProfile && !editMode && (
                  <Button variant="outline" onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                )}
                
                {isCurrentUserProfile && editMode && (
                  <>
                    <Button onClick={saveProfile}>
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </>
                )}
                
                {!isCurrentUserProfile && (
                  <Button onClick={() => navigate(`/messages/${profileUser.id}`)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {!editMode && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p>{profileUser.bio}</p>
            </div>
          )}
          
          <Tabs defaultValue="teaching">
            <TabsList>
              <TabsTrigger value="teaching">Skills Teaching</TabsTrigger>
              <TabsTrigger value="learning">Skills Learning</TabsTrigger>
            </TabsList>
            
            {/* Skills Teaching Tab */}
            <TabsContent value="teaching" className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Skills {profileUser.name} can teach</h3>
                
                {isCurrentUserProfile && (
                  <Dialog open={addSkillDialogOpen && formType === 'teach'} onOpenChange={(open) => {
                    setAddSkillDialogOpen(open); 
                    if (open) setFormType('teach');
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a Skill You Can Teach</DialogTitle>
                        <DialogDescription>
                          Share a skill you're proficient in and would like to teach others.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Skill Name</Label>
                          <Input 
                            id="name" 
                            value={skillName} 
                            onChange={(e) => setSkillName(e.target.value)}
                            placeholder="e.g., Yoga" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={skillCategory} 
                              onValueChange={(value) => setSkillCategory(value as SkillCategory)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSkillCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="level">Your Level</Label>
                            <Select 
                              value={skillLevel} 
                              onValueChange={(value) => setSkillLevel(value as SkillLevel)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSkillLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="skill-image">Skill Image</Label>
                          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center">
                            {skillImage ? (
                              <div className="relative">
                                <img 
                                  src={skillImage} 
                                  alt="Skill preview" 
                                  className="w-full h-32 object-cover rounded-md mx-auto" 
                                />
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="absolute top-1 right-1"
                                  onClick={() => setSkillImage(null)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Label 
                                  htmlFor="skill-image-input" 
                                  className="cursor-pointer flex flex-col items-center justify-center h-24"
                                >
                                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload an image
                                  </span>
                                </Label>
                                <input 
                                  id="skill-image-input"
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleSkillImageUpload}
                                />
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            value={skillDescription}
                            onChange={(e) => setSkillDescription(e.target.value)}
                            placeholder="Describe what you can teach, your experience level, etc." 
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            onClick={handleAddSkill}
                            disabled={!skillName.trim() || !skillDescription.trim()}
                          >
                            Add Skill
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              {profileUser.skillsToTeach.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No teaching skills listed yet</p>
                  
                  {isCurrentUserProfile && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setFormType('teach');
                        setAddSkillDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Skill
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileUser.skillsToTeach.map((skill) => (
                    <div key={skill.id} className="relative">
                      <SkillCard skill={skill} showDetails={false} />
                      {isCurrentUserProfile && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => deleteSkill(skill.id, profileUser.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Skills Learning Tab */}
            <TabsContent value="learning" className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Skills {profileUser.name} wants to learn</h3>
                
                {isCurrentUserProfile && (
                  <Dialog open={addSkillDialogOpen && formType === 'learn'} onOpenChange={(open) => {
                    setAddSkillDialogOpen(open);
                    if (open) setFormType('learn');
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a Skill You Want to Learn</DialogTitle>
                        <DialogDescription>
                          Add a skill you're interested in learning from others.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Skill Name</Label>
                          <Input 
                            id="name" 
                            value={skillName} 
                            onChange={(e) => setSkillName(e.target.value)}
                            placeholder="e.g., Classical Dance" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={skillCategory} 
                              onValueChange={(value) => setSkillCategory(value as SkillCategory)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSkillCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="level">Desired Level</Label>
                            <Select 
                              value={skillLevel} 
                              onValueChange={(value) => setSkillLevel(value as SkillLevel)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSkillLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="skill-image-learn">Skill Image</Label>
                          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center">
                            {skillImage ? (
                              <div className="relative">
                                <img 
                                  src={skillImage} 
                                  alt="Skill preview" 
                                  className="w-full h-32 object-cover rounded-md mx-auto" 
                                />
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="absolute top-1 right-1"
                                  onClick={() => setSkillImage(null)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Label 
                                  htmlFor="skill-image-input-learn" 
                                  className="cursor-pointer flex flex-col items-center justify-center h-24"
                                >
                                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload an image
                                  </span>
                                </Label>
                                <input 
                                  id="skill-image-input-learn"
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleSkillImageUpload}
                                />
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            value={skillDescription}
                            onChange={(e) => setSkillDescription(e.target.value)}
                            placeholder="Describe what you want to learn, your current level, etc." 
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            onClick={handleAddSkill}
                            disabled={!skillName.trim() || !skillDescription.trim()}
                          >
                            Add Skill
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              {profileUser.skillsToLearn.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No learning skills listed yet</p>
                  
                  {isCurrentUserProfile && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setFormType('learn');
                        setAddSkillDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Skill
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileUser.skillsToLearn.map((skill) => (
                    <div key={skill.id} className="relative">
                      <SkillCard skill={skill} showDetails={false} />
                      {isCurrentUserProfile && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => deleteSkill(skill.id, profileUser.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
