import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { disputeService, Dispute } from '@/services/disputeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Search, CheckCircle2, Eye } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';

const DisputeManagement = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await disputeService.getAllDisputes();
      setDisputes(Array.isArray(response) ? response : []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب النزاعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter(dispute => 
    dispute.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowDetailsDialog(true);
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال قرار النزاع",
        variant: "destructive",
      });
      return;
    }

    try {
      setResolving(true);
      await disputeService.resolveDispute({
        disputeId: selectedDispute.id,
        resolution: resolution.trim()
      });
      
      toast({
        title: "تم حل النزاع",
        description: "تم تحديث حالة النزاع بنجاح",
      });
      
      setResolution('');
      setShowDetailsDialog(false);
      fetchDisputes();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حل النزاع",
        variant: "destructive",
      });
    } finally {
      setResolving(false);
    }
  };

  // Helper to get status text
  function getDisputeStatusText(dispute) {
    if (dispute.status === 1 || dispute.resolvedBy != null) {
      return 'تم الحل';
    }
    return 'مفتوح';
  }

  // Helper to get actions
  function getDisputeActions(dispute, handleViewDetails) {
    if (dispute.status === 0) {
      return [
        { label: 'عرض التفاصيل', action: () => handleViewDetails(dispute) }
      ];
    } else if (dispute.status === 1 || dispute.resolvedAt != null) {
      return [
        { label: 'عرض ملخص الحل', action: () => handleViewDetails(dispute) }
      ];
    }
    return [];
  }

  // Status badge component
  function DisputeStatusBadge({ status }) {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4" />
          تم الحل
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <AlertTriangle className="h-4 w-4" />
        مفتوح
      </span>
    );
  }

  function DisputeActions({ dispute, onView, onResolve }) {
    return (
      <div className="flex gap-2">
        <button title="عرض التفاصيل" onClick={() => onView(dispute)} className="icon-btn">
          <Eye className="h-5 w-5" />
        </button>
        {dispute.status === 0 ? (
          <button
            title="حل النزاع"
            onClick={() => onResolve(dispute)}
            className="icon-btn text-green-600 opacity-50"
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>
        ) : (
          <span
            title="تم الحل بالفعل"
            className="icon-btn text-green-600"
            aria-disabled="true"
          >
            <CheckCircle2 className="h-5 w-5" />
          </span>
        )}
      </div>
    );
  }

  // Add direct resolve handler
  const handleResolveDirect = async (dispute) => {
    setSelectedDispute(dispute);
    setResolving(true);
    try {
      await disputeService.resolveDispute({
        disputeId: dispute.id,
        resolution: 'تم حل النزاع بنجاح'
      });
      toast({
        title: 'تم حل النزاع',
        description: 'تم تحديث حالة النزاع بنجاح',
      });
      setShowDetailsDialog(false);
      fetchDisputes();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حل النزاع',
        variant: 'destructive',
      });
    } finally {
      setResolving(false);
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">إدارة النزاعات</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="بحث في النزاعات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    رقم النزاع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    رقم المزاد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    السبب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      #{dispute.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      #{dispute.auctionId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {dispute.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DisputeStatusBadge status={dispute.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {format(new Date(dispute.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <DisputeActions
                        dispute={dispute}
                        onView={handleViewDetails}
                        onResolve={async (d) => {
                          await handleResolveDirect(d);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restore dialog for eye icon */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل النزاع</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">رقم النزاع:</h3>
                <p>#{selectedDispute.id}</p>
              </div>
              <div>
                <h3 className="font-medium">رقم المزاد:</h3>
                <p>#{selectedDispute.auctionId}</p>
              </div>
              <div>
                <h3 className="font-medium">السبب:</h3>
                <p>{selectedDispute.reason}</p>
              </div>
              <div>
                <h3 className="font-medium">تاريخ النزاع:</h3>
                <p>{format(new Date(selectedDispute.createdAt), 'dd MMMM yyyy', { locale: ar })}</p>
              </div>
              {selectedDispute.status === 0 && !selectedDispute.resolvedAt && (
                <div className="flex justify-end">
                  <button
                    title="حل النزاع"
                    onClick={async () => await handleResolveDirect(selectedDispute)}
                    className="icon-btn text-green-600"
                    disabled={resolving}
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
};

export default DisputeManagement; 