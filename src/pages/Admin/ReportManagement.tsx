import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { reportService, Report } from '@/services/reportService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ReportTable = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();
      console.log("Fetched reports data:", response);
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast({
        title: "خطأ في تحميل البلاغات",
        description: "حدث خطأ أثناء تحميل البلاغات",
        variant: "destructive",
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredReports = reports.filter(report => 
    report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reportedListingTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setShowDetailsDialog(true);
  };

  const handleResolve = async (reportId: number) => {
    if (!resolution.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رسالة الحل",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportService.updateReport(reportId, { 
        reason: "تم الحل",
        resolution: resolution.trim()
      });
      toast({
        title: "تم حل البلاغ",
        description: "تم تحديث حالة البلاغ بنجاح",
      });
      setResolution('');
      setShowResolutionDialog(false);
      fetchReports();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة البلاغ",
        variant: "destructive",
      });
    }
  };

  const openResolutionDialog = (report: Report) => {
    setSelectedReport(report);
    setShowResolutionDialog(true);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    setDeleting(true);
    try {
      await reportService.deleteReport(reportToDelete.reportId);
      toast({
        title: "تم حذف البلاغ",
        description: "تم حذف البلاغ بنجاح",
      });
      setReportToDelete(null);
      fetchReports();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف البلاغ",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة البلاغات</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="بحث في البلاغات..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المبلغ</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>السبب</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.reportId}>
                <TableCell>{report.reporterName}</TableCell>
                <TableCell>{report.reportedListingTitle}</TableCell>
                <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                <TableCell>
                  {format(new Date(report.createdAt), 'dd MMM yyyy', { locale: ar })}
                </TableCell>
                <TableCell>
                  {report.resolvedBy ? (
                    <span className="text-green-600">تم الحل</span>
                  ) : (
                    <span className="text-yellow-600">قيد المراجعة</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!report.resolvedBy && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResolutionDialog(report)}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReportToDelete(report)}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل البلاغ</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">المبلغ:</h3>
                <p>{selectedReport.reporterName}</p>
              </div>
              <div>
                <h3 className="font-medium">المنتج:</h3>
                <p>{selectedReport.reportedListingTitle}</p>
              </div>
              <div>
                <h3 className="font-medium">السبب:</h3>
                <p>{selectedReport.reason}</p>
              </div>
              <div>
                <h3 className="font-medium">تاريخ البلاغ:</h3>
                <p>{format(new Date(selectedReport.createdAt), 'dd MMMM yyyy', { locale: ar })}</p>
              </div>
              {selectedReport.resolverName && (
                <>
                  <div>
                    <h3 className="font-medium">تم الحل بواسطة:</h3>
                    <p>{selectedReport.resolverName}</p>
                  </div>
                  {selectedReport.resolution && (
                    <div>
                      <h3 className="font-medium">رسالة الحل:</h3>
                      <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                        {selectedReport.resolution}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حل البلاغ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">رسالة الحل</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="اكتب رسالة توضح كيفية حل البلاغ"
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResolutionDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={() => selectedReport && handleResolve(selectedReport.reportId)}
              >
                حل البلاغ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setReportToDelete(null)}
                disabled={deleting}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'جاري الحذف...' : 'حذف'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportTable; 