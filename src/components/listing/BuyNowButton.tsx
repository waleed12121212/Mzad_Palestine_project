import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { listingService } from '@/services/listingService';
import { paymentService } from '@/services/paymentService';
import { transactionService } from '@/services/transactionService';
import { TransactionType, Transaction } from '@/types/transaction';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface BuyNowButtonProps {
  listingId: number;
  price: number;
  title: string;
  transactionId: string;
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({ listingId, price, title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting purchase process for listing:', listingId);
      
      // 1. Create transaction first
      const transaction = await transactionService.createTransaction({
        amount: price,
        type: TransactionType.ListingPayment,
        description: `Payment for: ${title}`,
        listingId: listingId
      });
      
      console.log('Transaction created:', transaction);
      console.log('Transaction ID:', transaction.transactionId);
      
      // 2. Create a payment for this listing
      const payment = await paymentService.createListingPayment({
        listingId: listingId,
        amount: price,
        paymentMethod: 'CreditCard',
        notes: `Payment for: ${title}`,
        transactionId: transaction.transactionId.toString()
      });
      
      console.log('Payment created:', payment);
      console.log('Payment with transaction ID:', payment.transactionId);
      
      // Navigate to payment page
      if (payment && payment.id) {
        console.log('Navigating to payment page:', `/payment/${payment.id}`);
        
        // Using direct window location change instead of navigate
        // This ensures the navigation happens even if there's an issue with the React Router
        toast({
          title: "تم بدء عملية الشراء",
          description: "جاري توجيهك إلى صفحة الدفع...",
        });
        
        // Small delay to ensure toast is shown
        setTimeout(() => {
          window.location.href = `/payment/${payment.id}`;
        }, 500);
      } else {
        console.warn('No payment ID returned, using fallback navigation');
        toast({
          title: "تم بدء عملية الشراء",
          description: "يرجى متابعة عملية الدفع",
        });
        window.location.href = '/transactions';
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "فشل في عملية الشراء",
        description: error.message || "حدث خطأ أثناء إنشاء طلب الدفع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePurchase} 
      className="w-full bg-blue-600 hover:bg-blue-700"
      size="lg"
      disabled={isLoading}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {isLoading ? 'جاري الشراء...' : 'الشراء الآن'}
    </Button>
  );
}; 