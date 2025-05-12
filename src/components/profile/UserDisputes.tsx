import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { disputeService, Dispute } from '@/services/disputeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDisputes();
  }, []);

  const fetchUserDisputes = async () => {
    try {
      setLoading(true);
      const response = await disputeService.getUserDisputes();
      setDisputes(Array.isArray(response) ? response : []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب النزاعات",
        variant: "destructive",
      });
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowDetailsDialog(true);
  };

  const handleViewAuction = (auctionId: number) => {
    navigate(`/auction/${auctionId}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">لا توجد نزاعات</h3>
        <p className="text-gray-500 dark:text-gray-400">لم تقم بفتح أي نزاعات حتى الآن</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">نزاعاتي</h2>
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div
            key={dispute.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    dispute.status === 0
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {dispute.status === 0 ? 'مفتوح' : 'تم الحل'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(dispute.createdAt), 'dd MMMM yyyy', { locale: ar })}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 mb-2">{dispute.reason}</p>
                {dispute.status === 1 && dispute.resolution && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">القرار:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{dispute.resolution}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      تم الحل في: {format(new Date(dispute.resolvedAt!), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAuction(dispute.auctionId)}
                >
                  عرض المزاد
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(dispute)}
                >
                  التفاصيل
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              {selectedDispute.status === 1 && selectedDispute.resolution && (
                <div>
                  <h3 className="font-medium">القرار:</h3>
                  <p>{selectedDispute.resolution}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    تم الحل في: {format(new Date(selectedDispute.resolvedAt!), 'dd MMMM yyyy', { locale: ar })}
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleViewAuction(selectedDispute.auctionId)}
                >
                  عرض المزاد
                </Button>
                <Button onClick={() => setShowDetailsDialog(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDisputes; 