import React, { useEffect, useState } from 'react';
import { SupportTicketDetails } from '../components/support';
import { useAuth } from '../contexts/AuthContext';
import supportService from '../services/supportService';
import { toast } from 'react-toastify';
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SupportTicket {
  id: string | number;
  userId?: string | number;
  subject: string;
  description: string;
  status: 'Open' | 'Pending' | 'Closed' | number;
  createdAt?: string;
  responses?: string[];
}

interface AdminResponse {
  text: string;
  date: string;
}

const getStatusColor = (status) => {
  const numericStatus = typeof status === 'number' ? status : getNumericStatus(status);
  switch (numericStatus) {
    case 0: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 1: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 2: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getStatusText = (status) => {
  const numericStatus = typeof status === 'number' ? status : getNumericStatus(status);
  switch (numericStatus) {
    case 0: return 'مفتوحة';
    case 1: return 'قيد المعالجة';
    case 2: return 'مغلقة';
    default: return 'مفتوحة';
  }
};

const getNumericStatus = (status) => {
  switch (status) {
    case 'Open': return 0;
    case 'InProgress': return 1;
    case 'Pending': return 1;
    case 'Resolved': return 2;
    case 'Closed': return 2;
    default: return 0;
  }
};

const Support: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supportService.getUserTickets();
      
      console.log('API Response:', response); // Debug log
      
      // Handle the API response format
      let ticketsData = [];
      if (response?.success && Array.isArray(response.data)) {
        ticketsData = response.data;
      } else if (Array.isArray(response?.data)) {
        ticketsData = response.data;
      } else if (Array.isArray(response)) {
        ticketsData = response;
      }
      
      console.log('Processed tickets:', ticketsData); // Debug log
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading tickets:', error); // Debug log
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
      
      console.log('Selected ticket:', ticket); // Debug log
      
      // First try to get details if available
      let details;
      try {
        details = await supportService.getTicketDetails(String(ticket.id));
        console.log('Ticket details:', details); // Debug log
      } catch (e) {
        console.error('Error fetching ticket details:', e); // Debug log
        // If getting details fails, use the ticket itself
        details = ticket;
      }
      
      setSelectedTicket({
        ...ticket,
        ...(details || {})
      });
    } catch (error) {
      console.error('Error selecting ticket:', error); // Debug log
      const message = error instanceof Error ? error.message : 'فشل في تحميل تفاصيل التذكرة';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    // Toggle expansion when clicking the ticket
    toggleTicketExpansion(ticket.id);
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
      await loadTickets(); // Reload all tickets to reflect the status change
    }
  };

  // Parse admin responses from the description field
  const parseAdminResponses = (description: string): { userDescription: string, adminResponses: AdminResponse[] } => {
    if (!description) return { userDescription: '', adminResponses: [] };
    
    const regex = /Admin Response \(([^)]+)\):\s*([^]*?)(?=Admin Response \(|$)/g;
    let match;
    const adminResponses: AdminResponse[] = [];
    let userDescription = description;

    // Find all admin responses
    while ((match = regex.exec(description)) !== null) {
      adminResponses.push({
        date: match[1],
        text: match[2].trim()
      });
    }

    // Remove duplicates and filter out empty responses
    const uniqueResponses: AdminResponse[] = [];
    const seen = new Set();
    for (const resp of adminResponses) {
      const key = resp.date + '|' + resp.text;
      if (!seen.has(key) && resp.text.trim() !== '') {
        uniqueResponses.push(resp);
        seen.add(key);
      }
    }

    // Remove admin responses from the user description
    if (uniqueResponses.length > 0) {
      const firstResponseIndex = description.indexOf('Admin Response (');
      if (firstResponseIndex > -1) {
        userDescription = description.substring(0, firstResponseIndex).trim();
      }
    }

    return { userDescription, adminResponses: uniqueResponses };
  };

  const toggleTicketExpansion = (ticketId: string | number) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId.toString()]: !prev[ticketId.toString()]
    }));
  };

  // Debug render
  console.log('Rendering Support with:', { 
    tickets: tickets.length, 
    selectedTicket: selectedTicket?.id, 
    userRole: user?.role 
  });

  if (error && !tickets.length) {
    return (
      <div className="responsive-container py-8">
        <div className="text-center">
          <h1 className="heading-lg mb-4 dark:text-white">الدعم الفني</h1>
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={loadTickets}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-container py-8">
      <h1 className="heading-lg mb-8 text-center dark:text-white">الدعم الفني</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">التذاكر الخاصة بك</h2>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('0')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === '0'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                }`}
              >
                مفتوحة
              </button>
              <button
                onClick={() => setStatusFilter('1')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === '1'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                }`}
              >
                قيد المعالجة
              </button>
              <button
                onClick={() => setStatusFilter('2')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === '2'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                }`}
              >
                مغلقة
              </button>
            </div>
            {loading ? (
              <p className="text-center py-4 dark:text-gray-300">جاري التحميل...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center py-4 dark:text-gray-300">لا يوجد تذاكر</p>
            ) : (
              <div className="space-y-2">
                {tickets
                  .filter(ticket => {
                    if (statusFilter === 'all') return true;
                    const numericStatus = typeof ticket.status === 'number' ? ticket.status : getNumericStatus(ticket.status);
                    return String(numericStatus) === statusFilter;
                  })
                  .map((ticket) => {
                    const { userDescription, adminResponses } = parseAdminResponses(ticket.description);
                    const isExpanded = expandedTickets[ticket.id.toString()] || false;
                    
                    return (
                      <div
                        key={ticket.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                        }`}
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium dark:text-white">{ticket.subject}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              الحالة: <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>{getStatusText(ticket.status)}</span>
                            </p>
                            {ticket.createdAt && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                              </p>
                            )}
                          </div>
                          {adminResponses.length > 0 && (
                            <span className="text-blue-500 dark:text-blue-400">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {userDescription}
                          </p>
                        </div>

                        {/* Admin Responses */}
                        {isExpanded && adminResponses.length > 0 && (
                          <div className="mt-3 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                            {adminResponses.map((response, index) => (
                              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    رد الإدارة
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {response.date}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {response.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details and Forms */}
        <div className="md:col-span-2">
          <SupportTicketDetails
            userRole={user?.role === 'Admin' ? undefined : user?.role}
            ticketId={selectedTicket?.id?.toString()}
            currentStatus={selectedTicket?.status || 'Open'}
            onTicketCreated={handleTicketCreated}
            onStatusChanged={handleStatusChanged}
          />
        </div>
      </div>

      {user?.role === 'Admin' && (
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent className="max-w-[400px] p-6 rounded-xl bg-white dark:bg-gray-800">
            <div className="text-center mb-6 text-base dark:text-white">
              هل أنت متأكد من حذف هذه التذكرة؟
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="min-w-[100px] bg-[#1d4ed8] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                OK
              </button>
              <button 
                onClick={() => setShowDeleteAlert(false)}
                className="min-w-[100px] bg-[#e5e7eb] text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Support; 