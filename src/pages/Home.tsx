
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import SkillCard from '@/components/SkillCard';
import UserCard from '@/components/UserCard';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { skills, users } = useApp();
  
  // Get the most recent skills
  const recentSkills = [...skills].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6);
  
  // Get featured users (just a subset for now)
  const featuredUsers = users.slice(0, 4);
  
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indian-navy to-indian-maroon text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 indian-pattern opacity-10"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Share Your Skills, Discover New Ones</h1>
            <p className="text-lg md:text-xl mb-8">
              Connect with people across India to teach what you know and learn what you don't.
              A community-based platform for skill exchanges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-indian-saffron text-white hover:bg-indian-orange">
                <Link to="/explore">Browse Skills</Link>
              </Button>
              <Button size="lg" asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-2">How SkillSwap Works</h2>
          <div className="w-24 h-1 bg-indian-saffron mx-auto mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-secondary h-16 w-16 flex items-center justify-center rounded-full mx-auto mb-4 border-2 border-indian-saffron">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-foreground">
                List the skills you can teach and the ones you want to learn. 
                Make your profile stand out with detailed descriptions and photos.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary h-16 w-16 flex items-center justify-center rounded-full mx-auto mb-4 border-2 border-indian-green">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect with Others</h3>
              <p className="text-foreground">
                Find people with complementary skills. If they know what you want to learn, 
                and you know what they want to learn, it's a match!
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary h-16 w-16 flex items-center justify-center rounded-full mx-auto mb-4 border-2 border-indian-navy">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Exchanging</h3>
              <p className="text-foreground">
                Message each other, set up times to meet virtually or in-person, and 
                begin learning while teaching.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Skills Section */}
      <section className="py-16 bg-secondary relative">
        <div className="absolute inset-0 indian-pattern opacity-5"></div>
        <div className="container-custom relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Recently Added Skills</h2>
              <div className="w-16 h-1 bg-indian-green mt-2"></div>
            </div>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link to="/explore">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Users Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Community Members</h2>
              <div className="w-16 h-1 bg-indian-saffron mt-2"></div>
            </div>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link to="/explore">Explore More <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-indian-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 indian-pattern opacity-10"></div>
        <div className="container-custom text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Swapping Skills?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our growing community of learners and teachers. Share your expertise and 
            gain new abilities - all without spending a rupee.
          </p>
          <Button size="lg" asChild className="bg-indian-saffron text-white hover:bg-indian-orange">
            <Link to="/register">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
