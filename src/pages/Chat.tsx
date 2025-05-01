
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
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: number;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
  read: boolean;
}

interface Contact {
  id: string | number;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  avatar?: string;
  isOnline: boolean;
}

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"all" | "unread">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showContactsList, setShowContactsList] = useState(!id);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      // Mock data - simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const contactsData: Contact[] = [
        { id: "seller123", name: "أحمد محمود", lastMessage: "رائع! يسعدني اهتمامك. هل لديك أي أسئلة محددة حول الشقة؟", lastMessageTime: new Date(Date.now() - 20 * 60 * 1000), unread: 1, isOnline: true },
        { id: 2, name: "سارة خالد", lastMessage: "شكراً لتواصلك، سأرد عليك في أقرب وقت", lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), unread: 2, isOnline: true },
        { id: 3, name: "محمد علي", lastMessage: "تم استلام طلبك وسيتم التعامل معه قريباً", lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), unread: 3, isOnline: false },
        { id: 4, name: "فاطمة أحمد", lastMessage: "أنا مهتمة بالمنتج، هل هو متوفر؟", lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), unread: 1, isOnline: false },
        { id: 5, name: "عمر حسن", lastMessage: "شكراً جزيلاً", lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), unread: 0, isOnline: false },
        { id: 6, name: "ليلى سليم", lastMessage: "سعر جيد، هل يمكن التفاوض؟", lastMessageTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), unread: 0, isOnline: true },
        { id: 7, name: "خالد عبدالله", lastMessage: "متى يمكن أن أستلم المنتج؟", lastMessageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), unread: 0, isOnline: false },
        { id: 8, name: "ياسمين أحمد", lastMessage: "هل لديك صور إضافية للمنتج؟", lastMessageTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), unread: 0, isOnline: true },
        { id: 9, name: "زياد محمود", lastMessage: "سأفكر في الأمر وأعود إليك قريباً", lastMessageTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), unread: 0, isOnline: false },
        { id: 10, name: "رنا سمير", lastMessage: "هل يمكنني الحصول على خصم إذا اشتريت منتجين؟", lastMessageTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), unread: 0, isOnline: true },
      ];

      setContacts(contactsData);

      // If we have an id parameter, set the active contact
      if (id) {
        const contact = contactsData.find(c => c.id.toString() === id);
        if (contact) {
          setActiveContact(contact);
          // Load messages for this contact
          loadMessagesForContact(contact);
        } else {
          // If contact not found, navigate to base chat route
          navigate('/chat');
        }
      } else if (contactsData.length > 0) {
        // Default to first contact if no id specified
        setActiveContact(contactsData[0]);
        loadMessagesForContact(contactsData[0]);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const loadMessagesForContact = (contact: Contact) => {
    // Create custom messages based on the contact
    const now = Date.now();
    let contactMessages: Message[] = [];
    
    if (contact.id === "seller123") {
      contactMessages = [
        { id: 1, text: "مرحباً، كيف يمكنني مساعدتك اليوم؟", sender: "other", timestamp: new Date(now - 25 * 60 * 1000), read: true },
        { id: 2, text: "أنا مهتم بالمزاد الذي أقمته للشقة الفاخرة في رام الله", sender: "user", timestamp: new Date(now - 24 * 60 * 1000), read: true },
        { id: 3, text: "رائع! يسعدني اهتمامك. هل لديك أي أسئلة محددة حول الشقة؟", sender: "other", timestamp: new Date(now - 20 * 60 * 1000), read: contact.unread === 0 },
        { id: 4, text: "نعم، هل يمكنك إخباري المزيد عن حالة الشقة والمرافق القريبة؟", sender: "user", timestamp: new Date(now - 18 * 60 * 1000), read: true },
        { id: 5, text: "بالتأكيد! الشقة بحالة ممتازة وتم تجديدها بالكامل قبل 6 أشهر. وهي قريبة من مركز المدينة، ومحاطة بالعديد من المرافق مثل المدارس والمستشفيات والمحلات التجارية.", sender: "other", timestamp: new Date(now - 15 * 60 * 1000), read: contact.unread === 0 },
      ];
    } else if (contact.id === 2) {
      contactMessages = [
        { id: 1, text: "مرحباً بك في المتجر", sender: "other", timestamp: new Date(now - 3 * 60 * 60 * 1000), read: true },
        { id: 2, text: "شكراً، لدي استفسار حول المنتجات الجديدة", sender: "user", timestamp: new Date(now - 2.5 * 60 * 60 * 1000), read: true },
        { id: 3, text: "شكراً لتواصلك، سأرد عليك في أقرب وقت", sender: "other", timestamp: new Date(now - 2 * 60 * 60 * 1000), read: contact.unread === 0 },
      ];
    } else if (contact.id === 3) {
      contactMessages = [
        { id: 1, text: "مرحباً، هل المنتجات ستصل في الموعد المحدد؟", sender: "user", timestamp: new Date(now - 50 * 60 * 1000), read: true },
        { id: 2, text: "بالتأكيد، جميع الطلبات ستصل في الوقت المحدد", sender: "other", timestamp: new Date(now - 48 * 60 * 1000), read: true },
        { id: 3, text: "هل يمكنني تغيير عنوان التوصيل؟", sender: "user", timestamp: new Date(now - 46 * 60 * 1000), read: true },
        { id: 4, text: "تم استلام طلبك وسيتم التعامل معه قريباً", sender: "other", timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000), read: contact.unread === 0 },
      ];
    } else if (contact.id === 4) {
      contactMessages = [
        { id: 1, text: "مرحباً، رأيت منتجك على المنصة وأنا مهتمة به", sender: "other", timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000), read: true },
        { id: 2, text: "أهلاً بك، يسعدني اهتمامك. المنتج متوفر ويمكنني إرسال صور إضافية له", sender: "user", timestamp: new Date(now - 2.5 * 24 * 60 * 60 * 1000), read: true },
        { id: 3, text: "رائع! أنا مهتمة بالمنتج، هل هو متوفر؟", sender: "other", timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000), read: contact.unread === 0 },
      ];
    } else {
      // Generic messages for other contacts
      contactMessages = [
        { id: 1, text: `مرحباً، أنا ${contact.name}، كيف يمكنني مساعدتك؟`, sender: "other", timestamp: new Date(now - 35 * 60 * 1000), read: true },
        { id: 2, text: "أنا مهتم بمنتجاتك، هل يمكنك إخباري المزيد عنها؟", sender: "user", timestamp: new Date(now - 30 * 60 * 1000), read: true },
        { id: 3, text: contact.lastMessage, sender: "other", timestamp: contact.lastMessageTime, read: contact.unread === 0 },
      ];
    }
    
    setMessages(contactMessages);

    // Mark messages as read
    if (contact.unread > 0) {
      setContacts(prevContacts => 
        prevContacts.map(c => 
          c.id === contact.id ? { ...c, unread: 0 } : c
        )
      );
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleContactClick = (contact: Contact) => {
    setActiveContact(contact);
    
    // Update URL to show contact ID
    navigate(`/chat/${contact.id}`);
    
    // In mobile view, once a contact is selected, hide the contacts list
    if (isMobile) {
      setShowContactsList(false);
    }
    
    // Load appropriate messages for the contact
    loadMessagesForContact(contact);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
      read: false
    };

    setMessages(prevMessages => [...prevMessages, newMsg]);
    setNewMessage("");

    // Show notification that message was sent
    toast.success("تم إرسال الرسالة");

    // Simulate automated reply after 2 seconds
    setTimeout(() => {
      const autoReply: Message = {
        id: messages.length + 2,
        text: "شكراً لرسالتك! سأرد عليك في أقرب وقت ممكن.",
        sender: "other",
        timestamp: new Date(),
        read: false
      };
      setMessages(prevMessages => [...prevMessages, autoReply]);
    }, 2000);
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
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           contact.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = currentTab === "all" || (currentTab === "unread" && contact.unread > 0);
      return matchesSearch && matchesTab;
    });
  }, [contacts, searchTerm, currentTab]);

  const handleBackToContacts = () => {
    setShowContactsList(true);
  };

  const handleSellerProfile = () => {
    if (activeContact) {
      navigate(`/seller/${activeContact.id}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
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

  const totalUnread = contacts.reduce((sum, contact) => sum + contact.unread, 0);

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  {searchTerm && (
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
                {filteredContacts.length > 0 ? (
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
                          <span className="text-xs text-gray-500 whitespace-nowrap mr-1">{formatDate(contact.lastMessageTime)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{contact.lastMessage}</p>
                      </div>
                      
                      {contact.unread > 0 && (
                        <div className="bg-blue text-white text-xs font-bold min-w-[1.5rem] h-6 flex items-center justify-center rounded-full mr-1">
                          {contact.unread}
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
                        setSearchTerm('');
                        setCurrentTab('all');
                      }}
                    >
                      إعادة ضبط الفلتر
                    </Button>
                  </div>
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
          {activeContact && (!showContactsList || !isMobile) && (
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
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div className={`max-w-[70%] md:max-w-[60%] ${
                            message.sender === 'user' 
                              ? 'bg-blue text-white' 
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            } rounded-lg px-4 py-2 shadow-sm`}
                          >
                            <p className="break-words">{message.text}</p>
                            <div className={`flex justify-end items-center gap-1 mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                              <span className="text-xs">{formatTime(message.timestamp)}</span>
                              {message.sender === 'user' && (
                                <CheckCheck className={`h-3 w-3 ${message.read ? 'text-blue-100' : 'text-blue-200'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
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
