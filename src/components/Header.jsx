import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Menu, X, PenSquare, User, LogOut, Home } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-purple-300 transition-all duration-300"
          >
            RBlogsЯ
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
            >
              <Home size={16} />
              Home
            </Link>
            
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/20"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/editor" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  <PenSquare size={16} />
                  Create Post
                </Link>
                <Link 
                  to="/me" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <User size={16} />
                  My Posts
                </Link>
                <button 
                  onClick={onLogout} 
                  className="text-gray-300 hover:text-red-400 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors duration-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-800 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                Home
              </Link>
              
              {!user ? (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/20 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/editor" 
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PenSquare size={18} />
                    Create Post
                  </Link>
                  <Link 
                    to="/me" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    My Posts
                  </Link>
                  <button 
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }} 
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-800 text-left"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}