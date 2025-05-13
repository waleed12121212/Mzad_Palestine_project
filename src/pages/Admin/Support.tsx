import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import supportService from '@/services/supportService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
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
  const [filter, setFilter] = useState<'all' | 'Open' | 'InProgress' | 'Resolved' | 'Closed'>('all');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supportService.getUserTickets();
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

  const handleTicketSelect = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResponse(''); // Clear response when selecting new ticket
  };

  const handleStatusChange = async (newStatus: 'Open' | 'InProgress' | 'Resolved' | 'Closed') => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      await supportService.updateStatus(selectedTicket.id, newStatus);
      
      // Update the tickets list with the new status
      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: newStatus }
          : ticket
      ));
      
      // Update the selected ticket with the new status
      setSelectedTicket({ ...selectedTicket, status: newStatus });

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
      await supportService.addResponse(selectedTicket.id, response);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'InProgress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Resolved':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'Closed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'InProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-blue-100 text-blue-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الدعم الفني</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('Open')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'Open'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            مفتوحة
          </button>
          <button
            onClick={() => setFilter('InProgress')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'InProgress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            قيد المعالجة
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'Resolved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            تم الحل
          </button>
          <button
            onClick={() => setFilter('Closed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'Closed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            مغلقة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tickets List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">قائمة التذاكر</h3>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">جاري التحميل...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                  <Button
                    onClick={loadTickets}
                    className="mt-4"
                    variant="outline"
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد تذاكر</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleTicketSelect(ticket)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'border-blue bg-blue/5'
                        : 'border-gray-100 hover:border-blue/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status === 'Open' ? 'مفتوحة' :
                         ticket.status === 'InProgress' ? 'قيد المعالجة' :
                         ticket.status === 'Resolved' ? 'تم الحل' : 'مغلقة'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>{formatDate(ticket.createdAt)}</span>
                      {ticket.user && (
                        <span className="mr-2">بواسطة: {ticket.user.username}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Ticket Details and Response Form */}
        <Card className="p-6">
          {selectedTicket ? (
            <div className="h-[600px] flex flex-col">
              {/* Ticket Details */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                  <div className="flex gap-2 items-center">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status === 'Open' ? 'مفتوحة' :
                       selectedTicket.status === 'InProgress' ? 'قيد المعالجة' :
                       selectedTicket.status === 'Resolved' ? 'تم الحل' :
                       'مغلقة'}
                    </Badge>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as 'Open' | 'InProgress' | 'Resolved' | 'Closed')}
                      className="px-3 py-1 border rounded-md text-sm bg-white"
                      disabled={loading}
                    >
                      <option value="Open">مفتوحة</option>
                      <option value="InProgress">قيد المعالجة</option>
                      <option value="Resolved">تم الحل</option>
                      <option value="Closed">مغلقة</option>
                    </select>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{selectedTicket.description}</p>
                <div className="text-sm text-gray-500">
                  تم الإنشاء في: {formatDate(selectedTicket.createdAt)}
                </div>
              </div>

              {/* Responses */}
              <ScrollArea className="flex-grow mb-6">
                <div className="space-y-4">
                  {selectedTicket.responses?.map((response, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        response.isAdmin
                          ? 'bg-blue-50 border border-blue-100'
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">
                          {response.isAdmin ? 'رد الإدارة' : 'رد المستخدم'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(response.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600">{response.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Response Form */}
              {selectedTicket.status !== 'Closed' && (
                <form onSubmit={handleSubmitResponse} className="mt-auto">
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="mb-4"
                    dir="rtl"
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !response.trim()}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      'إرسال الرد'
                    )}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-gray-500">
              اختر تذكرة لعرض تفاصيلها
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Support; 