import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  User,
  Layers,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/app/admin/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Profile', path: '/admin/profile', icon: User },
  { label: 'Sections', path: '/admin/sections', icon: Layers },
  { label: 'Blog', path: '/admin/blog', icon: FileText, disabled: true },
];

function isActive(itemPath: string, pathname: string) {
  if (itemPath === '/admin') {
    return pathname === '/admin';
  }
  return pathname.startsWith(itemPath);
}

function UserAvatar({ user }: { user: { avatarUrl: string | null; displayName: string | null; githubLogin: string } }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName || user.githubLogin}
        className="h-8 w-8 rounded-full"
      />
    );
  }

  const initials = (user.displayName || user.githubLogin)
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
      {initials}
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  logout,
  onNavClick,
}: {
  pathname: string;
  user: { avatarUrl: string | null; displayName: string | null; githubLogin: string } | null;
  logout: () => Promise<void>;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Logo area */}
      <div className="p-6">
        <Link
          to="/admin"
          className="text-lg font-semibold text-sidebar-foreground"
          onClick={onNavClick}
        >
          h4ppy p1zza
        </Link>
        <span className="ml-2 text-xs text-muted-foreground">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, pathname);
          const disabled = item.disabled === true;

          if (disabled) {
            return (
              <span
                key={item.path}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed pointer-events-none text-sidebar-foreground/70"
              >
                <Icon className="h-5 w-5" />
                <span>
                  {item.label}
                  <span className="ml-1 text-xs">({'준비 중'})</span>
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      {user && (
        <div className="mt-auto border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.displayName || user.githubLogin}
              </p>
              <button
                onClick={logout}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent pathname={pathname} user={user} logout={logout} />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-background px-4 h-14">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="text-foreground"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="text-sm font-semibold text-foreground">h4ppy p1zza Admin</span>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden cursor-default"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-sidebar border-r border-sidebar-border lg:hidden animate-in slide-in-from-left duration-200">
            <SidebarContent
              pathname={pathname}
              user={user}
              logout={logout}
              onNavClick={() => setSidebarOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="lg:pl-[260px]">
        <main className="min-h-screen bg-background p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
