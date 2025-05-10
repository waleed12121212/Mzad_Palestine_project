import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Index from '@/pages/Index';
import { AuthPage } from '@/pages/AuthPage';
import CreateListing from '@/pages/CreateListing';
import MyListings from '@/pages/MyListings';
import AuctionSearch from '@/pages/AuctionSearch';
import AuctionDetails from '@/pages/AuctionDetails';
import ActiveAuctions from '@/pages/ActiveAuctions';
import Profile from '@/pages/Profile';
import Favorites from '@/pages/Favorites';
import NotFound from '@/pages/NotFound';
import Notifications from '@/pages/Notifications';
import CreateAuction from '@/pages/CreateAuction';
import Chat from '@/pages/Chat';
import Checkout from '@/pages/Checkout';
import UserManagement from '@/pages/Admin/UserManagement';
import Categories from '@/pages/Categories';
import { LogoutHandler } from '@/components/auth/LogoutHandler';
import SellerProfile from '@/pages/SellerProfile';

const queryClient = new QueryClient();

const LogoutRoute = () => {
  const { logout } = useAuth();
  
  React.useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth/*" element={<AuthPage />} />
                  <Route path="/logout" element={<LogoutRoute />} />
                  <Route path="/auctions" element={<ActiveAuctions />} />
                  <Route path="/auction/:id" element={<AuctionDetails />} />
                  <Route path="/auctions/search" element={<AuctionSearch />} />
                  <Route path="/auctions/active" element={<ActiveAuctions />} />
                  <Route path="/auctions/:id" element={<AuctionDetails />} />
                  <Route path="/seller/:id" element={<SellerProfile />} />
                  <Route
                    path="/listings/create"
                    element={
                      <ProtectedRoute>
                        <CreateListing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/listings/my"
                    element={
                      <ProtectedRoute>
                        <MyListings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <Favorites />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-auction"
                    element={
                      <ProtectedRoute>
                        <CreateAuction />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/conversations"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/conversations/:id"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute adminOnly>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/:category" element={<Categories />} />
                  <Route
                    path="/logout"
                    element={
                      <ProtectedRoute>
                        <LogoutHandler />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'white',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    direction: 'rtl'
                  },
                  duration: 4000,
                }}
                richColors
              />
            </div>
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
