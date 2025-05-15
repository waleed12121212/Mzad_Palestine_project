import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PageWrapper from '@/components/layout/PageWrapper';
import Index from '@/pages/Index';
import { AuthPage } from '@/pages/AuthPage';
import CreateListing from '@/pages/CreateListing';
import MyListings from '@/pages/MyListings';
import AuctionSearch from '@/pages/AuctionSearch';
import AuctionDetails from '@/pages/AuctionDetails';
import EditAuction from '@/pages/EditAuction';
import ActiveAuctions from '@/pages/ActiveAuctions';
import Profile from '@/pages/Profile';
import Favorites from '@/pages/Favorites';
import NotFound from '@/pages/NotFound';
import Notifications from '@/pages/Notifications';
import CreateAuction from '@/pages/CreateAuction';
import Chat from '@/pages/Chat';
import Checkout from '@/pages/Checkout';
import UserManagement from '@/pages/Admin/UserManagement';
import ReportManagement from '@/pages/Admin/ReportManagement';
import Categories from '@/pages/Categories';
import { LogoutHandler } from '@/components/auth/LogoutHandler';
import SellerProfile from '@/pages/SellerProfile';
import Support from '@/pages/Support';
import WonAuctions from '@/pages/WonAuctions';
import PaymentPage from '@/pages/PaymentPage';

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
        <WishlistProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Router>
                <PageWrapper>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth/*" element={<AuthPage />} />
                    <Route path="/logout" element={<LogoutRoute />} />
                    <Route path="/auctions" element={<ActiveAuctions />} />
                    <Route path="/auction/:id" element={<AuctionDetails />} />
                    <Route
                      path="/auction/:id/edit"
                      element={
                        <ProtectedRoute>
                          <EditAuction />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/auctions/search" element={<AuctionSearch />} />
                    <Route path="/auctions/active" element={<ActiveAuctions />} />
                    <Route path="/auctions/:id" element={<AuctionDetails />} />
                    <Route path="/seller/:id" element={<SellerProfile />} />
                    <Route
                      path="/auctions/won"
                      element={
                        <ProtectedRoute>
                          <WonAuctions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payment/:id"
                      element={
                        <ProtectedRoute>
                          <PaymentPage />
                        </ProtectedRoute>
                      }
                    />
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
                      path="/chat"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout/:id"
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
                    <Route
                      path="/categories"
                      element={
                        <ProtectedRoute>
                          <Categories />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/conversations" element={<Navigate to="/chat" replace />} />
                    <Route
                      path="/create-auction"
                      element={
                        <ProtectedRoute>
                          <CreateAuction />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/support"
                      element={
                        <ProtectedRoute>
                          <Support />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                      },
                    }}
                  />
                </PageWrapper>
              </Router>
            </TooltipProvider>
          </LanguageProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
