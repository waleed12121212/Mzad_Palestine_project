import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { disputeService } from '@/services/disputeService';
import { AlertTriangle } from 'lucide-react';

interface DisputeDialogProps {
  auctionId: number;
  onDisputeSubmitted?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DisputeDialog: React.FC<DisputeDialogProps> = ({ auctionId, onDisputeSubmitted, open, onOpenChange }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال سبب النزاع",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      await disputeService.createDispute({
        auctionId,
        reason: reason.trim()
      });
      toast({
        title: "تم فتح النزاع بنجاح",
        description: "سيتم مراجعة النزاع من قبل فريق العمل",
      });
      setReason('');
      onOpenChange?.(false);
      onDisputeSubmitted?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء فتح النزاع",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>فتح نزاع</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              سبب النزاع
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="الرجاء كتابة سبب النزاع بالتفصيل"
              className="min-h-[100px]"
              dir="rtl"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإرسال...' : 'فتح النزاع'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeDialog; 