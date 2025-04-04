
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, UserCircle, Camera } from 'lucide-react';

export default function Register() {
  const { users, login } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, check if email matches any user
    const user = users.find(u => u.email?.toLowerCase() === loginEmail.toLowerCase());
    
    if (user) {
      login(user.id);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
      });
      navigate('/');
    } else {
      toast({
        title: "Login failed",
        description: "Email or password is incorrect",
        variant: "destructive"
      });
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    // For demo purposes, create a new user ID and register
    const newUser: User = {
      id: `u${users.length + 1}`,
      name,
      email,
      bio,
      location,
      avatar: avatar || `https://source.unsplash.com/random/400x400/?indian,person`,
      joinedDate: new Date(),
      skillsToTeach: [],
      skillsToLearn: []
    };
    
    // In a real app, you would save this to a database
    // For demo, we'll use the login function to set as current user
    login(newUser.id);
    
    toast({
      title: "Registration successful",
      description: `Welcome to SkillSwap, ${name}!`,
    });
    
    navigate('/profile');
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <main className="py-20 bg-secondary/30">
      <div className="container-custom max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to SkillSwap India</h1>
          <p className="text-muted-foreground mt-2">
            Connect with others to exchange skills and knowledge
          </p>
        </div>
        
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to continue" 
                : "Fill in your details to join our community"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-2 group-hover:border-primary">
                        <AvatarImage src={avatar || undefined} />
                        <AvatarFallback className="bg-secondary text-primary">
                          {name ? name.charAt(0).toUpperCase() : <UserCircle className="w-12 h-12" />}
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="sr-only">Upload avatar</span>
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="Mumbai, India" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Brief Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell us a bit about yourself..." 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
