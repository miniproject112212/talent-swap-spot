
import { User, Skill, Message, Conversation } from "../types";

// Mock Skills
export const mockSkills: Skill[] = [
  {
    id: "s1",
    name: "React Development",
    category: "Technology",
    description: "Learn to build modern UIs with React and its ecosystem",
    level: "Intermediate",
  },
  {
    id: "s2",
    name: "Watercolor Painting",
    category: "Art",
    description: "Techniques for creating beautiful watercolor paintings",
    level: "Beginner",
  },
  {
    id: "s3",
    name: "Spanish Language",
    category: "Language",
    description: "Conversational Spanish for beginners to intermediate learners",
    level: "Intermediate",
  },
  {
    id: "s4",
    name: "Guitar Basics",
    category: "Music",
    description: "Learn chords, strumming patterns, and simple songs",
    level: "Beginner",
  },
  {
    id: "s5",
    name: "Italian Cooking",
    category: "Cooking",
    description: "Authentic Italian dishes from scratch",
    level: "Intermediate",
  },
  {
    id: "s6",
    name: "Digital Photography",
    category: "Art",
    description: "Composition, lighting, and editing techniques",
    level: "Advanced",
  },
  {
    id: "s7",
    name: "Python Programming",
    category: "Technology",
    description: "Foundations and practical applications of Python",
    level: "Beginner",
  },
  {
    id: "s8",
    name: "Yoga Instruction",
    category: "Sports",
    description: "Proper alignment and flow sequences",
    level: "Advanced",
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Alex Johnson",
    bio: "Full stack developer passionate about teaching and learning new technologies.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    location: "San Francisco, CA",
    skillsToTeach: [mockSkills[0], mockSkills[6]],
    skillsToLearn: [mockSkills[1], mockSkills[7]],
    joinedDate: new Date("2023-01-15"),
  },
  {
    id: "u2",
    name: "Maya Rodriguez",
    bio: "Artist and language enthusiast looking to exchange creative skills.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    location: "New York, NY",
    skillsToTeach: [mockSkills[1], mockSkills[2]],
    skillsToLearn: [mockSkills[0], mockSkills[4]],
    joinedDate: new Date("2023-02-20"),
  },
  {
    id: "u3",
    name: "Liam Chen",
    bio: "Musician and cooking hobbyist with a love for teaching others.",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    location: "Austin, TX",
    skillsToTeach: [mockSkills[3], mockSkills[4]],
    skillsToLearn: [mockSkills[6], mockSkills[2]],
    joinedDate: new Date("2023-03-11"),
  },
  {
    id: "u4",
    name: "Sophia Ahmed",
    bio: "Professional photographer and yoga instructor seeking to learn coding.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    location: "Portland, OR",
    skillsToTeach: [mockSkills[5], mockSkills[7]],
    skillsToLearn: [mockSkills[0], mockSkills[6]],
    joinedDate: new Date("2023-01-30"),
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: "m1",
    senderId: "u1",
    receiverId: "u2",
    content: "Hi Maya, I saw you're teaching watercolor painting. I'd love to learn!",
    timestamp: new Date("2023-03-15T10:30:00"),
    read: true,
  },
  {
    id: "m2",
    senderId: "u2",
    receiverId: "u1",
    content: "Hey Alex! Yes, I'd be happy to teach you. I see you're good with React - I've been wanting to learn that!",
    timestamp: new Date("2023-03-15T10:45:00"),
    read: true,
  },
  {
    id: "m3",
    senderId: "u3",
    receiverId: "u4",
    content: "Hello Sophia, would you be interested in trading some guitar lessons for photography tips?",
    timestamp: new Date("2023-03-14T14:20:00"),
    read: false,
  },
  {
    id: "m4",
    senderId: "u1",
    receiverId: "u2",
    content: "That sounds perfect! Skill trade it is. When would you like to start?",
    timestamp: new Date("2023-03-15T11:00:00"),
    read: true,
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: "c1",
    participants: ["u1", "u2"],
    lastMessage: mockMessages[3],
    updatedAt: new Date("2023-03-15T11:00:00"),
  },
  {
    id: "c2",
    participants: ["u3", "u4"],
    lastMessage: mockMessages[2],
    updatedAt: new Date("2023-03-14T14:20:00"),
  },
];

// All Skills Categories for Dropdown
export const allSkillCategories = [
  "Technology",
  "Art",
  "Language",
  "Music",
  "Cooking",
  "Sports",
  "Academics",
  "Business",
  "Crafts",
  "Other"
];

// All Skill Levels for Dropdown
export const allSkillLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert"
];
