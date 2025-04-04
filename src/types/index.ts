
export type User = {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  location: string;
  skillsToTeach: Skill[];
  skillsToLearn: Skill[];
  joinedDate: Date;
};

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  level: SkillLevel;
  userId?: string;
};

export type SkillCategory = 
  | "Technology"
  | "Art"
  | "Language"
  | "Music"
  | "Cooking"
  | "Sports"
  | "Academics"
  | "Business"
  | "Crafts"
  | "Other";

export type SkillLevel = 
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage: Message;
  updatedAt: Date;
};
