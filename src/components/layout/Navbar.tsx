import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, Bell, MessageCircle, Heart, PlusCircle, HelpCircle, CreditCard, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { NotificationDropdown } from "@/components/NotificationDropdown";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useUnreadMessages();

  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = dir === "rtl" ? "rtl" : "ltr";
    document.documentElement.lang = dir;
  }, [dir]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clear search query when location changes
  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);
  
  // Navigate to comprehensive search results page
  const navigateToComprehensiveSearch = () => {
    const url = "/search-results?search=" + searchQuery;
    navigate(url);
    setMobileMenuOpen(false);
    setSearchQuery("");
  };

  // Handle search submission - only triggered by button click or Enter key
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // Navigate directly to search results page instead of showing dropdown
      navigateToComprehensiveSearch();
    }
  };

  // Handle search form submission (when Enter is pressed)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navigateToItem = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 dark-mode-transition ${
        isScrolled
          ? "py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt={t('nav.logoAlt')} 
              className={`h-10 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}
            />
            <span className="font-bold text-blue dark:text-white text-xl tracking-tight hidden md:block">
              مزاد فلسطين
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center space-x-4 ${dir === 'rtl' ? 'space-x-reverse' : ''}`}>
            <DesktopNavLink href="/" active={isActive("/")}>
              الرئيسية
            </DesktopNavLink>
            <DesktopNavLink href="/auctions" active={location.pathname === "/auctions"}>
              المزادات
            </DesktopNavLink>
            <DesktopNavLink href="/auctions/won" active={location.pathname === "/auctions/won"}>
              المزادات الفائزة
            </DesktopNavLink>
            <DesktopNavLink href="/buy-now" active={location.pathname === "/buy-now"}>
              الشراء الفوري
            </DesktopNavLink>
            <DesktopNavLink href="/categories" active={isActive("/categories")}>
              تصفح الفئات
            </DesktopNavLink>
            <DesktopNavLink href="/jobs" active={isActive("/jobs")}>
              الوظائف
            </DesktopNavLink>
            <DesktopNavLink href="/services" active={isActive("/services")}>
              الخدمات
            </DesktopNavLink>
            {isAuthenticated && (
              <DesktopNavLink href="/transactions" active={isActive("/transactions")}>
                المعاملات المالية
              </DesktopNavLink>
            )}
          </nav>

          {/* Search, User Actions */}
          <div className={`hidden md:flex items-center space-x-4 ${dir === 'rtl' ? 'space-x-reverse' : ''}`}>
            <div className="relative">
              <form
                onSubmit={handleSearchSubmit}
                className="relative transition-all duration-300 w-64"
              >
                <input
                  type="text"
                  placeholder="ابحث عن مستخدمين، مزادات، منتجات، خدمات، وظائف..."
                  className={`w-full py-2 px-4 ${dir === 'rtl' ? 'pr-4 pl-10' : 'pl-4 pr-10'} rounded-full bg-gray-100 dark:bg-gray-800 border-none text-sm ring-2 ring-transparent focus:ring-blue/50`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
                <button
                  type="submit"
                  className={`absolute top-1/2 transform -translate-y-1/2 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 text-blue animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </form>
            </div>

            <DarkModeToggle />

            <div className="flex items-center gap-2">
              <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Heart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>

              <Link to="/conversations" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MessageCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <NotificationDropdown />

              <Link 
                to="/support" 
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="الدعم الفني"
              >
                <HelpCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>

              {isAuthenticated ? (
                <Link to="/logout" className="btn-primary">
                  تسجيل الخروج
                </Link>
              ) : (
                <Link to="/auth" className="btn-primary">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/create-auction" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <PlusCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="relative mb-4">
              <form
                onSubmit={handleSearchSubmit}
                className="relative mb-4"
              >
                <input
                  type="text"
                  placeholder="ابحث عن مستخدمين، مزادات، منتجات، خدمات، وظائف..."
                  className={`w-full py-2 px-4 ${dir === 'rtl' ? 'pr-4 pl-10' : 'pl-4 pr-10'} rounded-full bg-gray-100 dark:bg-gray-800 border-none text-sm`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
                <button
                  type="submit"
                  className={`absolute top-1/2 transform -translate-y-1/2 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 text-blue animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </form>
            </div>

            <nav className="flex flex-col space-y-1 text-right rtl:text-right ltr:text-left">
              <MobileNavLink href="/" active={isActive("/")}>
                الرئيسية
              </MobileNavLink>
              <MobileNavLink href="/auctions" active={location.pathname === "/auctions"}>
                المزادات
              </MobileNavLink>
              <MobileNavLink href="/auctions/won" active={location.pathname === "/auctions/won"}>
                المزادات الفائزة
              </MobileNavLink>
              <MobileNavLink href="/buy-now" active={location.pathname === "/buy-now"}>
                الشراء الفوري
              </MobileNavLink>
              <MobileNavLink href="/categories" active={isActive("/categories")}>
                تصفح الفئات
              </MobileNavLink>
              <MobileNavLink href="/jobs" active={isActive("/jobs")}>
                الوظائف
              </MobileNavLink>
              <MobileNavLink href="/services" active={isActive("/services")}>
                الخدمات
              </MobileNavLink>
              {isAuthenticated && (
                <MobileNavLink href="/transactions" active={isActive("/transactions")}>
                    المعاملات المالية
                </MobileNavLink>
              )}
              <MobileNavLink href="/support" active={isActive("/support")}>
                الدعم الفني
              </MobileNavLink>
              <MobileNavLink href="/favorites" active={isActive("/favorites")}> 
                <Heart className="h-5 w-5" />
              </MobileNavLink>
              <MobileNavLink href="/conversations" active={isActive("/conversations")}> 
                <MessageCircle className="h-5 w-5" />
              </MobileNavLink>
              <MobileNavLink href="/notifications" active={isActive("/notifications")}> 
                <Bell className="h-5 w-5" />
              </MobileNavLink>
            </nav>

            <div className="mt-4 flex flex-col space-y-2">
              {isAuthenticated ? (
                <Link to="/logout" className="btn-primary w-full text-center">
                  تسجيل الخروج
                </Link>
              ) : (
                <Link to="/auth" className="btn-primary w-full text-center">
                  تسجيل الدخول
                </Link>
              )}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop Navigation Link
const DesktopNavLink: React.FC<{
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ href, active, children, onClick }) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg transition-colors ${
        active
          ? "text-blue dark:text-blue-light font-medium"
          : "text-gray-600 dark:text-gray-300 hover:text-blue dark:hover:text-blue-light"
      }`}
    >
      {children}
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink: React.FC<{
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ href, active, children, onClick }) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`block px-4 py-2 rounded-lg transition-colors ${
        active
          ? "bg-blue/10 dark:bg-blue-dark/20 text-blue dark:text-blue-light font-medium"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
