
import React from 'react';
import { Skill } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SkillCardProps {
  skill: Skill;
  showDetails?: boolean;
}

export default function SkillCard({ skill, showDetails = true }: SkillCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="bg-skillswap-lightGray">
            {skill.category}
          </Badge>
          <Badge className={`
            ${skill.level === 'Beginner' && 'bg-green-100 text-green-800 hover:bg-green-100'}
            ${skill.level === 'Intermediate' && 'bg-blue-100 text-blue-800 hover:bg-blue-100'}
            ${skill.level === 'Advanced' && 'bg-purple-100 text-purple-800 hover:bg-purple-100'}
            ${skill.level === 'Expert' && 'bg-red-100 text-red-800 hover:bg-red-100'}
          `}>
            {skill.level}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-2">{skill.name}</CardTitle>
        <CardDescription className="text-sm text-skillswap-darkGray line-clamp-2">
          {skill.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {/* Content can be added here if needed */}
      </CardContent>
      
      {showDetails && (
        <CardFooter className="pt-0">
          <Link 
            to={`/skill/${skill.id}`} 
            className="text-skillswap-teal hover:text-skillswap-teal/80 text-sm font-medium flex items-center"
          >
            View details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
