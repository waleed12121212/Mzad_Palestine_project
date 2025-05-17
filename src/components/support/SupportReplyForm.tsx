import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface SupportReplyFormProps {
  ticketId: string;
  userRole?: string;
  response: string;
  isSubmitting: boolean;
  onResponseChange: (response: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const SupportReplyForm: React.FC<SupportReplyFormProps> = ({ 
  ticketId, 
  userRole,
  response,
  isSubmitting,
  onResponseChange,
  onSubmit
}) => {
  if (userRole !== 'Admin') {
    return null;
  }

  return (
    <Card className="p-4 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="response" className="dark:text-gray-200">نص الرد</Label>
          <Textarea
            id="response"
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
            placeholder="اكتب نص الرد هنا..."
            className="min-h-[100px] resize-y dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder:text-gray-400"
            dir="rtl"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isSubmitting ? (
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