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
import { searchService, SearchResponse } from "@/services/searchService";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useUnreadMessages();

  // Close search results dropdown when clicking outside
  useOnClickOutside(searchContainerRef, () => setShowSearchResults(false));

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

  // Clear search results when location changes
  useEffect(() => {
    setSearchResults(null);
    setShowSearchResults(false);
    setSearchQuery("");
  }, [location.pathname]);
  
  // Handle search submission - only triggered by button click or Enter key
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const results = await searchService.search(searchQuery);
        console.log("Search results received:", results);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error: any) {
        console.error("Search error:", error);
        toast({
          title: "خطأ في البحث",
          description: error.message || "حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
        setShowSearchResults(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults(null);
    }
  };

  // Handle search form submission (when Enter is pressed)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const hasSearchResults = !!searchResults && (
    (searchResults.listings?.length ?? 0) > 0 ||
    (searchResults.auctions?.length ?? 0) > 0 ||
    (searchResults.jobs?.length ?? 0) > 0 ||
    (searchResults.services?.length ?? 0) > 0 ||
    (searchResults.users?.length ?? 0) > 0
  );

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navigateToItem = (path: string) => {
    navigate(path);
    setShowSearchResults(false);
    setSearchResults(null);
    setSearchQuery("");
  };

  // Navigate to search results page with raw query (not encoded)
  const navigateToSearchResults = (baseUrl: string) => {
    // Use string concatenation to avoid any automatic encoding
    const url = baseUrl + "?search=" + searchQuery;
    navigate(url);
    setMobileMenuOpen(false);
    setShowSearchResults(false);
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
            <div ref={searchContainerRef} className="relative">
              <form
                onSubmit={handleSearchSubmit}
                className="relative transition-all duration-300 w-64"
              >
                <input
                  type="text"
                  placeholder=""
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

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute mt-2 w-[400px] max-h-[80vh] overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-xl z-50 border border-gray-200 dark:border-gray-700 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                  {/* Search Header with query */}
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">نتائج البحث</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      "{searchQuery}"
                    </span>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[calc(80vh-48px)] custom-scrollbar">
                    {isSearching && !searchResults ? (
                      <div className="flex flex-col justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 text-blue animate-spin mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">جاري البحث...</p>
                      </div>
                    ) : !hasSearchResults ? (
                      <div className="text-center py-12 px-4">
                        <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-1">لا توجد نتائج للبحث عن</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300">"{searchQuery}"</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">جرب استخدام كلمات مفتاحية أخرى</p>
                      </div>
                    ) : (
                      <div>
                        {/* Results Categories Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 px-2">
                          {searchResults?.users && searchResults.users.length > 0 && (
                            <div className="px-3 py-2 text-sm font-medium text-blue dark:text-blue-light border-b-2 border-blue dark:border-blue-light">
                              المستخدمين ({searchResults.users.length})
                            </div>
                          )}
                          {searchResults?.auctions && searchResults.auctions.length > 0 && (
                            <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light">
                              المزادات ({searchResults.auctions.length})
                            </div>
                          )}
                          {searchResults?.listings && searchResults.listings.length > 0 && (
                            <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light">
                              المنتجات ({searchResults.listings.length})
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 space-y-6">
                          {searchResults?.users && searchResults.users.length > 0 && (
                            <div>
                              <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                                <span className="ml-2">المستخدمين</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                                  {searchResults.users.length}
                                </span>
                              </h3>
                              <ul className="space-y-1">
                                {searchResults.users.slice(0, 3).map((user) => (
                                  <li key={`user-${user.id}`}>
                                    <button
                                      onClick={() => navigateToItem(`/user/${user.id}`)}
                                      className="w-full text-right flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                                    >
                                      <img
                                        src={user.profilePicture || "/images/default-avatar.png"}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                      />
                                      <div className="mr-3 flex-1 text-right">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                                {searchResults.users.length > 3 && (
                                  <li>
                                    <button 
                                      onClick={() => navigateToSearchResults('/users')}
                                      className="w-full text-center py-2 text-sm text-blue dark:text-blue-light hover:underline"
                                    >
                                      عرض كل النتائج ({searchResults.users.length})
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {searchResults?.auctions && searchResults.auctions.length > 0 && (
                            <div>
                              <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                                <span className="ml-2">المزادات</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                                  {searchResults.auctions.length}
                                </span>
                              </h3>
                              <ul className="space-y-1">
                                {searchResults.auctions.slice(0, 3).map((auction) => (
                                  <li key={`auction-${auction.id}`}>
                                    <button
                                      onClick={() => navigateToItem(`/auction/${auction.id}`)}
                                      className="w-full text-right flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                                    >
                                      <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                          src={(auction.images && auction.images.length > 0) ? auction.images[0] : "/images/default-product.png"}
                                          alt={auction.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="mr-3 flex-1 text-right">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{auction.title}</div>
                                        <div className="text-sm font-semibold text-blue dark:text-blue-light">{auction.currentBid} ₪</div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                                {searchResults.auctions.length > 3 && (
                                  <li>
                                    <button
                                      onClick={() => navigateToSearchResults('/auctions')}
                                      className="w-full text-center py-2 text-sm text-blue dark:text-blue-light hover:underline"
                                    >
                                      عرض كل النتائج ({searchResults.auctions.length})
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {searchResults?.listings && searchResults.listings.length > 0 && (
                            <div>
                              <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                                <span className="ml-2">المنتجات</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                                  {searchResults.listings.length}
                                </span>
                              </h3>
                              <ul className="space-y-1">
                                {searchResults.listings.slice(0, 3).map((listing) => (
                                  <li key={`listing-${listing.id}`}>
                                    <button
                                      onClick={() => navigateToItem(`/listing/${listing.id}`)}
                                      className="w-full text-right flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                                    >
                                      <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                          src={(listing.images && listing.images.length > 0) ? listing.images[0] : "/images/default-product.png"}
                                          alt={listing.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="mr-3 flex-1 text-right">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{listing.title}</div>
                                        <div className="text-sm font-semibold text-blue dark:text-blue-light">{listing.price} ₪</div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                                {searchResults.listings.length > 3 && (
                                  <li>
                                    <button
                                      onClick={() => navigateToSearchResults('/buy-now')}
                                      className="w-full text-center py-2 text-sm text-blue dark:text-blue-light hover:underline"
                                    >
                                      عرض كل النتائج ({searchResults.listings.length})
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {searchResults?.jobs && searchResults.jobs.length > 0 && (
                            <div>
                              <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                                <span className="ml-2">الوظائف</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                                  {searchResults.jobs.length}
                                </span>
                              </h3>
                              <ul className="space-y-1">
                                {searchResults.jobs.slice(0, 3).map((job) => (
                                  <li key={`job-${job.id}`}>
                                    <button
                                      onClick={() => navigateToItem(`/job/${job.id}`)}
                                      className="w-full text-right flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                                    >
                                      <div className="w-10 h-10 rounded-md bg-blue/10 dark:bg-blue-dark/20 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="h-5 w-5 text-blue dark:text-blue-light" />
                                      </div>
                                      <div className="mr-3 flex-1 text-right">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{job.title}</div>
                                        <div className="text-xs text-gray-500">{job.salary}</div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                                {searchResults.jobs.length > 3 && (
                                  <li>
                                    <button
                                      onClick={() => navigateToSearchResults('/jobs')}
                                      className="w-full text-center py-2 text-sm text-blue dark:text-blue-light hover:underline"
                                    >
                                      عرض كل النتائج ({searchResults.jobs.length})
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {searchResults?.services && searchResults.services.length > 0 && (
                            <div>
                              <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                                <span className="ml-2">الخدمات</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                                  {searchResults.services.length}
                                </span>
                              </h3>
                              <ul className="space-y-1">
                                {searchResults.services.slice(0, 3).map((service) => (
                                  <li key={`service-${service.id}`}>
                                    <button
                                      onClick={() => navigateToItem(`/service/${service.id}`)}
                                      className="w-full text-right flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                                    >
                                      <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                          src={(service.images && service.images.length > 0) ? service.images[0] : "/images/default-service.png"}
                                          alt={service.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="mr-3 flex-1 text-right">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{service.title}</div>
                                        <div className="text-sm font-semibold text-blue dark:text-blue-light">{service.price} ₪</div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                                {searchResults.services.length > 3 && (
                                  <li>
                                    <button
                                      onClick={() => navigateToSearchResults('/services')}
                                      className="w-full text-center py-2 text-sm text-blue dark:text-blue-light hover:underline"
                                    >
                                      عرض كل النتائج ({searchResults.services.length})
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            <div ref={searchContainerRef} className="relative mb-4">
              <form
                onSubmit={handleSearchSubmit}
                className="relative mb-4"
              >
                <input
                  type="text"
                  placeholder=""
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

              {/* Mobile Search Results */}
              {showSearchResults && (
                <div className="mt-2 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {/* Mobile Search Header */}
                  <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-2 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">نتائج البحث</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      "{searchQuery}"
                    </span>
                  </div>
                  
                  {isSearching ? (
                    <div className="flex flex-col justify-center items-center py-8 bg-white dark:bg-gray-900">
                      <Loader2 className="h-8 w-8 text-blue animate-spin mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">جاري البحث...</p>
                    </div>
                  ) : !hasSearchResults ? (
                    <div className="text-center py-8 bg-white dark:bg-gray-900">
                      <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد نتائج للبحث عن "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900">
                      {/* Mobile Results Categories Tabs */}
                      <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 px-2">
                        {searchResults?.users && searchResults.users.length > 0 && (
                          <div className="px-3 py-2 text-xs font-medium text-blue dark:text-blue-light border-b-2 border-blue dark:border-blue-light whitespace-nowrap">
                            المستخدمين ({searchResults.users.length})
                          </div>
                        )}
                        {searchResults?.auctions && searchResults.auctions.length > 0 && (
                          <div className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            المزادات ({searchResults.auctions.length})
                          </div>
                        )}
                        {searchResults?.listings && searchResults.listings.length > 0 && (
                          <div className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            المنتجات ({searchResults.listings.length})
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4 p-3">
                        {/* Similar structure to desktop, but adapted for mobile */}
                        {searchResults?.users && searchResults.users.length > 0 && (
                          <div>
                            <h3 className="font-bold text-xs text-gray-500 dark:text-gray-400 mb-2">المستخدمين</h3>
                            {searchResults.users.slice(0, 2).map((user) => (
                              <button
                                key={`mobile-user-${user.id}`}
                                onClick={() => navigateToItem(`/user/${user.id}`)}
                                className="w-full text-right flex items-center p-2 my-1 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                              >
                                <img
                                  src={user.profilePicture || "/images/default-avatar.png"}
                                  alt={user.username}
                                  className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                />
                                <div className="mr-2 flex-1 text-right">
                                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{user.username}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </button>
                            ))}
                            {searchResults.users.length > 2 && (
                              <div className="text-center mt-1">
                                <button 
                                  onClick={() => navigateToSearchResults('/users')}
                                  className="text-blue dark:text-blue-light text-xs py-1"
                                >
                                  عرض الكل ({searchResults.users.length})
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {searchResults?.auctions && searchResults.auctions.length > 0 && (
                          <div>
                            <h3 className="font-bold text-xs text-gray-500 dark:text-gray-400 mb-2">المزادات</h3>
                            {searchResults.auctions.slice(0, 2).map((auction) => (
                              <button
                                key={`mobile-auction-${auction.id}`}
                                onClick={() => navigateToItem(`/auction/${auction.id}`)}
                                className="w-full text-right flex items-center p-2 my-1 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                              >
                                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                  <img
                                    src={(auction.images && auction.images.length > 0) ? auction.images[0] : "/images/default-product.png"}
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="mr-2 flex-1 text-right">
                                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{auction.title}</div>
                                  <div className="text-xs font-semibold text-blue dark:text-blue-light">{auction.currentBid} ₪</div>
                                </div>
                              </button>
                            ))}
                            {searchResults.auctions.length > 2 && (
                              <div className="text-center mt-1">
                                <button 
                                  onClick={() => navigateToSearchResults('/auctions')}
                                  className="text-blue dark:text-blue-light text-xs py-1"
                                >
                                  عرض الكل ({searchResults.auctions.length})
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {searchResults?.listings && searchResults.listings.length > 0 && (
                          <div>
                            <h3 className="font-bold text-xs text-gray-500 dark:text-gray-400 mb-2">المنتجات</h3>
                            {searchResults.listings.slice(0, 2).map((listing) => (
                              <button
                                key={`mobile-listing-${listing.id}`}
                                onClick={() => navigateToItem(`/listing/${listing.id}`)}
                                className="w-full text-right flex items-center p-2 my-1 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors"
                              >
                                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                  <img
                                    src={(listing.images && listing.images.length > 0) ? listing.images[0] : "/images/default-product.png"}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="mr-2 flex-1 text-right">
                                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{listing.title}</div>
                                  <div className="text-xs font-semibold text-blue dark:text-blue-light">{listing.price} ₪</div>
                                </div>
                              </button>
                            ))}
                            {searchResults.listings.length > 2 && (
                              <div className="text-center mt-1">
                                <button 
                                  onClick={() => navigateToSearchResults('/buy-now')}
                                  className="text-blue dark:text-blue-light text-xs py-1"
                                >
                                  عرض الكل ({searchResults.listings.length})
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
