import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { listingService } from '@/services/listingService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface BuyNowButtonProps {
  listingId: number;
  price: number;
  title: string;
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({ listingId, price, title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      toast({
        title: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    setIsDialogOpen(true);
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await listingService.purchaseListing(listingId);
      // Navigate to purchases or success page
      navigate('/profile/purchases');
    } catch (error) {
      console.error('Purchase error:', error);
      // Error handling is done in the service with toast notifications
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleOpenDialog} 
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        الشراء الآن
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد عملية الشراء</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في شراء "{title}" بسعر {price} ₪؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse justify-start gap-2">
            <AlertDialogAction 
              onClick={handlePurchase} 
              disabled={isLoading} 
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'جاري الشراء...' : 'تأكيد الشراء'}
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 