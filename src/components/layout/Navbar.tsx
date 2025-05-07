import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, Heart, MessageCircle, ShoppingCart, PlusCircle } from "lucide-react";
import DarkModeToggle from "../ui/DarkModeToggle";
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

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

  const toggleLanguage = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
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
              src="/lovable-uploads/9d68d225-811b-46be-a62c-123042182c3c.png" 
              alt="مزاد فلسطين" 
              className="h-10 mr-2" 
            />
            <span className="font-bold text-blue dark:text-white text-xl tracking-tight hidden md:block">
              {lang === "ar" ? "مزاد فلسطين" : "MzadPalestine"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 rtl:ml-4 ltr:mr-4">
            <NavLink href="/" active={isActive("/")}>
              {lang === "ar" ? "الرئيسية" : "Home"}
            </NavLink>
            <NavLink href="/auctions" active={isActive("/auctions")}>
              {lang === "ar" ? "المزادات النشطة" : "Active Auctions"}
            </NavLink>
            <NavLink href="/buy-now" active={isActive("/buy-now")}>
              {lang === "ar" ? "الشراء الفوري" : "Buy Now"}
            </NavLink>
            <NavLink href="/categories" active={isActive("/categories")}>
              {lang === "ar" ? "تصفح الفئات" : "Browse Categories"}
            </NavLink>
          </nav>

          {/* Search, User Actions */}
          <div className="hidden md:flex items-center gap-3">
            <form
              onSubmit={handleSearchSubmit}
              className={`relative transition-all duration-300 ${
                isSearchFocused ? "w-64" : "w-48"
              }`}
            >
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث عن مزادات..." : "Search auctions..."}
                className={`w-full py-2 px-4 pr-10 rtl:pl-10 rounded-full bg-gray-100 dark:bg-gray-800 border-none text-sm transition-all duration-300 ${
                  isSearchFocused
                    ? "ring-2 ring-blue/50"
                    : "focus:ring-2 focus:ring-blue/50"
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <button
                type="submit"
                className="absolute top-1/2 transform -translate-y-1/2 rtl:left-3 ltr:right-3 p-1"
              >
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </form>

            <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Heart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Link>

            <Link to="/chat" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MessageCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue rounded-full"></span>
            </Link>

            <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Link>

            <DarkModeToggle />

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <div className="flex items-center gap-1">
              {isAuthenticated ? (
                <Link to="/logout" className="btn-primary">
                  {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                </Link>
              ) : (
                <Link to="/auth" className="btn-primary">
                  {lang === "ar" ? "تسجيل الدخول" : "Login"}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/create-auction" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <PlusCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Link>
            
            <DarkModeToggle />
            
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
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg animate-fade-in rtl">
          <div className="container mx-auto px-4 py-4">
            <form 
              onSubmit={handleSearchSubmit}
              className="relative mb-4"
            >
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث عن مزادات..." : "Search auctions..."}
                className="w-full py-2 px-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800 border-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute top-1/2 transform -translate-y-1/2 right-3 p-1"
              >
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </form>

            <nav className="flex flex-col gap-3">
              <MobileNavLink href="/" active={isActive("/")}>
                {lang === "ar" ? "الرئيسية" : "Home"}
              </MobileNavLink>
              <MobileNavLink href="/auctions" active={isActive("/auctions")}>
                {lang === "ar" ? "المزادات النشطة" : "Active Auctions"}
              </MobileNavLink>
              <MobileNavLink href="/buy-now" active={isActive("/buy-now")}>
                {lang === "ar" ? "الشراء الفوري" : "Buy Now"}
              </MobileNavLink>
              <MobileNavLink href="/categories" active={isActive("/categories")}>
                {lang === "ar" ? "تصفح الفئات" : "Browse Categories"}
              </MobileNavLink>
              <MobileNavLink href="/favorites" active={isActive("/favorites")}>
                {lang === "ar" ? "المفضلة" : "Favorites"}
              </MobileNavLink>
              <MobileNavLink href="/chat" active={isActive("/chat")}>
                {lang === "ar" ? "الدردشة" : "Chat"}
              </MobileNavLink>
              <MobileNavLink href="/notifications" active={isActive("/notifications")}>
                {lang === "ar" ? "الإشعارات" : "Notifications"}
              </MobileNavLink>
            </nav>

            <div className="flex gap-2 mt-6">
              <div className="flex items-center gap-1">
                {isAuthenticated ? (
                  <Link to="/logout" className="btn-primary">
                    {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                  </Link>
                ) : (
                  <Link to="/auth" className="btn-primary">
                    {lang === "ar" ? "تسجيل الدخول" : "Login"}
                  </Link>
                )}
              </div>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium border border-gray-200 dark:border-gray-700"
              >
                {lang === "ar" ? "EN" : "عربي"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop Navigation Link
const NavLink: React.FC<{
  href: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ href, active = false, children }) => {
  return (
    <Link
      to={href}
      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
        active
          ? "text-blue dark:text-blue-light"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
}> = ({ href, active = false, children }) => {
  return (
    <Link
      to={href}
      className={`py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 ${
        active
          ? "bg-blue/10 text-blue dark:text-blue-light"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
