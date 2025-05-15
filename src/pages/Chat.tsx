import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Send, User, Search, MoreVertical, Phone, Video, 
  Info, Paperclip, Image, Smile, ArrowLeft, 
  CheckCheck, MessageCircle, ArrowRightIcon, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { userService } from '@/services/userService';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  subject?: string;
  timestamp: string;
  isRead: boolean;
  senderName?: string;
  senderAvatar?: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"all" | "unread">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showContactsList, setShowContactsList] = useState(!id);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'inbox' | 'sent' | 'conversation'>('inbox');
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [showConversation, setShowConversation] = useState(false);
  const [markedAsReadIds, setMarkedAsReadIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLength = useRef(messages.length);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Get contact ID from URL
  const contactId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const contact = params.get('contact');
    return contact ? parseInt(contact) : null;
  }, [window.location.search]);

  // Responsive handler
  useEffect(() => {
    if (!isMobile && !showContactsList) {
      setShowContactsList(true);
    }
  }, [isMobile, showContactsList]);

  // Set show contacts list based on id and mobile view
  useEffect(() => {
    if (isMobile) {
      setShowContactsList(!id);
    } else {
      setShowContactsList(true);
    }
  }, [id, isMobile]);

  // Load contacts and messages
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        console.log('Loading inbox...');
        const inboxData: Message[] = await messageService.getInbox();
        // Group messages by senderId
        const grouped = Object.values(
          inboxData.reduce((acc: { [key: number]: any }, msg: Message) => {
            if (!acc[msg.senderId] || new Date(msg.timestamp) > new Date(acc[msg.senderId].timestamp)) {
              acc[msg.senderId] = { ...msg };
            }
            // Count unread messages for this sender
            acc[msg.senderId].unreadCount = (acc[msg.senderId].unreadCount || 0) + (!msg.isRead ? 1 : 0);
            return acc;
          }, {} as { [key: number]: any })
        );

        // Enrich with sender info
        const enrichedInbox = await Promise.all(
          grouped.map(async (msg: Message & { senderName?: string; senderAvatar?: string }) => {
            try {
              const response = await userService.getUserById(msg.senderId.toString());
              const userDetails = response.data;
              const name = (userDetails.firstName && userDetails.lastName)
                ? `${userDetails.firstName} ${userDetails.lastName}`.trim()
                : userDetails.username || 'مستخدم';
              const avatar = userDetails.profilePicture
                ? (userDetails.profilePicture.startsWith('http')
                    ? userDetails.profilePicture
                    : `http://mazadpalestine.runasp.net${userDetails.profilePicture}`)
                : '';
              return {
                ...msg,
                senderName: name,
                senderAvatar: avatar,
              };
            } catch {
              return {
                ...msg,
                senderName: msg.senderName || 'مستخدم',
                senderAvatar: msg.senderAvatar || '',
              };
            }
          })
        );
        setInboxMessages(enrichedInbox);
        
        // Extract unique contacts from inbox messages and add the contact from URL if not present
        let contactIds: number[] = Array.from(new Set(inboxData.map(message => message.senderId)));
        if (contactId && !contactIds.includes(contactId)) {
          contactIds.push(contactId);
        }

        const uniqueContacts: Contact[] = await Promise.all(contactIds.map(async (_senderId) => {
          const senderId = Number(_senderId);
          try {
            const response = await userService.getUserById(senderId.toString());
            const userDetails = response.data;
            const name = (userDetails.firstName && userDetails.lastName)
              ? `${userDetails.firstName} ${userDetails.lastName}`.trim()
              : userDetails.username || 'مستخدم';
            const avatar = userDetails.profilePicture
              ? (userDetails.profilePicture.startsWith('http')
                  ? userDetails.profilePicture
                  : `http://mazadpalestine.runasp.net${userDetails.profilePicture}`)
              : '';
            // Find the latest message for this contact
            const messagesForContact = inboxData.filter(msg => msg.senderId === senderId);
            const latestMsg = messagesForContact.reduce((latest, msg) => {
              return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
            }, messagesForContact[0]);
            return {
              id: senderId,
              name,
              avatar,
              lastMessage: latestMsg?.content || '',
              lastMessageTime: latestMsg?.timestamp || '',
              unreadCount: messagesForContact.filter(msg => !msg.isRead).length
            };
          } catch (e) {
            // fallback if user details fetch fails
            const messagesForContact = inboxData.filter(msg => msg.senderId === senderId);
            const latestMsg = messagesForContact.reduce((latest, msg) => {
              return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
            }, messagesForContact[0]);
            return {
              id: senderId,
              name: latestMsg?.senderName || 'مستخدم',
              avatar: latestMsg?.senderAvatar || '',
              lastMessage: latestMsg?.content || '',
              lastMessageTime: latestMsg?.timestamp || '',
              unreadCount: messagesForContact.filter(msg => !msg.isRead).length
            };
          }
        }));
        setContacts(uniqueContacts);

        // If there's a contact ID in the URL, open that conversation
        if (contactId) {
          const contact = uniqueContacts.find(c => c.id === contactId);
          if (contact) {
            setActiveContact(contact);
            setShowContactsList(false);
            fetchMessages(contact.id);
            setTab('conversation');
          }
        } else if (uniqueContacts.length > 0) {
          // Default to first contact if no id specified
          setActiveContact(uniqueContacts[0]);
          fetchMessages(uniqueContacts[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('حدث خطأ أثناء تحميل المحادثات');
        setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user, navigate, contactId]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchMessages = async (contactId: number) => {
    try {
      setLoading(true);
      const response = await messageService.getConversation(contactId);
      setMessages(response);
      
      // Mark messages as read if we are the receiver
      const unreadMessages = response.filter(
        (msg: Message) => !msg.isRead && msg.receiverId === user?.id
      );
      
      if (unreadMessages.length > 0) {
        await messageService.markAllInboxAsRead();
        // Update local state to reflect read status
        setMessages(prevMsgs => 
          prevMsgs.map(msg => 
            msg.receiverId === user?.id ? { ...msg, isRead: true } : msg
          )
        );
        // Update contacts list to reflect read status
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId ? { ...contact, unreadCount: 0 } : contact
          )
        );
      }

      // Scroll to bottom of messages
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('حدث خطأ أثناء تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (contactId: number) => {
    try {
      await messageService.markAsRead(contactId);
      // تحديث عدد الرسائل غير المقروءة في قائمة جهات الاتصال
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, unreadCount: 0 } : contact
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleContactClick = (contact: Contact) => {
    setActiveContact(contact);
    setShowConversation(true);
    if (isMobile) {
      setShowContactsList(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !messageSubject.trim()) return;
    try {
      console.log('[Chat] Sending message:', { receiverId: activeContact?.id, subject: messageSubject, content: newMessage });
      const sent = await messageService.sendMessage({
        receiverId: activeContact?.id,
        subject: messageSubject.trim() === '' ? "default" : messageSubject,
        content: newMessage,
      });
      console.log('[Chat] Message sent successfully:', sent);
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      setMessageSubject('');
      toast.success('تم إرسال الرسالة بنجاح');
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiverId', activeContact?.id.toString() || '');

    try {
      const response = await fetch('/api/messages/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedMessage = await response.json();
        setMessages(prev => [...prev, uploadedMessage]);
        toast.success('تم رفع الملف بنجاح');
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('حدث خطأ أثناء رفع الملف');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = now.getDate() - date.getDate();
    
    if (diffDays === 0) {
      return "اليوم";
    } else if (diffDays === 1) {
      return "الأمس";
    } else if (diffDays < 7) {
      return date.toLocaleDateString('ar-EG', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    }
  };

  // Extract last message for each contact before filtering
  const contactsWithLastMessage: (Message & { lastMessage?: string })[] = useMemo(() => {
    // Group messages by senderId
    const grouped = Object.values(
      inboxMessages.reduce((acc, msg) => {
        if (!acc[msg.senderId] || new Date(msg.timestamp) > new Date(acc[msg.senderId].timestamp)) {
          acc[msg.senderId] = { ...msg, lastMessage: msg.content };
        }
        return acc;
      }, {} as { [key: number]: Message & { lastMessage?: string } })
    ) as (Message & { lastMessage?: string })[];
    return grouped;
  }, [inboxMessages]);

  // Filter contacts based on tab and search term
  const filteredContacts: (Message & { lastMessage?: string })[] = useMemo(() => {
    return contactsWithLastMessage.filter(msg => {
      const matchesSearch = msg.senderName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = currentTab === "all" || (currentTab === "unread" && !msg.isRead);
      return matchesSearch && matchesTab;
    });
  }, [contactsWithLastMessage, searchQuery, currentTab]);

  console.log('contactsWithLastMessage:', contactsWithLastMessage, Array.isArray(contactsWithLastMessage) ? contactsWithLastMessage[0] : undefined);
  console.log('filteredContacts:', filteredContacts, Array.isArray(filteredContacts) ? filteredContacts[0] : undefined);

  const handleBackToContacts = () => {
    setShowContactsList(true);
  };

  const handleSellerProfile = () => {
    if (activeContact) {
      navigate(`/seller/${activeContact.id}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  const startNewChat = () => {
    toast.info("هذه الميزة قيد التطوير");
  };

  useEffect(() => {
    if (tab === 'inbox') {
      messageService.getInbox()
        .then(setInboxMessages)
        .catch(() => setInboxMessages([]));
    } else if (tab === 'sent') {
      messageService.getSent()
        .then(setSentMessages)
        .catch(() => setSentMessages([]));
    }
    // لا تجلب المحادثة إلا عند اختيار جهة اتصال
  }, [tab]);

  const handleOpenConversation = async (contactId: number, senderName = 'مستخدم', senderAvatar = '') => {
    try {
      // Fetch user details
      const response = await userService.getUserById(contactId.toString());
      const userDetails = response.data;
      setTab('conversation');
      setActiveContact({ 
        id: contactId, 
        name: (userDetails.firstName && userDetails.lastName)
          ? `${userDetails.firstName} ${userDetails.lastName}`.trim()
          : userDetails.username || 'مستخدم',
        avatar: userDetails.profilePicture
          ? (userDetails.profilePicture.startsWith('http')
              ? userDetails.profilePicture
              : `http://mazadpalestine.runasp.net${userDetails.profilePicture}`)
          : ''
      });
      setShowConversation(true);
      console.log('Selected conversation:', contactId);
      
      // Fetch messages
      const messages = await messageService.getConversation(contactId);
      console.log('Loaded messages for conversation:', contactId);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('حدث خطأ أثناء تحميل المحادثة');
      setMessages([]);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      console.log('[Chat] Marking message as read:', messageId);
      await messageService.markAsRead(messageId);
      console.log('[Chat] Message marked as read successfully');
      // حدث الرسائل بعد التعليم كمقروء
      if (tab === 'inbox') {
        setInboxMessages(msgs => msgs.map(m => m.id === messageId ? { ...m, isRead: true } : m));
      }
    } catch (error) {
      console.error('[Chat] Error marking message as read:', error);
    }
  };

  // Mark messages as read only when conversation is actually opened
  useEffect(() => {
    if (showConversation && activeContact && messages.length > 0 && user) {
      messages.forEach(async (message) => {
        if (!message.isRead && message.receiverId === Number(user.id) && !markedAsReadIds.has(message.id)) {
          console.log('[Chat] Auto-marking message as read:', message.id);
          await markMessagesAsRead(message.id);
          setMarkedAsReadIds(prev => new Set(prev).add(message.id));
          setMessages(prevMsgs => prevMsgs.map(m => m.id === message.id ? { ...m, isRead: true } : m));
        }
      });
    }
    prevMessagesLength.current = messages.length;
  }, [showConversation, activeContact?.id, messages, user?.id, markedAsReadIds]);

  // Handler for selecting/toggling a conversation
  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(prev => {
      if (prev === id) return null;
      return id;
    });
    // Always fetch messages when a conversation is selected (even if toggling off, it's harmless)
    fetchMessages(id);
  };

  // Handler for closing conversation (back button)
  const handleCloseConversation = () => setSelectedConversationId(null);

  // Mark all messages as read when conversation is opened
  useEffect(() => {
    const markAllAsRead = async () => {
      if (selectedConversationId && user) {
        try {
          // Only mark as read if we are the receiver
          const conversation = messages.find(m => m.senderId === selectedConversationId);
          if (conversation && conversation.receiverId === Number(user.id)) {
            await messageService.markAllInboxAsRead();
            // Update local state to reflect read status
            setMessages(prevMsgs => 
              prevMsgs.map(msg => 
                msg.receiverId === Number(user.id) ? { ...msg, isRead: true } : msg
              )
            );
            // Update contacts list to reflect read status
            setContacts(prevContacts => 
              prevContacts.map(contact => 
                contact.id === selectedConversationId ? { ...contact, unreadCount: 0 } : contact
              )
            );
            // Update inbox messages to reflect read status
            setInboxMessages(prevInbox => 
              prevInbox.map(msg => 
                msg.senderId === selectedConversationId ? { ...msg, isRead: true } : msg
              )
            );
            // Refresh unread count
            fetchUnreadCount();
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
          toast.error('حدث خطأ أثناء تحديث حالة الرسائل');
        }
      }
    };

    markAllAsRead();
  }, [selectedConversationId, user]);

  // Add function to fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Add useEffect to fetch unread count initially and after marking messages as read
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-8 max-w-screen-xl">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const totalUnread = contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-100 dark:bg-[#181E2A] flex items-center justify-center">
        <div className="w-full max-w-6xl h-[80vh] bg-white dark:bg-[#232B3E] rounded-2xl flex flex-row overflow-hidden">
          {/* Inbox List (left) */}
          <div className="w-full md:w-1/3 bg-white dark:bg-[#232B3E] flex flex-col h-full border-l border-gray-200 dark:border-[#313A4D]">
            <div className="p-4 pb-2">
              <div className="relative">
                <input
                    ref={searchInputRef}
                    type="text" 
                    placeholder="بحث في المحادثات..." 
                    className="w-full bg-gray-50 dark:bg-[#232B3E] text-gray-700 dark:text-gray-300 rounded-xl pr-10 pl-4 py-2 text-sm border border-gray-200 dark:border-[#313A4D] focus:outline-none focus:border-blue-600 placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  style={{ direction: 'rtl' }}
                  />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                  {searchQuery && (
                    <button 
                      onClick={clearSearch}
                    className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-200"
                      aria-label="مسح البحث"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              <div className="flex mt-4 mb-2 gap-2">
                <button
                  className={`flex-1 py-1 rounded-lg text-sm font-medium ${currentTab === 'all' ? 'bg-blue-700 text-white' : 'bg-gray-50 dark:bg-[#232B3E] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#313A4D]'}`}
                  onClick={() => setCurrentTab('all')}
                >
                  جميع المحادثات
                </button>
                <button
                  className={`flex-1 py-1 rounded-lg text-sm font-medium relative ${currentTab === 'unread' ? 'bg-blue-700 text-white' : 'bg-gray-50 dark:bg-[#232B3E] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#313A4D]'}`}
                  onClick={() => setCurrentTab('unread')}
                >
                      غير مقروءة
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-center gap-3 px-3 py-3 mb-2 rounded-xl cursor-pointer transition-all ${selectedConversationId === msg.senderId ? 'bg-blue-50 dark:bg-[#1A2341] border border-blue-400 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#29304A] text-gray-900 dark:text-white'} ${selectedConversationId === msg.senderId ? '' : 'border border-transparent'}`}
                    onClick={() => handleSelectConversation(msg.senderId)}
                    style={{ direction: 'rtl' }}
                  >
                    <img
                      src={msg.senderAvatar ? (msg.senderAvatar.startsWith('http') ? msg.senderAvatar : `http://mazadpalestine.runasp.net${msg.senderAvatar}`) : ''}
                      alt={msg.senderName}
                      className="w-10 h-10 rounded-full object-cover border border-[#313A4D]"
                    />
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-base truncate" style={{ color: selectedConversationId === msg.senderId ? '#1a1a1a' : '#1a1a1a' }}>{msg.senderName || 'مستخدم'}</span>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{formatDate(new Date(msg.timestamp))}</span>
                      </div>
                      <span className="block text-xs truncate" style={{ color: selectedConversationId === msg.senderId ? '#4a5568' : '#718096' }}>{(msg.lastMessage || msg.content) && (msg.lastMessage || msg.content).length > 40 ? (msg.lastMessage || msg.content).slice(0, 40) + '...' : (msg.lastMessage || msg.content)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-500 text-center">لا توجد رسائل واردة</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-[#313A4D]">
                <Button 
                  onClick={startNewChat}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-full py-3 text-base font-medium shadow-none border-none"
                style={{ boxShadow: 'none' }}
                >
                  بدء محادثة جديدة
                </Button>
              </div>
            </div>
          {/* Conversation Panel (right) */}
          <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            {selectedConversationId ? (
              <>
                {/* Header */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
                <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 ml-2 p-2"
                      onClick={handleCloseConversation}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    {(() => {
                      const contact = contacts.find(c => c.id === selectedConversationId);
                      return contact ? (
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 ml-2">
                            {contact.avatar ? (
                              <img src={contact.avatar.startsWith('http') ? contact.avatar : `http://mazadpalestine.runasp.net${contact.avatar}`} alt={contact.name} className="object-cover rounded-full w-full h-full" />
                    ) : (
                      <div className="bg-blue text-white h-full w-full flex items-center justify-center rounded-full">
                                <User className="h-4 w-4" />
                      </div>
                    )}
                  </Avatar>
                  <div>
                            <h3 className="text-sm font-medium">{contact.name}</h3>
                          </div>
                        </div>
                      ) : null;
                    })()}
                </div>
              </div>
              
              {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div key={message.id} className={`flex ${message.senderId === Number(user?.id) ? 'justify-end' : 'justify-start'} mb-3`}>
                        <div className={`max-w-[70%] rounded-lg px-3 py-2 
                          ${message.senderId === Number(user?.id)
                            ? 'bg-blue-100 text-gray-900 dark:bg-blue dark:text-white'
                            : 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200'}
                        `}>
                          <p className="text-sm break-words">{message.content}</p>
                          <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(new Date(message.timestamp))}</span>
                            {message.senderId === Number(user?.id) && (
                              <div className="flex items-center">
                                <CheckCheck className={`h-3 w-3 ${message.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            {message.isRead && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">مقروءة</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">ابدأ محادثة مع هذا المستخدم</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input Area */}
                <div className="p-4 bg-white dark:bg-[#232B3E]">
                  <div className="flex flex-col gap-1">
                    {/* Subject input above input bar */}
                    <input
                      type="text"
                      placeholder="موضوع الرسالة (اختياري)"
                      className="w-full bg-white dark:bg-[#232B3E] text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none focus:ring-0 text-sm rounded-lg mb-1 pr-2 focus:placeholder-transparent"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      style={{ direction: 'rtl' }}
                    />
                    <div className="flex flex-row-reverse bg-gray-50 dark:bg-[#232B3E] rounded-xl px-3 py-2 gap-2">
                      {/* Left: Send and Attach buttons (blue, circular) */}
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-700 hover:bg-blue-800 text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50 ml-auto"
                        disabled={newMessage.trim() === ""}
                        aria-label="إرسال الرسالة"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className="bg-blue-700 hover:bg-blue-800 text-white rounded-full w-9 h-9 flex items-center justify-center"
                        aria-label="إرفاق ملف"
                        type="button"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      {/* Center: Input field */}
                      <input
                        type="text"
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-500 border-none outline-none focus:ring-0 text-base text-right mx-2"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        style={{ direction: 'rtl' }}
                      />
                      {/* Right: gray icons */}
                      <button
                        className="text-gray-400 hover:text-blue-700"
                        type="button"
                        aria-label="إضافة صورة"
                      >
                        <Image className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-blue-700"
                        type="button"
                        aria-label="إرفاق ملف"
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-blue-700"
                        type="button"
                        aria-label="إضافة إيموجي"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-gray-300">لم يتم اختيار محادثة</h3>
                  <p className="text-sm text-gray-500">اختر جهة اتصال من القائمة لبدء المحادثة</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default Chat;
