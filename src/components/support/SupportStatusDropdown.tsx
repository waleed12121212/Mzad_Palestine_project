import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import supportService from '@/services/supportService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type StatusType = 'Open' | 'Pending' | 'Closed';

interface SupportStatusDropdownProps {
  ticketId: string;
  currentStatus: StatusType;
  userRole?: string;
  onStatusChanged?: () => void;
}

const SupportStatusDropdown: React.FC<SupportStatusDropdownProps> = ({
  ticketId,
  currentStatus,
  userRole,
  onStatusChanged
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (userRole !== 'Admin') {
    return null;
  }

  const handleStatusChange = async (newStatus: StatusType) => {
    try {
      setIsLoading(true);
      
      await supportService.updateStatus(ticketId, newStatus);
      
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة التذكرة بنجاح",
      });
      
      // Notify parent to refresh data
      onStatusChanged?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة التذكرة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case 'Open':
        return 'مفتوحة';
      case 'Pending':
        return 'قيد المعالجة';
      case 'Closed':
        return 'مغلقة';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-2" dir="rtl">
      <Label htmlFor="status">حالة التذكرة</Label>
      <Select
        disabled={isLoading}
        value={currentStatus}
        onValueChange={(value: StatusType) => handleStatusChange(value)}
      >
        <SelectTrigger id="status" className="w-full">
          <SelectValue>
            {getStatusLabel(currentStatus)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Open">مفتوحة</SelectItem>
          <SelectItem value="Pending">قيد المعالجة</SelectItem>
          <SelectItem value="Closed">مغلقة</SelectItem>
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
          <span>جاري تحديث الحالة...</span>
        </div>
      )}
    </div>
  );
};

export default SupportStatusDropdown; 