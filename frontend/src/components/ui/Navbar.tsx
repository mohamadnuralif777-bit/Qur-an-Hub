import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Search, BookOpen, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";

export default function Navbar() {
  const { isDark, toggleDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { to: "/quran", label: "Quran" },
    { to: "/hadith", label: "Hadith" },
    { to: "/tafsir", label: "Tafsir" },
    { to: "/sirah", label: "Sirah" },
    { to: "/ai-tutor", label: "AI Tutor" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-primary-900 dark:bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gold">
            <BookOpen className="h-6 w-6" />
            <span>Quran Hub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-gold-light transition-colors text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-primary-800 dark:bg-gray-800 text-white placeholder-gray-400 rounded-full px-4 py-1.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-gold w-48"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </form>

            <button onClick={toggleDark} className="p-2 rounded-full hover:bg-primary-800 transition-colors">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-primary-800 transition-colors"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-800 dark:bg-gray-800 px-4 pb-4">
          <form onSubmit={handleSearch} className="mb-3 pt-3">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-primary-700 dark:bg-gray-700 text-white placeholder-gray-400 rounded-full px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </form>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block py-2 hover:text-gold-light transition-colors text-sm"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
