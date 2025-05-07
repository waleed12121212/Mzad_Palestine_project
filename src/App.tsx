import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuctionDetails from "./pages/AuctionDetails";
import { AuthPage } from "./pages/AuthPage";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import ActiveAuctions from "./pages/ActiveAuctions";
import BuyNow from "./pages/BuyNow";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CreateAuction from "./pages/CreateAuction";
import SellProduct from "./pages/SellProduct";
import Chat from "./pages/Chat";
import Checkout from "./pages/Checkout";
import AIPriceGuide from "./pages/AIPriceGuide";
import ProductRecommendation from "./pages/ProductRecommendation";
import SellerProfile from "./pages/SellerProfile";
import { LogoutHandler } from "./components/auth/LogoutHandler";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import UserManagement from "./pages/Admin/UserManagement";

const queryClient = new QueryClient();

// Dark mode detection helper
const getInitialDarkMode = () => {
  // Check for localStorage value
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme === "dark";
  }
  // Check for system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => getInitialDarkMode());

  useEffect(() => {
    // Apply the theme class to the HTML element
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Listen for dark mode changes
  useEffect(() => {
    const handleStorageChange = () => {
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auctions" element={<ActiveAuctions />} />
              <Route path="/auction/:id" element={<AuctionDetails />} />
              <Route path="/buy-now" element={<BuyNow />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              
              {/* Auth Routes */}
              <Route path="/auth/*" element={<AuthPage />} />
              <Route path="/logout" element={<LogoutHandler />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/create-auction" element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />
              <Route path="/sell-product" element={<ProtectedRoute><SellProduct /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              {/* Public Routes */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:category" element={<Categories />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/ai-price-guide" element={<AIPriceGuide />} />
              <Route path="/product-recommendation" element={<ProductRecommendation />} />
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
