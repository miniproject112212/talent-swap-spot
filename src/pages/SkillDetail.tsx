
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserCard from '@/components/UserCard';

export default function SkillDetail() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { skills, users, getSkillById } = useApp();
  
  const skill = skillId ? getSkillById(skillId) : null;
  
  // Find users that teach this skill
  const teachingUsers = users.filter(user => 
    user.skillsToTeach.some(s => s.id === skillId)
  );
  
  // Find users that want to learn this skill
  const learningUsers = users.filter(user => 
    user.skillsToLearn.some(s => s.id === skillId)
  );
  
  if (!skill) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Skill not found</h1>
        <Button onClick={() => navigate('/explore')}>Explore Skills</Button>
      </div>
    );
  }
  
  return (
    <main className="container-custom py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">{skill.category}</Badge>
              <CardTitle className="text-3xl">{skill.name}</CardTitle>
            </div>
            <Badge className={`
              ${skill.level === 'Beginner' && 'bg-green-100 text-green-800 hover:bg-green-100'}
              ${skill.level === 'Intermediate' && 'bg-blue-100 text-blue-800 hover:bg-blue-100'}
              ${skill.level === 'Advanced' && 'bg-purple-100 text-purple-800 hover:bg-purple-100'}
              ${skill.level === 'Expert' && 'bg-red-100 text-red-800 hover:bg-red-100'}
            `}>
              {skill.level}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="mb-8">{skill.description}</p>
          
          {/* Users teaching this skill */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserRound className="h-5 w-5 mr-2 text-skillswap-teal" />
              People teaching {skill.name}
            </h3>
            
            {teachingUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachingUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No users are currently teaching this skill.</p>
            )}
          </div>
          
          {/* Users learning this skill */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserRound className="h-5 w-5 mr-2 text-skillswap-coral" />
              People wanting to learn {skill.name}
            </h3>
            
            {learningUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No users are currently looking to learn this skill.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
