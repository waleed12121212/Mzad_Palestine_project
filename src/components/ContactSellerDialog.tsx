import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { messageService } from "@/services/messageService";
import { toast } from "@/hooks/use-toast";
import { Package, Info } from "lucide-react";

interface ContactSellerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: number;
  sellerName: string;
  auctionTitle?: string;
  auctionId?: number;
  auctionImage?: string;
  auctionPrice?: number;
}

const ContactSellerDialog: React.FC<ContactSellerDialogProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  auctionTitle,
  auctionId,
  auctionImage,
  auctionPrice
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
      // Quick fix: Prepend auction card in markdown-like format
      const auctionUrl = auctionId ? `${window.location.origin}/auction/${auctionId}` : '';
      const auctionBlock =
        auctionTitle ? `[مزاد: ${auctionTitle}](${auctionUrl})\n` : '' +
        (auctionImage ? `![صورة المزاد](${auctionImage})\n` : '') +
        (auctionPrice ? `السعر الحالي: ₪${auctionPrice}\n` : '') +
        (auctionTitle ? `-----------------\n` : '');
      const formattedMessage = `${auctionBlock}${message}`;

      await messageService.sendMessage({
        receiverId: sellerId,
        subject: auctionTitle ? `سؤال عن: ${auctionTitle}` : "رسالة جديدة",
        content: formattedMessage,
      });

      setSuccess(true);
      setMessage('');
      // Optionally close dialog after a short delay
      setTimeout(() => {
        setSuccess(false);
        onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تواصل مع {sellerName}</DialogTitle>
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
        {/* Auction Preview */}
        {auctionTitle && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-start gap-3">
              {auctionImage && (
                <img 
                  src={auctionImage} 
                  alt={auctionTitle}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <Package className="h-4 w-4" />
                  <span>المزاد المرتبط:</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {auctionTitle}
                </h4>
                {auctionPrice && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    السعر الحالي: ₪{auctionPrice.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Info className="h-4 w-4 mt-0.5" />
            <p>اكتب رسالتك للبائع. سيتم إرفاق تفاصيل المزاد تلقائياً مع رسالتك.</p>
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
            onClick={onClose}
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
  );
};

export default ContactSellerDialog; 