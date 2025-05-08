import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth/*" element={<AuthPage />} />
                  <Route path="/auctions/search" element={<AuctionSearch />} />
                  <Route path="/auctions/active" element={<ActiveAuctions />} />
                  <Route path="/auctions/:id" element={<AuctionDetails />} />
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Toaster position="top-center" />
            </div>
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
