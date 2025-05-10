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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'inbox' | 'sent' | 'conversation'>('inbox');
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [showConversation, setShowConversation] = useState(false);
  const [markedAsReadIds, setMarkedAsReadIds] = useState<Set<number>>(new Set());

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
        const inboxData = await messageService.getInbox();
        const enrichedInbox = await Promise.all(
          inboxData.map(async (msg) => {
            try {
              const userDetails = await userService.getUserById(msg.senderId.toString());
              return {
                ...msg,
                senderName: `${userDetails.firstName} ${userDetails.lastName}`.trim() || userDetails.username || 'مستخدم',
                senderAvatar: userDetails.profilePicture || '',
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
        
        // Extract unique contacts from inbox messages
        const contactIds: number[] = Array.from(new Set(inboxData.map(message => message.senderId)));
        const uniqueContacts: Contact[] = await Promise.all(contactIds.map(async (_senderId) => {
          const senderId = Number(_senderId);
          try {
            const userDetails = await userService.getUserById(senderId.toString());
            const lastMsg = inboxData.find(msg => msg.senderId === senderId);
            return {
              id: senderId,
              name: `${userDetails.firstName} ${userDetails.lastName}`.trim() || userDetails.username || 'مستخدم',
              avatar: userDetails.profilePicture || '',
              lastMessage: lastMsg?.content || '',
              lastMessageTime: lastMsg?.timestamp || '',
              unreadCount: inboxData.filter(msg => msg.senderId === senderId && !msg.isRead).length
            };
          } catch (e) {
            // fallback if user details fetch fails
            const lastMsg = inboxData.find(msg => msg.senderId === senderId);
            return {
              id: senderId,
              name: lastMsg?.senderName || 'مستخدم',
              avatar: lastMsg?.senderAvatar || '',
              lastMessage: lastMsg?.content || '',
              lastMessageTime: lastMsg?.timestamp || '',
              unreadCount: inboxData.filter(msg => msg.senderId === senderId && !msg.isRead).length
            };
          }
        }));
        setContacts(uniqueContacts);

        // التحقق من وجود معرف جهة اتصال في الرابط
        const contactId = new URLSearchParams(window.location.search).get('contact');
        if (contactId) {
          const contact = uniqueContacts.find(c => c.id === parseInt(contactId));
          if (contact) {
            setActiveContact(contact);
            fetchMessages(contact.id);
          }
        } else if (uniqueContacts.length > 0) {
          // Default to first contact if no id specified
          setActiveContact(uniqueContacts[0]);
          fetchMessages(uniqueContacts[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('حدث خطأ أثناء تحميل البيانات');
        setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user, navigate]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchMessages = async (contactId: number) => {
    try {
      const data = await messageService.getConversation(contactId);
      setMessages(data);
      // Do not mark as read here
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('حدث خطأ أثناء تحميل الرسائل');
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleContactClick = (contact: Contact) => {
    setActiveContact(contact);
    setShowConversation(false);
    if (isMobile) {
      setShowContactsList(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !messageSubject.trim()) return;
    try {
      const sent = await messageService.sendMessage({
        receiverId: activeContact?.id,
        subject: messageSubject,
        content: newMessage,
      });
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      setMessageSubject('');
      toast.success('تم إرسال الرسالة بنجاح');
    } catch {
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

  // Filter contacts based on tab and search term
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = currentTab === "all" || (currentTab === "unread" && contact.unreadCount && contact.unreadCount > 0);
      return matchesSearch && matchesTab;
    });
  }, [contacts, searchQuery, currentTab]);

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
      const userDetails = await userService.getUserById(contactId.toString());
      setTab('conversation');
      setActiveContact({ 
        id: contactId, 
        name: `${userDetails.firstName} ${userDetails.lastName}`, 
        avatar: userDetails.profilePicture || '' 
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
      await messageService.markAsRead(messageId);
      // حدث الرسائل بعد التعليم كمقروء
      if (tab === 'inbox') {
        setInboxMessages(msgs => msgs.map(m => m.id === messageId ? { ...m, isRead: true } : m));
      }
    } catch {}
  };

  // Mark messages as read only when conversation is actually opened
  useEffect(() => {
    if (showConversation && activeContact && messages.length > 0 && user) {
      messages.forEach(async (message) => {
        if (!message.isRead && message.receiverId === user.id && !markedAsReadIds.has(message.id)) {
          console.log('Calling markAsRead for message:', message.id);
          await markMessagesAsRead(message.id);
          setMarkedAsReadIds(prev => new Set(prev).add(message.id));
          setMessages(prevMsgs => prevMsgs.map(m => m.id === message.id ? { ...m, isRead: true } : m));
        }
      });
    }
  // Only re-run if showConversation, activeContact.id, messages, or user.id changes
  }, [showConversation, activeContact?.id, messages, user?.id, markedAsReadIds]);

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
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        <div className="flex flex-col md:flex-row justify-between mb-6 rtl">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">المحادثات</h1>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="self-start md:self-auto">{totalUnread} رسالة جديدة</Badge>
          )}
        </div>
        
        <div className="flex h-[75vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Contacts List */}
          {showContactsList && (
            <div className={`${isMobile ? 'w-full' : 'w-1/3 lg:w-1/4'} border-l border-gray-200 dark:border-gray-700 flex flex-col rtl`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative mb-3">
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="بحث في المحادثات..." 
                    className="pr-10 rtl" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  {searchQuery && (
                    <button 
                      onClick={clearSearch}
                      className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600"
                      aria-label="مسح البحث"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setCurrentTab(value as "all" | "unread")}>
                  <TabsList className="grid w-full grid-cols-2 rtl mb-2">
                    <TabsTrigger value="all">جميع المحادثات</TabsTrigger>
                    <TabsTrigger value="unread" className="relative">
                      غير مقروءة
                      {totalUnread > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 left-0 transform -translate-x-1/2 translate-y-1/2">
                          {totalUnread}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {tab === 'inbox' ? (
                  inboxMessages.length > 0 ? (
                    inboxMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-4 mb-3 rounded-lg shadow-sm border transition hover:bg-blue-50 cursor-pointer ${!msg.isRead ? 'border-blue-400' : 'border-gray-200'}`}
                        onClick={() => handleOpenConversation(msg.senderId, msg.senderName, msg.senderAvatar)}
                      >
                        <div className="flex items-center mb-1">
                          <span className="font-bold text-lg text-gray-800 flex-1">{msg.subject}</span>
                          {!msg.isRead && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded ml-2">جديد</span>}
                        </div>
                        <div className="flex items-center mb-1">
                          {msg.senderAvatar && (
                            <img src={msg.senderAvatar} alt={msg.senderName} className="w-7 h-7 rounded-full ml-2" />
                          )}
                          <span className="text-sm text-blue-700 font-medium">{msg.senderName || 'مستخدم'}</span>
                        </div>
                        <div className="text-gray-600 text-sm mb-1" style={{whiteSpace: 'pre-line'}}>
                          {msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}
                        </div>
                        <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString('ar-EG')}</div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className="text-gray-400 mb-4">
                        <Search className="h-10 w-10 mx-auto" />
                      </div>
                      <p className="text-gray-500 text-center">لا توجد رسائل واردة</p>
                    </div>
                  )
                ) : (
                  filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className={`flex items-center p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${activeContact?.id === contact.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      onClick={() => handleContactClick(contact)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} />
                          ) : (
                            <div className="bg-blue text-white h-full w-full flex items-center justify-center">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                        </Avatar>
                        {contact.isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                        )}
                      </div>
                      
                      <div className="mr-3 flex-1 min-w-0">
                        <div className="flex justify-between items-start w-full">
                          <h3 className="font-semibold truncate">{contact.name}</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap mr-1">{formatDate(new Date(contact.lastMessageTime || ""))}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{contact.lastMessage}</p>
                      </div>
                      
                        {contact.unreadCount && (
                        <div className="bg-blue text-white text-xs font-bold min-w-[1.5rem] h-6 flex items-center justify-center rounded-full mr-1">
                            {contact.unreadCount}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-gray-400 mb-4">
                      <Search className="h-10 w-10 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-center">لا توجد نتائج مطابقة للبحث</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                          setSearchQuery('');
                        setCurrentTab('all');
                      }}
                    >
                      إعادة ضبط الفلتر
                    </Button>
                  </div>
                  )
                )}
              </div>
              
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  onClick={startNewChat}
                  className="w-full bg-blue text-white hover:bg-blue-600"
                >
                  بدء محادثة جديدة
                </Button>
              </div>
            </div>
          )}
          
          {/* Chat Window */}
          {activeContact && showConversation && (!showContactsList || !isMobile) && (
            <div className="flex-1 flex flex-col rtl" ref={chatContainerRef}>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center">
                  {isMobile && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500 ml-2"
                      onClick={handleBackToContacts}
                      aria-label="العودة إلى قائمة المحادثات"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10 ml-3">
                    {activeContact.avatar ? (
                      <img src={activeContact.avatar} alt={activeContact.name} />
                    ) : (
                      <div className="bg-blue text-white h-full w-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <h3 
                      className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={handleSellerProfile}
                    >
                      {activeContact.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeContact.isOnline ? 'متصل الآن' : 'غير متصل'}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-s-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hidden md:flex"
                    aria-label="مكالمة صوتية"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hidden md:flex"
                    aria-label="مكالمة فيديو"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500"
                    onClick={handleSellerProfile}
                    aria-label="معلومات الاتصال"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {messages.length > 0 ? (
                  messages.map((message, index) => {
                    // Show date if first message or if message date differs from previous message
                    const showDate = index === 0 || 
                      new Date(message.timestamp).toDateString() !== 
                      new Date(messages[index - 1].timestamp).toDateString();
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs">
                              {formatDate(new Date(message.timestamp))}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div className={`max-w-[70%] md:max-w-[60%] ${
                            message.senderId === user?.id 
                              ? 'bg-blue text-white' 
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            } rounded-lg px-4 py-2 shadow-sm`}
                          >
                            {message.subject && (
                              <div className="text-sm font-medium mb-1">{message.subject}</div>
                            )}
                            <p className="break-words">{message.content}</p>
                            <div className={`flex justify-end items-center gap-1 mt-1 ${message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                              <span className="text-xs">{formatTime(new Date(message.timestamp))}</span>
                              {message.isRead && (
                                <CheckCheck className="h-3 w-3 text-blue-100" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">ابدأ محادثة مع {activeContact.name}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky bottom-0">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 ml-1 hidden sm:flex"
                    aria-label="إضافة ايموجي"
                  >
                    <Smile className="h-6 w-6" />
                  </Button>
                  <div className="flex space-s-2 ml-2 hidden sm:flex">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500"
                      aria-label="إرفاق ملف"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500"
                      aria-label="إرفاق صورة"
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                  </div>
                  <Input 
                    type="text" 
                    placeholder="موضوع الرسالة (اختياري)"
                    className="border-0 bg-transparent flex-1 focus-visible:ring-0 focus-visible:ring-offset-0" 
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue hover:bg-blue-600 text-white rounded-full ml-2 p-2 h-10 w-10"
                    aria-label="إرفاق ملف"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Input 
                    type="text" 
                    placeholder="اكتب رسالتك هنا..." 
                    className="border-0 bg-transparent flex-1 focus-visible:ring-0 focus-visible:ring-offset-0" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="bg-blue hover:bg-blue-600 text-white rounded-full ml-2 p-2 h-10 w-10"
                    disabled={newMessage.trim() === ""}
                    aria-label="إرسال الرسالة"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty State - No Selected Conversation */}
          {(activeContact === null || (isMobile && showContactsList && activeContact)) && !isMobile && (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
              <Card className="text-center w-3/4 max-w-md p-8">
                <div className="text-gray-400 mb-6">
                  <MessageCircle className="h-20 w-20 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-4">لم يتم اختيار محادثة</h3>
                <p className="text-gray-500 mb-6">اختر جهة اتصال من القائمة لبدء المحادثة أو متابعة محادثة سابقة</p>
                <Button 
                  variant="outline" 
                  className="mx-auto"
                  onClick={startNewChat}
                >
                  بدء محادثة جديدة
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Chat;
