
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Skill } from '@/types';
import { mockSkills } from '@/data/mockData';
import { useToast } from "@/hooks/use-toast";
import { useUser } from './UserProvider';

type SkillContextType = {
  skills: Skill[];
  addSkill: (skill: Omit<Skill, "id">) => void;
  addSkillToUser: (userId: string, skillId: string, type: 'teach' | 'learn') => void;
  deleteSkill: (skillId: string, userId: string) => void;
  getSkillById: (skillId: string) => Skill | undefined;
};

export const SkillContext = createContext<SkillContextType | undefined>(undefined);

export function SkillProvider({ children }: { children: ReactNode }) {
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const { toast } = useToast();
  const { currentUser, users, updateUser } = useUser();

  const addSkill = (skill: Omit<Skill, "id">) => {
    if (!currentUser) return;
    
    const newSkill: Skill = {
      ...skill,
      id: `s${skills.length + 1}`,
      userId: currentUser.id,
      // Ensure there's an image, even if none was provided
      image: skill.image || `https://source.unsplash.com/random/800x600/?${skill.name.split(' ')[0]},india`
    };
    
    setSkills([...skills, newSkill]);
    
    // Also add the skill to the user's profile
    const user = users.find(u => u.id === currentUser.id);
    if (user) {
      const updatedUser = { ...user };
      if (currentUser.id === skill.userId) {
        if (skill.type === 'teach') {
          updatedUser.skillsToTeach = [...updatedUser.skillsToTeach, newSkill];
        } else {
          updatedUser.skillsToLearn = [...updatedUser.skillsToLearn, newSkill];
        }
        updateUser(updatedUser);
      }
    }
    
    toast({
      title: "Skill added",
      description: `${skill.name} has been added successfully`,
    });
  };

  const addSkillToUser = (userId: string, skillId: string, type: 'teach' | 'learn') => {
    const user = users.find(u => u.id === userId);
    const skill = skills.find(s => s.id === skillId);
    
    if (!user || !skill) return;
    
    const updatedUser = { ...user };
    
    if (type === 'teach') {
      updatedUser.skillsToTeach = [...updatedUser.skillsToTeach, skill];
    } else {
      updatedUser.skillsToLearn = [...updatedUser.skillsToLearn, skill];
    }
    
    updateUser(updatedUser);
    
    toast({
      title: "Skill added to profile",
      description: `${skill.name} has been added to your ${type === 'teach' ? 'teaching' : 'learning'} skills`,
    });
  };

  const deleteSkill = (skillId: string, userId: string) => {
    const updatedSkills = skills.filter(s => !(s.id === skillId && s.userId === userId));
    setSkills(updatedSkills);
    
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        skillsToTeach: user.skillsToTeach.filter(s => s.id !== skillId),
        skillsToLearn: user.skillsToLearn.filter(s => s.id !== skillId),
      };
      
      updateUser(updatedUser);
    }
    
    toast({
      title: "Skill removed",
      description: "The skill has been removed successfully",
    });
  };

  const getSkillById = (skillId: string) => {
    return skills.find(s => s.id === skillId);
  };

  return (
    <SkillContext.Provider
      value={{
        skills,
        addSkill,
        addSkillToUser,
        deleteSkill,
        getSkillById,
      }}
    >
      {children}
    </SkillContext.Provider>
  );
}

export function useSkill() {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkill must be used within a SkillProvider');
  }
  return context;
}
