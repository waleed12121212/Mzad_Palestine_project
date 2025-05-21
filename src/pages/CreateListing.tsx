import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { CreateListingForm } from '@/components/listing/CreateListingForm';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import PageWrapper from '@/components/layout/PageWrapper';

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) {
      toast({
        title: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">إضافة منتج للبيع</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">أضف منتجك للبيع مباشرة على المنصة</p>

          <Card className="p-6">
            <CreateListingForm />
          </Card>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">ميزة الشراء الفوري</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              يمكن للمستخدمين شراء منتجك مباشرة دون الحاجة للمزايدة. ضع سعرًا مناسبًا لمنتجك وسيتمكن المشترون من شرائه فورًا.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CreateListing; 