import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import supportService from '@/services/supportService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface SupportFormProps {
  onTicketCreated?: () => void;
}

const SupportForm: React.FC<SupportFormProps> = ({ onTicketCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: "تنبيه",
        description: "الرجاء تعبئة جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await supportService.createTicket(formData);
      
      toast({
        title: "تم الإرسال",
        description: "تم إنشاء تذكرة الدعم بنجاح"
      });
      
      // Reset form
      setFormData({
        subject: '',
        description: ''
      });
      
      // Notify parent
      onTicketCreated?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التذكرة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">إنشاء تذكرة دعم جديدة</h2>
      <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
        <div className="space-y-2">
          <Label htmlFor="subject">الموضوع</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="أدخل موضوع التذكرة"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="اكتب تفاصيل المشكلة هنا..."
            className="min-h-[150px] resize-y"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue hover:bg-blue-600"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري الإرسال...</span>
            </div>
          ) : (
            'إرسال التذكرة'
          )}
        </Button>
      </form>
    </Card>
  );
};

export default SupportForm; 