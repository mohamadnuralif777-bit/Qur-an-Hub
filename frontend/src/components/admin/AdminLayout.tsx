import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  BookOpen, LayoutDashboard, FileText, Users, LogOut, Sun, Moon, Menu
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navLinks = [
    { to: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { to: "/admin/contents", icon: <FileText className="h-5 w-5" />, label: "Contents" },
    ...(user?.role === "superadmin"
      ? [{ to: "/admin/users", icon: <Users className="h-5 w-5" />, label: "Users" }]
      : []),
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold/20 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-gold" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Quran Hub</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              isActive(link.to)
                ? "bg-primary-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-primary-800/50"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-medium">{user?.name}</p>
          <p className="text-gray-400 text-xs">{user?.email}</p>
          <span className="text-xs bg-primary-800 text-gray-300 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2.5 text-gray-400 hover:text-white hover:bg-primary-800/50 rounded-xl text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-ui overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-primary-900 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
            >
              View Site ↗
            </a>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
