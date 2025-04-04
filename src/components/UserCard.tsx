
import React from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row gap-4 items-center pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{user.name}</CardTitle>
          <CardDescription className="text-xs">
            {user.location} • Joined {user.joinedDate.toLocaleDateString()}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm line-clamp-2 mb-3">{user.bio}</p>
        
        {user.skillsToTeach.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-1">Teaching:</p>
            <div className="flex flex-wrap gap-1">
              {user.skillsToTeach.slice(0, 3).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
              {user.skillsToTeach.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{user.skillsToTeach.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {user.skillsToLearn.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Learning:</p>
            <div className="flex flex-wrap gap-1">
              {user.skillsToLearn.slice(0, 3).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
              {user.skillsToLearn.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{user.skillsToLearn.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/profile/${user.id}`}>View Profile</Link>
        </Button>
        <Button asChild className="w-full">
          <Link to={`/messages/${user.id}`}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
