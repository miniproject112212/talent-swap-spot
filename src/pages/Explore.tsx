
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Skill, User, SkillCategory } from '@/types';
import SkillCard from '@/components/SkillCard';
import UserCard from '@/components/UserCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { allSkillCategories, allSkillLevels } from '@/data/mockData';

export default function Explore() {
  const { skills, users } = useApp();
  const [activeTab, setActiveTab] = useState('skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>(skills);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  useEffect(() => {
    // Filter skills based on search query and filters
    const skillResults = skills.filter((skill) => {
      const matchesSearch = 
        searchQuery === '' || 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = 
        categoryFilter === '' || 
        skill.category === categoryFilter;
        
      const matchesLevel = 
        levelFilter === '' || 
        skill.level === levelFilter;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
    
    setFilteredSkills(skillResults);
    
    // Filter users based on search query
    const userResults = users.filter((user) => {
      if (searchQuery === '') return true;
      
      const matchesName = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBio = user.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = user.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const hasMatchingTeachSkill = user.skillsToTeach.some(
        (skill) => skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const hasMatchingLearnSkill = user.skillsToLearn.some(
        (skill) => skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return matchesName || matchesBio || matchesLocation || 
             hasMatchingTeachSkill || hasMatchingLearnSkill;
    });
    
    setFilteredUsers(userResults);
  }, [searchQuery, categoryFilter, levelFilter, skills, users]);
  
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setLevelFilter('');
  };
  
  return (
    <main className="py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-6">Explore Skills & Users</h1>
        
        {/* Search & Filters */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search skills, topics, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            
            <div className="mt-4 flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {(categoryFilter || levelFilter) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
          
          {isFilterVisible && (
            <div className="bg-white p-4 rounded-md shadow-sm mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {allSkillCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Level</label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {allSkillLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="skills" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills" className="pt-2">
            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No skills found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button onClick={resetFilters}>Reset Filters</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="pt-2">
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search</p>
                <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
