import { getCurrentUser, logout } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { LogOut, User } from 'lucide-react';
import NotificationBell from '../NotificationBell';

export default function Header() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{user?.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}

