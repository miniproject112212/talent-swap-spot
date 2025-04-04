
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Login() {
  const { login, users } = useApp();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // For a real app, we'd have actual auth. For this demo, we'll just let users pick an account
  const handleLogin = () => {
    if (!selectedUser) return;
    
    login(selectedUser);
    navigate('/');
  };
  
  return (
    <main className="py-20">
      <div className="container-custom max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to SkillSwap</h1>
          <p className="text-muted-foreground mt-2">
            Connect with others to exchange skills and knowledge
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose an account to continue (Demo Mode)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a demo account to use:
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`
                      p-3 border rounded-md flex items-center gap-3 cursor-pointer transition-all
                      ${selectedUser === user.id ? 'border-skillswap-teal ring-1 ring-skillswap-teal' : ''}
                    `}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.location}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleLogin}
                disabled={!selectedUser}
              >
                Continue
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                This is a demo application. In a real-world scenario, this would be a secure authentication system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
