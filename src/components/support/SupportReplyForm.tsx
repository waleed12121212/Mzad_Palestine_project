import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import supportService from '@/services/supportService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface SupportReplyFormProps {
  ticketId: string;
  userRole?: string;
  onResponseAdded?: () => void;
}

const SupportReplyForm: React.FC<SupportReplyFormProps> = ({ 
  ticketId, 
  userRole,
  onResponseAdded 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  if (userRole !== 'Admin') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedResponse = response.trim();
    if (!trimmedResponse) {
      toast({
        title: "تنبيه",
        description: "الرجاء كتابة نص الرد قبل الإرسال",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Format the response with the admin response format
      const now = new Date();
      const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.toLocaleTimeString()}`;
      const formattedResponse = `Admin Response (${formattedDate}):\n${trimmedResponse}`;
      
      // Send the formatted response
      await supportService.addResponse(ticketId, formattedResponse);
      
      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرد بنجاح"
      });
      
      // Clear the form
      setResponse('');
      
      // Notify parent to refresh data
      onResponseAdded?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرد",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="response" className="dark:text-gray-200">نص الرد</Label>
          <Textarea
            id="response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="اكتب نص الرد هنا..."
            className="min-h-[100px] resize-y dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder:text-gray-400"
            dir="rtl"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري الإرسال...</span>
            </div>
          ) : (
            'إرسال الرد'
          )}
        </Button>
      </form>
    </Card>
  );
};

export default SupportReplyForm; 