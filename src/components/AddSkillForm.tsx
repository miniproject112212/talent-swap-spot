
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Skill, SkillCategory, SkillLevel } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload } from 'lucide-react';

interface AddSkillFormProps {
  type: 'teach' | 'learn';
  onAddComplete?: () => void;
}

export default function AddSkillForm({ type, onAddComplete }: AddSkillFormProps) {
  const { addSkill, currentUser } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Technology');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillCategories: SkillCategory[] = [
    "Technology", "Art", "Language", "Music", 
    "Cooking", "Sports", "Academics", "Business", "Crafts", "Other"
  ];

  const skillLevels: SkillLevel[] = [
    "Beginner", "Intermediate", "Advanced", "Expert"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);

    const newSkill: Omit<Skill, 'id'> = {
      name,
      category,
      description,
      level,
      userId: currentUser.id,
      image,
      type
    };

    addSkill(newSkill);
    
    // Reset form
    setName('');
    setCategory('Technology');
    setDescription('');
    setLevel('Beginner');
    setImage(null);
    setIsSubmitting(false);
    
    if (onAddComplete) {
      onAddComplete();
    }
  };

  return (
    <Card className="w-full border-2 border-orange-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-orange-600">
          {type === 'teach' ? 'Add a Skill to Teach' : 'Add a Skill to Learn'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Indian Cooking, Python Programming, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: SkillCategory) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Skill Level</Label>
            <Select value={level} onValueChange={(value: SkillLevel) => setLevel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'teach' ? "Describe what you can teach others about this skill..." : "Describe what you'd like to learn about this skill..."}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Skill Image (Optional)</Label>
            <div className="flex items-center space-x-4">
              {image ? (
                <div className="relative w-24 h-24 rounded-md overflow-hidden border-2 border-orange-200">
                  <img src={image} alt="Skill" className="w-full h-full object-cover" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-0 right-0 h-6 w-6" 
                    onClick={() => setImage(null)}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div>
                <Label htmlFor="skill-image" className="cursor-pointer">
                  <div className="flex items-center space-x-2 text-primary">
                    <Upload className="h-4 w-4" />
                    <span>Upload image</span>
                  </div>
                </Label>
                <input
                  id="skill-image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image that represents this skill
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Skill"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
