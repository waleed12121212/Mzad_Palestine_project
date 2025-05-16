import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import supportService from '@/services/supportService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed' | number;
  createdAt: string;
  responses?: Array<{
    text: string;
    createdAt: string;
    isAdmin?: boolean;
  }>;
  user?: {
    username: string;
    email: string;
  };
}

const Support = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'Open' | 'InProgress' | 'Resolved' | 'Closed' | 0 | 1 | 2>('all');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supportService.getUserTickets();
      console.log('Support tickets response:', response);
      setTickets(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل في تحميل التذاكر';
      setError(message);
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive"
      });
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(prev => (prev && prev.id === ticket.id ? null : ticket));
    setResponse(''); // Clear response when selecting new ticket
  };

  const handleStatusChange = async (newStatus: string | number) => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      await supportService.updateStatus(selectedTicket.id.toString(), newStatus.toString());
      
      // Update the tickets list with the new status
      setTickets(tickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          return { ...ticket, status: newStatus as any };
        }
        return ticket;
      }));
      
      // Update the selected ticket with the new status
      setSelectedTicket({ ...selectedTicket, status: newStatus as any });

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة التذكرة بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة التذكرة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !response.trim()) return;

    try {
      setIsSubmitting(true);
      // Format the response with the admin response format
      const now = new Date();
      const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.toLocaleTimeString()}`;
      const formattedResponse = `Admin Response (${formattedDate}):\n${response.trim()}`;
      
      await supportService.addResponse(selectedTicket.id.toString(), formattedResponse);
      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرد بنجاح"
      });
      setResponse('');
      await loadTickets();
      const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرد",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string | number) => {
    const numericStatus = typeof status === 'number' ? status : getNumericStatus(status);
    
    switch (numericStatus) {
      case 0:
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 1:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = (status: string | number) => {
    const numericStatus = typeof status === 'number' ? status : getNumericStatus(status);
    
    switch (numericStatus) {
      case 0:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 1:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 2:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string | number) => {
    const numericStatus = typeof status === 'number' ? status : getNumericStatus(status);
    
    switch (numericStatus) {
      case 0:
        return 'مفتوحة';
      case 1:
        return 'قيد المعالجة';
      case 2:
        return 'مغلقة';
      default:
        return 'مفتوحة';
    }
  };

  const getNumericStatus = (status: string): number => {
    switch (status) {
      case 'Open': return 0;
      case 'InProgress': return 1;
      case 'Pending': return 1;
      case 'Resolved': return 2;
      case 'Closed': return 2;
      default: return 0;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    
    if (typeof ticket.status === 'number' && typeof filter === 'number') {
      return ticket.status === filter;
    }
    
    if (typeof ticket.status === 'string' && typeof filter === 'string') {
      return ticket.status === filter;
    }
    
    if (typeof ticket.status === 'number' && typeof filter === 'string') {
      if (filter === 'Open') return ticket.status === 0;
      if (filter === 'InProgress') return ticket.status === 1;
      if (filter === 'Resolved' || filter === 'Closed') return ticket.status === 2;
    }
    
    if (typeof ticket.status === 'string' && typeof filter === 'number') {
      return getNumericStatus(ticket.status) === filter;
    }
    
    return false;
  });

  const handleDeleteClick = (ticket: SupportTicket) => {
    setTicketToDelete(ticket);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;

    try {
      setLoading(true);
      await supportService.deleteTicket(ticketToDelete.id.toString());
      toast({
        title: "تم الحذف",
        description: "تم حذف التذكرة بنجاح"
      });
      setShowDeleteAlert(false);
      setTicketToDelete(null);
      if (selectedTicket?.id === ticketToDelete.id) {
        setSelectedTicket(null);
      }
      await loadTickets();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف التذكرة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Parse admin responses from the description field
  const parseAdminResponses = (description: string) => {
    if (!description) return { userDescription: '', adminResponses: [] };
    
    const regex = /Admin Response \(([^)]+)\):\s*([^]*?)(?=Admin Response \(|$)/g;
    let match;
    const adminResponses = [];
    let userDescription = description;

    // Find all admin responses
    while ((match = regex.exec(description)) !== null) {
      adminResponses.push({
        date: match[1],
        text: match[2].trim()
      });
    }

    // Remove admin responses from the user description
    if (adminResponses.length > 0) {
      const firstResponseIndex = description.indexOf('Admin Response (');
      if (firstResponseIndex > -1) {
        userDescription = description.substring(0, firstResponseIndex).trim();
      }
    }

    return { userDescription, adminResponses };
  };

  return (
    <div className="relative">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">إدارة الدعم الفني</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter(0)}
              className={`px-4 py-2 rounded-lg ${
                filter === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
              }`}
            >
              مفتوحة
            </button>
            <button
              onClick={() => setFilter(1)}
              className={`px-4 py-2 rounded-lg ${
                filter === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
              }`}
            >
              قيد المعالجة
            </button>
            <button
              onClick={() => setFilter(2)}
              className={`px-4 py-2 rounded-lg ${
                filter === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
              }`}
            >
              مغلقة
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="md:col-span-1">
            <Card className="p-4 h-full overflow-hidden border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">قائمة التذاكر</h3>
              {loading && tickets.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                  <button
                    onClick={loadTickets}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">لا توجد تذاكر</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-3 pr-4">
                    {filteredTickets.map((ticket) => {
                      const { userDescription, adminResponses } = parseAdminResponses(ticket.description);
                      return (
                        <div
                          key={ticket.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedTicket?.id === ticket.id
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
                              : 'hover:bg-gray-50 border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800/50'
                          }`}
                          onClick={() => handleTicketSelect(ticket)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium dark:text-white">{ticket.subject}</h4>
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusText(ticket.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                            {userDescription}
                          </p>
                          {adminResponses.length > 0 && (
                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                              {adminResponses.length} {adminResponses.length === 1 ? 'رد' : 'ردود'}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(ticket);
                              }}
                              className="text-red-500 text-sm hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </div>

          {/* Ticket Details */}
          <div className="md:col-span-2">
            <Card className="p-6 h-full border-gray-200 dark:border-gray-700">
              {selectedTicket ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold dark:text-white">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(selectedTicket.status)}>
                          {getStatusText(selectedTicket.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(0)}
                        disabled={selectedTicket.status === 0}
                        className="dark:border-gray-600 dark:text-gray-200"
                      >
                        مفتوحة
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(1)}
                        disabled={selectedTicket.status === 1}
                        className="dark:border-gray-600 dark:text-gray-200"
                      >
                        قيد المعالجة
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(2)}
                        disabled={selectedTicket.status === 2}
                        className="dark:border-gray-600 dark:text-gray-200"
                      >
                        مغلقة
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-grow mb-4">
                    <div className="space-y-4">
                      {/* Original ticket message */}
                      {(() => {
                        const { userDescription, adminResponses } = parseAdminResponses(selectedTicket.description);
                        return (
                          <>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold dark:text-white">
                                  {selectedTicket.user?.username || 'مستخدم'}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap dark:text-gray-300">{userDescription}</p>
                            </div>
                            
                            {/* Admin responses */}
                            {adminResponses.map((response, index) => (
                              <div key={index} className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-blue-700 dark:text-blue-400">الإدارة</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{response.date}</span>
                                </div>
                                <p className="whitespace-pre-wrap dark:text-gray-200">{response.text}</p>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </ScrollArea>

                  {/* Reply form */}
                  <form onSubmit={handleSubmitResponse} className="mt-auto">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="اكتب ردك هنا..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="min-h-[100px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !response.trim()}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span>جاري الإرسال...</span>
                            </div>
                          ) : (
                            'إرسال الرد'
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">اختر تذكرة للعرض</h3>
                  <p className="text-gray-400 dark:text-gray-500 mt-2">
                    يرجى اختيار تذكرة من القائمة لعرض تفاصيلها
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">هل أنت متأكد من حذف هذه التذكرة؟</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف التذكرة وجميع الردود المرتبطة بها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Support; 