import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import EditListing from '@/pages/EditListing/index';
import MyListings from '@/pages/MyListings';
import ListingDetails from '@/pages/ListingDetails';
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
import CategoryPage from '@/pages/CategoryPage';
import About from '@/pages/About';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import HowItWorks from '@/pages/HowItWorks';
import ProductRecommendation from '@/pages/ProductRecommendation';
import BuyNow from '@/pages/BuyNow';
import SellProduct from '@/pages/SellProduct';
import Contact from '@/pages/Contact';
import TransactionsPage from '@/pages/TransactionsPage';
import TransactionDetailsPage from '@/pages/TransactionDetailsPage';
import AIPriceGuide from '@/pages/AIPriceGuide';
import { JobsPage } from '@/pages/JobsPage';
import { JobCategoriesPage } from '@/pages/JobCategoriesPage';
import JobCategoriesList from '@/pages/JobCategoriesList';
import JobDetailsPage from '@/pages/JobDetailsPage';
import { AddJobPage } from './pages/AddJobPage';
import ServiceCategoryPage from '@/pages/ServiceCategoryPage';
import ServicePage from '@/pages/ServicePage';
import ServiceDetailsPage from '@/pages/ServiceDetailsPage';
import CreateService from '@/pages/CreateService';
import EditService from '@/pages/EditService';
import { EditJobPage } from '@/pages/EditJobPage';
import SearchResults from '@/pages/SearchResults';

const queryClient = new QueryClient();

const LogoutRoute = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/', { replace: true });
    };
    
    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">جاري تسجيل الخروج</h2>
        <p className="text-gray-600 dark:text-gray-300">
          يرجى الانتظار...
        </p>
      </div>
    </div>
  );
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
                    <Route path="/listing/:id" element={<ListingDetails />} />
                    <Route
                      path="/listing/:id/edit"
                      element={
                        <ProtectedRoute>
                          <EditListing />
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
                    <Route path="/categories/:categoryId" element={<CategoryPage />} />
                    <Route path="/conversations" element={<Navigate to="/chat" replace />} />
                    <Route
                      path="/create-auction"
                      element={
                        <ProtectedRoute>
                          <CreateAuction />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/buy-now" element={<BuyNow />} />
                    <Route path="/sell-product" element={<Navigate to="/listings/create" replace />} />
                    <Route
                      path="/support"
                      element={
                        <ProtectedRoute>
                          <Support />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/about" element={<About />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/ai-price-guide" element={<AIPriceGuide />} />
                    <Route path="/product-recommendation" element={<ProductRecommendation />} />
                    <Route path="/sell-product" element={<SellProduct />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route
                      path="/admin/reports"
                      element={
                        <ProtectedRoute adminOnly>
                          <ReportManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions"
                      element={
                        <ProtectedRoute>
                          <TransactionsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions/:id"
                      element={
                        <ProtectedRoute>
                          <TransactionDetailsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route 
                      path="/jobs/categories" 
                      element={
                        <ProtectedRoute adminOnly>
                          <JobCategoriesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/jobs/new" element={<ProtectedRoute><AddJobPage /></ProtectedRoute>} />
                    <Route path="/job-categories" element={<JobCategoriesList />} />
                    <Route path="/jobs/:id" element={<JobDetailsPage />} />
                    <Route path="/jobs/edit/:id" element={<ProtectedRoute><EditJobPage /></ProtectedRoute>} />
                    <Route path="/services" element={<ServiceCategoryPage />} />
                    <Route path="/services/category/:categoryId" element={<ServicePage />} />
                    <Route path="/services/:id" element={<ServiceDetailsPage />} />
                    <Route path="/services/create" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
                    <Route path="/services/edit/:id" element={<ProtectedRoute><EditService /></ProtectedRoute>} />
                    <Route path="/search-results" element={<SearchResults />} />
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
