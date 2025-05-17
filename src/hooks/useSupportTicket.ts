import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import supportService from '@/services/supportService';

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

interface UseSupportTicketReturn {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  loading: boolean;
  error: string | null;
  response: string;
  isSubmitting: boolean;
  setSelectedTicket: (ticket: SupportTicket | null) => void;
  setResponse: (response: string) => void;
  loadTickets: () => Promise<void>;
  handleStatusChange: (newStatus: string | number) => Promise<void>;
  handleSubmitResponse: (e: React.FormEvent) => Promise<void>;
  handleDeleteTicket: (ticket: SupportTicket) => Promise<void>;
}

export const useSupportTicket = (): UseSupportTicketReturn => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use refs to prevent race conditions
  const messageQueueRef = useRef<Set<string>>(new Set());
  const isProcessingRef = useRef(false);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supportService.getAllSupport();
      // Map id to ticketId for each ticket
      const tickets = Array.isArray(response?.data)
        ? response.data.map(ticket => ({ ...ticket, id: ticket.ticketId }))
        : [];
      setTickets(tickets);
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
  }, []);

  const processMessageQueue = useCallback(async () => {
    if (isProcessingRef.current || messageQueueRef.current.size === 0) return;
    
    isProcessingRef.current = true;
    try {
      for (const message of messageQueueRef.current) {
        if (!selectedTicket) continue;
        await supportService.addResponse(selectedTicket.id.toString(), message);
        messageQueueRef.current.delete(message);
        break; // Only process one per call
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال بعض الردود",
        variant: "destructive"
      });
    } finally {
      isProcessingRef.current = false;
    }
  }, [selectedTicket]);

  const handleStatusChange = useCallback(async (newStatus: string | number) => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      await supportService.updateStatus(selectedTicket.id.toString(), newStatus.toString());
      
      // Batch state updates
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === selectedTicket.id 
            ? { ...ticket, status: newStatus as any }
            : ticket
        )
      );
      
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null);

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
  }, [selectedTicket]);

  const handleSubmitResponse = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !response.trim()) return;

    try {
      setIsSubmitting(true);
      const now = new Date();
      const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.toLocaleTimeString()}`;
      const formattedResponse = `Admin Response (${formattedDate}):\n${response.trim()}`;
      
      // Prevent double queueing
      if (!messageQueueRef.current.has(formattedResponse)) {
        messageQueueRef.current.add(formattedResponse);
      }
      
      // Process the queue
      await processMessageQueue();
      
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
  }, [selectedTicket, response, tickets, loadTickets, processMessageQueue]);

  const handleDeleteTicket = useCallback(async (ticket: SupportTicket) => {
    try {
      setLoading(true);
      await supportService.deleteTicket(ticket.id.toString());
      
      setTickets(prevTickets => prevTickets.filter(t => t.id !== ticket.id));
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(null);
      }
      
      toast({
        title: "تم الحذف",
        description: "تم حذف التذكرة بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف التذكرة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTicket]);

  return {
    tickets,
    selectedTicket,
    loading,
    error,
    response,
    isSubmitting,
    setSelectedTicket,
    setResponse,
    loadTickets,
    handleStatusChange,
    handleSubmitResponse,
    handleDeleteTicket
  };
}; 