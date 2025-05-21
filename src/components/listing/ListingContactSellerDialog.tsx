import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { messageService } from "@/services/messageService";
import { toast } from "@/hooks/use-toast";
import { Info } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface ListingContactSellerDialogProps {
  sellerId: string | number;
  productName: string;
  productImage?: string;
  productPrice?: number;
}

export function ListingContactSellerDialog({ 
  sellerId, 
  productName,
  productImage,
  productPrice 
}: ListingContactSellerDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleOpenChange = (open: boolean) => {
    if (!isAuthenticated && open) {
      toast({
        title: "يرجى تسجيل الدخول أولاً",
        description: "يجب عليك تسجيل الدخول لإرسال رسالة للبائع",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    setOpen(open);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "الرسالة فارغة",
        description: "يرجى كتابة رسالة قبل الإرسال",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Format message using the product format for the new product parser in Chat.tsx
      const productUrl = `${window.location.origin}${window.location.pathname}`;
      const formattedMessage = 
        `[منتج: ${productName}](${productUrl})\n` +
        `السعر الحالي: ₪${productPrice ? productPrice.toLocaleString() : '0'}\n` +
        `-----------------\n` +
        message;

      await messageService.sendMessage({
        receiverId: sellerId,
        subject: `استفسار عن: ${productName}`,
        content: formattedMessage,
      });

      setSuccess(true);
      setMessage('');
      // Close dialog after a short delay
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 4000); // 4 seconds
    } catch (error) {
      toast({
        title: "فشل إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => handleOpenChange(true)} 
        variant="outline" 
        className="w-full flex gap-2"
      >
        <MessageCircle className="h-5 w-5" />
        <span>تواصل مع البائع</span>
      </Button>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>استفسار عن المنتج</DialogTitle>
          </DialogHeader>
          {success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">تم إرسال رسالتك بنجاح</h3>
              <p className="text-gray-700 dark:text-gray-200 text-center">سيتم إعلام البائع برسالتك وسيقوم بالرد عليك في أقرب وقت ممكن.</p>
            </div>
          ) : (
          <>
            {/* Product Preview */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                {productImage && (
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {productName}
                  </h4>
                  {productPrice && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      السعر: ₪{productPrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Info className="h-4 w-4 mt-0.5" />
                <p>اكتب رسالتك للبائع. سيتم إرفاق تفاصيل المنتج تلقائياً مع رسالتك.</p>
              </div>
              <Textarea
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                disabled={isSending}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSending}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? "جاري الإرسال..." : "إرسال"}
              </Button>
            </DialogFooter>
          </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 