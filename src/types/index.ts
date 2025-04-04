
export type User = {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  location: string;
  skillsToTeach: Skill[];
  skillsToLearn: Skill[];
  joinedDate: Date;
  availability?: Availability[];
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
  type?: 'text' | 'video-request' | 'video-accepted' | 'video-rejected';
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage: Message;
  updatedAt: Date;
};

export type Availability = {
  id: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedWith?: string; // userId of the person the slot is booked with
};

export type Session = {
  id: string;
  hostUserId: string;
  guestUserId: string;
  skillId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  isVideoCall: boolean;
  rating?: Rating;
};

export type Rating = {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  score: number; // 1-5
  comment: string;
  timestamp: Date;
};
