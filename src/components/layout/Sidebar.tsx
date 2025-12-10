import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  MessageCircle,
  Calendar,
  Baby,
  Stethoscope,
  BarChart3,
  Settings,
  CreditCard,
  Eye,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/posts', label: 'Posts', icon: FileText },
  { path: '/comments', label: 'Comments', icon: MessageSquare },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/children', label: 'Children', icon: Baby },
  { path: '/therapists', label: 'Therapists', icon: Stethoscope },
  { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { path: '/plan-visibility', label: 'Plan Visibility', icon: Eye },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">Backoffice</h1>
        <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
      </div>
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

