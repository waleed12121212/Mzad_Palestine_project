import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { listingService, Listing } from '@/services/listingService';
import { auctionService, Auction } from '@/services/auctionService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useQueryClient } from '@tanstack/react-query';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'auctions'>('listings');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsData, auctionsData] = await Promise.all([
        listingService.getUserListings(user!.id),
        auctionService.getUserAuctions(user!.id)
      ]);
      setListings(listingsData);
      setAuctions(auctionsData);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: number) => {
    try {
      await listingService.deleteListing(id);
      setListings(listings.filter(listing => listing.id !== id));
      toast.success('تم حذف الإدراج بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف الإدراج');
    }
  };

  const handleCloseAuction = async (auctionId: number) => {
    try {
      console.log('[MyListings] Closing auction:', auctionId);
      await auctionService.closeAuction(auctionId);
      toast.success('تم إغلاق المزاد بنجاح');
      queryClient.invalidateQueries(['myListings']);
    } catch (error) {
      console.error('[MyListings] Error closing auction:', error);
      toast.error('حدث خطأ أثناء إغلاق المزاد');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدراجاتي</h1>
          <Button onClick={() => navigate('/create-listing')}>
            <Plus className="w-4 h-4 ml-2" />
            إدراج جديد
          </Button>
        </div>

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'listings' | 'auctions')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="listings">الإدراجات</TabsTrigger>
              <TabsTrigger value="auctions">المزادات</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="p-4">
                      <div className="aspect-video relative mb-4">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="font-semibold mb-2">{listing.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">₪{listing.startingPrice}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/edit-listing/${listing.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من حذف هذا الإدراج؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteListing(listing.id)}>
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">لا توجد إدراجات</p>
                  <Button onClick={() => navigate('/create-listing')}>
                    إنشاء إدراج جديد
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="auctions">
              {auctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.map((auction) => (
                    <Card key={auction.id} className="p-4">
                      <div className="aspect-video relative mb-4">
                        <img
                          src={auction.imageUrl}
                          alt={auction.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {auction.status === 'active' && (
                          <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                            نشط
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2">{auction.name}</h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm">
                          <span className="font-medium">السعر الحالي:</span> ₪{auction.currentPrice}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">عدد المزايدين:</span> {auction.bidders}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">ينتهي في:</span>{' '}
                          {new Date(auction.endTime).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/auction/${auction.id}`)}
                        >
                          <ExternalLink className="w-4 h-4 ml-2" />
                          عرض المزاد
                        </Button>
                        {auction.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                إغلاق المزاد
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من إغلاق هذا المزاد؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCloseAuction(auction.id)}>
                                  إغلاق
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">لا توجد مزادات</p>
                  <Button onClick={() => navigate('/create-listing')}>
                    إنشاء مزاد جديد
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default MyListings; 