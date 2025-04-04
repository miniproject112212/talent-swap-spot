
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, MessageSquare, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useApp();
  
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-skillswap-teal text-white p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-repeat">
              <path d="m17 2 4 4-4 4"/>
              <path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
              <path d="m7 22-4-4 4-4"/>
              <path d="M21 13v1a4 4 0 0 1-4 4H3"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-skillswap-navy">SkillSwap</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-skillswap-darkGray hover:text-skillswap-teal transition-colors font-medium">
            Home
          </Link>
          <Link to="/explore" className="text-skillswap-darkGray hover:text-skillswap-teal transition-colors font-medium">
            Explore Skills
          </Link>
          <Link to="/messages" className="text-skillswap-darkGray hover:text-skillswap-teal transition-colors font-medium">
            Messages
          </Link>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.location}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="cursor-pointer flex w-full items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 bg-white absolute top-16 left-0 right-0 z-50 shadow-lg animate-fade-in">
          <div className="container-custom flex flex-col gap-4">
            <Link 
              to="/" 
              className="px-4 py-2 hover:bg-skillswap-lightGray rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className="px-4 py-2 hover:bg-skillswap-lightGray rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore Skills
            </Link>
            <Link 
              to="/messages" 
              className="px-4 py-2 hover:bg-skillswap-lightGray rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Messages
            </Link>
            
            {currentUser ? (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link 
                  to="/profile" 
                  className="px-4 py-2 hover:bg-skillswap-lightGray rounded-md flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>My Profile</span>
                </Link>
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
