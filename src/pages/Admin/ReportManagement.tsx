import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { reportService, Report, ReportStatus } from '@/services/reportService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, Eye, Ban, ExternalLink } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { auctionService } from '@/services/auctionService';

const ReportTable = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [auctionTitlesLoading, setAuctionTitlesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'reject'>('resolve');
  const [auctionTitles, setAuctionTitles] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();
      console.log("Fetched reports data:", response);
      const reportsData = Array.isArray(response.data) ? response.data : [];
      
      // Log the structure of reports to debug
      console.log("Reports details:", reportsData.map(report => ({
        id: report.reportId,
        reporterName: report.reporterName,
        listingId: report.reportedListingId,
        auctionId: report.reportedAuctionId,
        listingTitle: report.reportedListingTitle,
        status: report.status
      })));
      
      setReports(reportsData);
      
      // Fetch auction titles for auction reports
      const auctionReports = reportsData.filter(report => report.reportedAuctionId);
      if (auctionReports.length > 0) {
        setAuctionTitlesLoading(true);
        const titles: Record<number, string> = {};
        try {
          for (const report of auctionReports) {
            if (report.reportedAuctionId) {
              try {
                const auctionResponse = await auctionService.getAuctionById(report.reportedAuctionId);
                if (auctionResponse.data) {
                  titles[report.reportedAuctionId] = auctionResponse.data.title || `مزاد #${report.reportedAuctionId}`;
                }
              } catch (error) {
                console.error(`Error fetching auction #${report.reportedAuctionId}:`, error);
                titles[report.reportedAuctionId] = `مزاد #${report.reportedAuctionId}`;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching auction titles:', error);
          toast({
            title: "تحذير",
            description: "تم تحميل البلاغات ولكن هناك خطأ في تحميل بعض عناوين المزادات",
            variant: "destructive",
          });
        } finally {
          setAuctionTitles(titles);
          setAuctionTitlesLoading(false);
        }
      }
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

  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.reason.toLowerCase().includes(searchLower) ||
      report.reporterName.toLowerCase().includes(searchLower) ||
      (report.reportedListingTitle?.toLowerCase() || '').includes(searchLower) ||
      (report.reportedAuctionId && auctionTitles[report.reportedAuctionId]?.toLowerCase().includes(searchLower))
    );
  });

  const getReportedItemType = (report: Report): 'listing' | 'auction' | 'unknown' => {
    if (report.reportedListingId) return 'listing';
    if (report.reportedAuctionId) return 'auction';
    return 'unknown';
  };

  const getReportItemTitle = (report: Report) => {
    if (report.reportedListingTitle) {
      return report.reportedListingTitle;
    } else if (report.reportedAuctionId && auctionTitles[report.reportedAuctionId]) {
      return auctionTitles[report.reportedAuctionId];
    } else if (report.reportedAuctionId) {
      return `مزاد #${report.reportedAuctionId}`;
    }
    return '-';
  };

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
      await reportService.resolveReport(reportId, resolution.trim(), ReportStatus.Resolved);
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

  const handleReject = async (reportId: number) => {
    if (!resolution.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال سبب الرفض",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportService.resolveReport(reportId, resolution.trim(), ReportStatus.Rejected);
      toast({
        title: "تم رفض البلاغ",
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
    setActionType('resolve');
    setShowResolutionDialog(true);
  };

  const openRejectionDialog = (report: Report) => {
    setSelectedReport(report);
    setActionType('reject');
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

  const navigateToReportedItem = (report: Report) => {
    if (report.reportedListingId) {
      navigate(`/listing/${report.reportedListingId}`);
    } else if (report.reportedAuctionId) {
      navigate(`/auction/${report.reportedAuctionId}`);
    } else {
      toast({
        title: "عذراً",
        description: "لا يمكن الوصول إلى العنصر المبلغ عنه",
        variant: "destructive",
      });
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
      ) : auctionTitlesLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mb-4"></div>
          <p className="text-gray-500">جاري تحميل عناوين المزادات...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المبلغ</TableHead>
              <TableHead>العنصر المبلغ عنه</TableHead>
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
                <TableCell>
                  {report.reportedListingTitle ? (
                    <button 
                      onClick={() => navigateToReportedItem(report)}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">منتج</span>
                      {report.reportedListingTitle}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  ) : report.reportedAuctionId ? (
                    <button 
                      onClick={() => navigateToReportedItem(report)}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">مزاد</span>
                      {auctionTitles[report.reportedAuctionId] || `#${report.reportedAuctionId}`}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                <TableCell>
                  {format(new Date(report.createdAt), 'dd MMM yyyy', { locale: ar })}
                </TableCell>
                <TableCell>
                  {report.status === ReportStatus.Resolved ? (
                    <span className="text-green-600">تم الحل</span>
                  ) : report.status === ReportStatus.Rejected ? (
                    <span className="text-red-600">مرفوض</span>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToReportedItem(report)}
                      className="text-blue-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {report.status === ReportStatus.Pending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResolutionDialog(report)}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectionDialog(report)}
                          className="text-amber-600"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </>
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
                <h3 className="font-medium">العنصر المبلغ عنه:</h3>
                {selectedReport.reportedListingTitle ? (
                  <button 
                    onClick={() => {
                      setShowDetailsDialog(false);
                      navigateToReportedItem(selectedReport);
                    }}
                    className="text-blue-600 hover:underline flex items-center mt-1"
                  >
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">منتج</span>
                    {selectedReport.reportedListingTitle}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                ) : selectedReport.reportedAuctionId ? (
                  <button 
                    onClick={() => {
                      setShowDetailsDialog(false);
                      navigateToReportedItem(selectedReport);
                    }}
                    className="text-blue-600 hover:underline flex items-center mt-1"
                  >
                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">مزاد</span>
                    {auctionTitles[selectedReport.reportedAuctionId] || `#${selectedReport.reportedAuctionId}`}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                ) : (
                  <p>-</p>
                )}
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
              
              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    setShowDetailsDialog(false);
                    navigateToReportedItem(selectedReport);
                  }}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>عرض العنصر المبلغ عنه</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'resolve' ? 'حل البلاغ' : 'رفض البلاغ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">{actionType === 'resolve' ? 'رسالة الحل' : 'سبب الرفض'}</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder={actionType === 'resolve' 
                  ? "اكتب رسالة توضح كيفية حل البلاغ" 
                  : "اكتب سبب رفض البلاغ"}
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
                onClick={() => selectedReport && (
                  actionType === 'resolve' 
                    ? handleResolve(selectedReport.reportId)
                    : handleReject(selectedReport.reportId)
                )}
              >
                {actionType === 'resolve' ? 'حل البلاغ' : 'رفض البلاغ'}
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