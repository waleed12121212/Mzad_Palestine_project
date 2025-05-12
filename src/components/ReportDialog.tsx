import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { reportService } from '@/services/reportService';
import { Flag } from 'lucide-react';

interface ReportDialogProps {
  listingId: number;
  onReportSubmitted?: () => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ listingId, onReportSubmitted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال سبب البلاغ",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await reportService.createReport({
        listingId,
        reason: reason.trim()
      });
      
      toast({
        title: "تم الإبلاغ بنجاح",
        description: "سيتم مراجعة البلاغ من قبل فريق العمل",
      });
      
      setReason('');
      setIsOpen(false);
      onReportSubmitted?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال البلاغ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
          <Flag className="h-5 w-5" />
          <span>إبلاغ</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إبلاغ عن المزاد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              سبب البلاغ
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="الرجاء كتابة سبب البلاغ بالتفصيل"
              className="min-h-[100px]"
              dir="rtl"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog; 