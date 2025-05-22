import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { reportService, ReportReasonType, ReportReasonDescriptions } from '@/services/reportService';
import { Flag } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReportDialogProps {
  listingId?: number;
  auctionId?: number;
  onReportSubmitted?: () => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ listingId, auctionId, onReportSubmitted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReasonType | ''>('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار سبب البلاغ",
        variant: "destructive",
      });
      return;
    }

    if (selectedReason === ReportReasonType.OTHER && !customReason.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال سبب البلاغ",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reportData = {
        ...(listingId ? { listingId } : {}),
        ...(auctionId ? { auctionId } : {}),
        reason: selectedReason === ReportReasonType.OTHER ? customReason.trim() : selectedReason,
      };
      
      // Call the appropriate report service method based on what's being reported
      if (listingId) {
        await reportService.createListingReport(reportData);
      } else if (auctionId) {
        await reportService.createAuctionReport(reportData);
      }
      
      toast({
        title: "تم الإبلاغ بنجاح",
        description: "سيتم مراجعة البلاغ من قبل فريق العمل",
      });
      
      setSelectedReason('');
      setCustomReason('');
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

  const reasonOptions = Object.values(ReportReasonType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
          <Flag className="h-5 w-5" />
          <span>إبلاغ</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إبلاغ {listingId ? 'عن المزاد' : auctionId ? 'عن المزايدة' : ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">
              اختر سبب البلاغ
            </label>
            <RadioGroup 
              value={selectedReason} 
              onValueChange={(value) => setSelectedReason(value as ReportReasonType)}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {reasonOptions.map(reason => (
                <div key={reason} className="flex items-start space-x-2 space-x-reverse">
                  <RadioGroupItem value={reason} id={reason} className="mt-1" />
                  <div className="grid gap-1.5 ltr:ml-2 rtl:mr-2 w-full">
                    <Label htmlFor={reason} className="font-medium flex items-center gap-1">
                      {reason.startsWith('محتوى') ? reason : reason}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {ReportReasonDescriptions[reason as ReportReasonType]}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === ReportReasonType.OTHER && (
            <div className="space-y-2">
              <label htmlFor="customReason" className="text-sm font-medium">
                أدخل سبب البلاغ
              </label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="الرجاء كتابة سبب البلاغ"
                className="min-h-[80px]"
              />
            </div>
          )}
          
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