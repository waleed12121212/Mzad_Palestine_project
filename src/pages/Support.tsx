import React, { useEffect, useState } from 'react';
import { SupportTicketDetails } from '../components/support';
import { useAuth } from '../contexts/AuthContext';
import supportService from '../services/supportService';
import { toast } from 'react-toastify';
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'Open' | 'Pending' | 'Closed';
  createdAt: string;
  responses?: string[];
}

const Support: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

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
      toast.error(message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelect = async (ticket: SupportTicket) => {
    try {
      setLoading(true);
      setError(null);
      const details = await supportService.getTicketDetails(ticket.id);
      setSelectedTicket(details);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل في تحميل تفاصيل التذكرة';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;

    try {
      setLoading(true);
      await supportService.deleteTicket(ticketToDelete);
      toast.success('تم حذف التذكرة بنجاح');
      setShowDeleteAlert(false);
      setTicketToDelete(null);
      if (selectedTicket?.id === ticketToDelete) {
        setSelectedTicket(null);
      }
      loadTickets();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل في حذف التذكرة';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = () => {
    loadTickets();
  };

  const handleStatusChanged = async () => {
    if (selectedTicket) {
      await handleTicketSelect(selectedTicket);
    }
  };

  if (error && !tickets.length) {
    return (
      <div className="responsive-container py-8">
        <div className="text-center">
          <h1 className="heading-lg mb-4">الدعم الفني</h1>
          <p className="text-red-500">{error}</p>
          <button
            onClick={loadTickets}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-container py-8">
      <h1 className="heading-lg mb-8 text-center">الدعم الفني</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">التذاكر الخاصة بك</h2>
            {loading ? (
              <p className="text-center py-4">جاري التحميل...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center py-4">لا يوجد تذاكر</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-gray-100'
                    }`}
                    onClick={() => handleTicketSelect(ticket)}
                  >
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500">
                      الحالة: {ticket.status}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                    {user?.role === 'Admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(ticket.id);
                        }}
                        className="text-red-500 text-sm hover:text-red-700 mt-2"
                      >
                        حذف التذكرة
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details and Forms */}
        <div className="md:col-span-2">
          <SupportTicketDetails
            userRole={user?.role}
            ticketId={selectedTicket?.id}
            currentStatus={selectedTicket?.status || 'Open'}
            onTicketCreated={handleTicketCreated}
            onStatusChanged={handleStatusChanged}
          />
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="max-w-[400px] p-6 rounded-xl bg-white">
          <div className="text-center mb-6 text-base">
            هل أنت متأكد من حذف هذه التذكرة؟
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={loading}
              className="min-w-[100px] bg-[#1d4ed8] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
            <button 
              onClick={() => setShowDeleteAlert(false)}
              className="min-w-[100px] bg-[#e5e7eb] text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Support; 