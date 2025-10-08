import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plane, LogOut, User, MessageSquare, LayoutDashboard } from 'lucide-react';
import mayaAvatar from '@/assets/maya-avatar.png';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <Avatar className="w-10 h-10 ring-2 ring-primary/50 group-hover:ring-primary transition-all">
              <AvatarImage src={mayaAvatar} alt="Maya AI Avatar" />
              <AvatarFallback>
                <Plane className="w-5 h-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Maya
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/20">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="ghost" size="sm" className="hover:bg-accent/20">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="hover:bg-secondary/20">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="glass border-destructive/30 hover:border-destructive hover:bg-destructive/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="glass border-primary/30 hover:border-primary">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
