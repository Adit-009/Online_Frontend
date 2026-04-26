import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, BookOpen, Users, ClipboardList, GraduationCap, MessageSquare, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/admins', label: 'Admins', icon: ShieldCheck },
  { path: '/admin/payments', label: 'Enrollments', icon: ClipboardList },
  { path: '/admin/exams', label: 'Exams', icon: GraduationCap },
  { path: '/admin/doubt-sessions', label: 'Doubt Sessions', icon: MessageSquare },
];
const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-layout">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Third Eye Admin
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-foreground hover:bg-border rounded-lg transition-colors"
            data-testid="admin-mobile-menu-btn"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          data-testid="admin-sidebar"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Third Eye Admin
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${active
                      ? 'text-foreground bg-primary/10 border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-border border border-transparent'
                    }`}
                  data-testid={`admin-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border space-y-1">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-medium text-muted-foreground">Appearance</span>
              <ThemeToggle />
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-border w-full transition-colors"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 min-h-screen min-w-0 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
