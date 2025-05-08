import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreateListingForm } from '@/components/listing/CreateListingForm';
import { CreateAuctionForm } from '@/components/auction/CreateAuctionForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import PageWrapper from '@/components/layout/PageWrapper';

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listing' | 'auction'>('listing');
  const [createdListingId, setCreatedListingId] = useState<number | null>(null);

  React.useEffect(() => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleListingSuccess = (listingId: number) => {
    setCreatedListingId(listingId);
    setActiveTab('auction');
    toast.success('تم إنشاء الإدراج بنجاح. يمكنك الآن إنشاء المزاد.');
  };

  const handleAuctionSuccess = () => {
    toast.success('تم إنشاء المزاد بنجاح');
    navigate('/my-listings');
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">إنشاء إدراج جديد</h1>

          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'listing' | 'auction')}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="listing" disabled={activeTab === 'auction' && !createdListingId}>
                  إنشاء إدراج
                </TabsTrigger>
                <TabsTrigger value="auction" disabled={!createdListingId}>
                  إنشاء مزاد
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listing">
                <CreateListingForm onSuccess={handleListingSuccess} />
              </TabsContent>

              <TabsContent value="auction">
                {createdListingId ? (
                  <CreateAuctionForm listingId={createdListingId} onSuccess={handleAuctionSuccess} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">يجب إنشاء إدراج أولاً قبل إنشاء المزاد</p>
                    <Button onClick={() => setActiveTab('listing')}>
                      العودة إلى إنشاء الإدراج
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CreateListing; 