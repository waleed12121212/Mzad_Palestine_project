import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Send, User, Search, MoreVertical, Phone, Video, 
  Info, Paperclip, Image, Smile, ArrowLeft, 
  CheckCheck, MessageCircle, ArrowRightIcon, X, FileText, File
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { userService } from '@/services/userService';
import { signalRService } from '@/services/signalRService';
import axios from 'axios';

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
  fileUrl?: string;
  fileType?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
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

// Add new interface for selected file
interface SelectedFile {
  file: File;
  previewUrl?: string;
}

// Add new interface for download state
interface DownloadState {
  isDownloading: boolean;
  progress: number;
  downloadedUrl?: string;
  fileName: string;
}

// Utility function to parse the auction block
function parseAuctionBlock(content: string) {
  // Flexible regex: matches [مزاد: title](url) optionally followed by image and price, then the rest
  const auctionRegex = /^\[مزاد: (.+?)\]\((.+?)\)[ \n]*(?:!\[صورة المزاد\]\((.+?)\)[ \n]*)?(?:السعر الحالي: ₪(\d+)[ \n]*)?(?:[-]+[ \n]*)?/;
  const match = content.match(auctionRegex);
  if (!match) return null;
  return {
    title: match[1],
    url: match[2],
    image: match[3],
    price: match[4],
    rest: content.replace(auctionRegex, '').trim(),
  };
}

// Utility function to parse the product block
function parseProductBlock(content) {
  console.log("Parsing product from:", content);
  
  // First try the standard format
  const standardRegex = /^\[منتج: (.+?)\]\((.+?)\)\nالسعر الحالي: ₪([\d,]+)\n-+\n/;
  const standardMatch = content.match(standardRegex);
  
  if (standardMatch) {
    console.log("Standard match:", standardMatch);
    return {
      title: standardMatch[1],
      url: standardMatch[2],
      price: parseInt(standardMatch[3].replace(/,/g, '')),
      comment: '',
      rest: content.replace(standardRegex, '')
    };
  }
  
  // Try simple format: Product name followed by price with ₪ symbol
  // This handles cases like "حصان فتحي السعر: 650₪ بدي ياه"
  const simpleRegex = /^([^₪]+?)(?:\s+السعر:?\s*|\s*:?\s*)(\d+)₪\s*(.+)?/;
  const simpleMatch = content.match(simpleRegex);
  
  console.log("Simple match:", simpleMatch);
  
  if (simpleMatch) {
    const result = {
      title: simpleMatch[1].trim(),
      url: '#', // Default URL since it's not provided
      price: parseInt(simpleMatch[2]),
      comment: simpleMatch[3] ? simpleMatch[3].trim() : '',
      rest: ''
    };
    console.log("Parsed product:", result);
    return result;
  }
  
  // If no match, try a very simple pattern just to catch price with ₪ symbol
  const verySimpleRegex = /^(.+?)(\d+)₪(.*)$/;
  const verySimpleMatch = content.match(verySimpleRegex);
  
  console.log("Very simple match:", verySimpleMatch);
  
  if (verySimpleMatch) {
    const result = {
      title: verySimpleMatch[1].trim(),
      url: '#',
      price: parseInt(verySimpleMatch[2]),
      comment: verySimpleMatch[3] ? verySimpleMatch[3].trim() : '',
      rest: ''
    };
    console.log("Parsed product (very simple):", result);
    return result;
  }
  
  return null;
}

// Utility function to parse the job block
function parseJobBlock(content) {
  // Flexible regex: handles different spacing and newlines
  const jobRegex = /^\[وظيفة:\s*(.+?)\s*\]\((.+?)\)\s*الشركة:\s*(.+?)\s*الموقع:\s*(.+?)\s*-+\s*/;
  const match = content.match(jobRegex);
  
  if (!match) return null;
  
  return {
    title: match[1].trim(),
    url: match[2].trim(),
    company: match[3].trim(),
    location: match[4].trim(),
    rest: content.replace(jobRegex, '').trim()
  };
}

// Utility function to parse the service block
function parseServiceBlock(content) {
  const serviceRegex = /^\[خدمة: (.+?)\]\((.+?)\)\nالسعر: ₪(\d+)\nالموقع: (.+?)\n-+\n/;
  const match = content.match(serviceRegex);
  
  if (!match) return null;
  
  return {
    title: match[1],
    url: match[2],
    price: parseInt(match[3]),
    location: match[4],
    rest: content.replace(serviceRegex, '')
  };
}

// Helper to determine if a URL is internal or external
const isInternalLink = (url: string) => {
  return url.startsWith(window.location.origin) || url.startsWith('/');
};

// Helper to convert internal URL to path for React Router
const getInternalPath = (url: string) => {
  if (url.startsWith(window.location.origin)) {
    return url.replace(window.location.origin, '');
  }
  return url;
};

// AuctionMessage component
const AuctionMessage: React.FC<{ content: string; isCurrentUser?: boolean, fileType?: string }> = ({ content, isCurrentUser = false, fileType }) => {
  const auction = parseAuctionBlock(content);
  const product = parseProductBlock(content);
  const job = parseJobBlock(content);
  const service = parseServiceBlock(content);
  const isJobWithPdf = job && fileType && fileType.toLowerCase().includes('pdf');

  // If it's a job with a PDF, FilePreview will render it.
  if (isJobWithPdf) {
    return null; // FilePreview handles rendering for jobs with PDFs
  }
  
  if (auction) {
    return (
      <div style={{ margin: 0 }}>
        <div
          style={{
            border: isCurrentUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid #2563eb',
            background: isCurrentUser ? 'rgba(255,255,255,0.1)' : '#f0f6ff',
            borderRadius: isCurrentUser ? '8px 8px 0 0' : '8px 8px 0 0',
            padding: 12,
            marginBottom: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {auction.image && (
            <img
              src={auction.image}
              alt={auction.title}
              style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }}
            />
          )}
          <div>
            {isInternalLink(auction.url) ? (
              <Link
                to={getInternalPath(auction.url)}
                style={{ 
                  color: isCurrentUser ? '#ffffff' : '#2563eb', 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  textDecoration: 'none' 
                }}
              >
                {auction.title}
              </Link>
            ) : (
              <a
                href={auction.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: isCurrentUser ? '#ffffff' : '#2563eb', 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  textDecoration: 'none' 
                }}
              >
                {auction.title}
              </a>
            )}
            {auction.price && (
              <div style={{ 
                color: isCurrentUser ? '#ffffff' : '#2563eb', 
                fontSize: 14, 
                marginTop: 2,
                opacity: isCurrentUser ? 0.9 : 1
              }}>
                السعر الحالي: ₪{auction.price}
              </div>
            )}
          </div>
        </div>
        {auction.rest && (
          <div style={{ 
            padding: '8px 12px',
            borderTop: isCurrentUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
          }}>
            {auction.rest}
          </div>
        )}
      </div>
    );
  } else if (product) {
    return (
      <div style={{ margin: 0 }}>
        <div
          style={{
            border: '1px solid #1e40af',
            background: '#f0f7ff',
            color: '#1e40af',
            borderRadius: '12px',
            padding: 0,
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxWidth: '250px',
          }}
        >
          <div style={{
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{ 
              color: '#1e40af', 
              fontWeight: 'bold', 
              fontSize: 18,
              textAlign: 'center',
              width: '100%'
            }}>
              {product.title}
            </div>
            {product.price && (
              <div style={{ 
                color: '#1e40af', 
                fontSize: 14, 
                marginTop: 6,
                textAlign: 'center',
                width: '100%'
              }}>
                السعر: ₪{product.price}
              </div>
            )}
          </div>
          
          {product.comment && (
            <div style={{ 
              backgroundColor: '#2563eb',
              color: 'white', 
              fontSize: 14, 
              padding: '10px 16px',
              textAlign: 'center',
              width: '100%'
            }}>
              {product.comment}
            </div>
          )}
        </div>
        {product.rest && (
          <div style={{ 
            padding: '8px 12px',
            borderTop: isCurrentUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
          }}>
            {product.rest}
          </div>
        )}
      </div>
    );
  } else if (job) {
    return (
      <div style={{ margin: 0 }}>
        <div
          style={{
            border: isCurrentUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid #6366f1',
            background: isCurrentUser ? 'rgba(255,255,255,0.1)' : '#f1f5fd',
            borderRadius: isCurrentUser ? '8px 8px 0 0' : '8px 8px 0 0',
            padding: 12,
            marginBottom: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            {isInternalLink(job.url) ? (
              <Link
                to={getInternalPath(job.url)}
                style={{ 
                  color: isCurrentUser ? '#ffffff' : '#6366f1', 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  textDecoration: 'none' 
                }}
              >
                {job.title}
              </Link>
            ) : (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: isCurrentUser ? '#ffffff' : '#6366f1', 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  textDecoration: 'none' 
                }}
              >
                {job.title}
              </a>
            )}
            <div style={{ fontSize: 14, marginTop: 2 }}>
              {job.company && <span style={{ 
                color: isCurrentUser ? '#ffffff' : '#6366f1',
                opacity: isCurrentUser ? 0.9 : 1
              }}>الشركة: {job.company}</span>}
              {job.company && job.location && <span> • </span>}
              {job.location && <span style={{ 
                color: isCurrentUser ? '#ffffff' : '#6366f1',
                opacity: isCurrentUser ? 0.9 : 1
              }}>الموقع: {job.location}</span>}
            </div>
          </div>
        </div>
        {job.rest && (
          <div style={{ 
            padding: '8px 12px',
            borderTop: isCurrentUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
          }}>
            {job.rest}
          </div>
        )}
      </div>
    );
  } else if (service) {
    return (
      <div style={{ margin: 0 }}>
        <div
          style={{
            border: isCurrentUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid #ec4899',
            background: isCurrentUser ? 'rgba(255,255,255,0.1)' : '#fdf2f8',
            borderRadius: isCurrentUser ? '8px 8px 0 0' : '8px 8px 0 0',
            padding: 12,
            marginBottom: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            {isInternalLink(service.url) ? (
              <Link
                to={getInternalPath(service.url)}
                style={{ 
                  color: isCurrentUser ? '#ffffff' : '#ec4899', 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  textDecoration: 'none' 
                }}
              >
                {service.title}
              </Link>
            ) : (
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: isCurrentUser ? '#ffffff' : '#ec4899', 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  textDecoration: 'none' 
                }}
              >
                {service.title}
              </a>
            )}
            <div style={{ fontSize: 14, marginTop: 2 }}>
              {service.price && <span style={{ 
                color: isCurrentUser ? '#ffffff' : '#ec4899',
                opacity: isCurrentUser ? 0.9 : 1
              }}>السعر: ₪{service.price}</span>}
              {service.price && service.location && <span> • </span>}
              {service.location && <span style={{ 
                color: isCurrentUser ? '#ffffff' : '#ec4899',
                opacity: isCurrentUser ? 0.9 : 1
              }}>الموقع: {service.location}</span>}
            </div>
          </div>
        </div>
        {service.rest && (
          <div style={{ 
            padding: '8px 12px',
            borderTop: isCurrentUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
          }}>
            {service.rest}
          </div>
        )}
      </div>
    );
  }
  
  return <span>{content}</span>;
};

// FilePreview component props interface
interface FilePreviewProps {
  attachment?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  };
  fileUrl?: string;
  fileType?: string;
  messageId?: number;
  content?: string;
  isCurrentUser?: boolean;
}

// Update FilePreview component with proper typing
const FilePreview: React.FC<FilePreviewProps> = ({ attachment, fileUrl, fileType, messageId, content, isCurrentUser }) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState | null>(null);

  const handleImageClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImageUrl(url);
    setPreviewModalOpen(true);
  };

  const closePreview = () => {
    setPreviewModalOpen(false);
    setPreviewImageUrl(null);
  };

  const getDownloadUrl = (url: string) => {
    if (url.includes('uploads/message-files')) {
      return `http://mazadpalestine.runasp.net/Message/file/${messageId}`;
    }
    return url;
  };

  const handlePdfDownload = async (url: string, fileName: string) => {
    try {
      setDownloadState({
        isDownloading: true,
        progress: 0,
        fileName: fileName || 'document.pdf'
      });

      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 100));
          setDownloadState(prev => prev ? { ...prev, progress } : null);
        }
      });

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);

      setDownloadState(prev => prev ? {
        ...prev,
        isDownloading: false,
        progress: 100,
        downloadedUrl: blobUrl
      } : null);

      // Open PDF in new tab
      window.open(blobUrl, '_blank');

      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        setDownloadState(null);
      }, 1000);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
      setDownloadState(null);
    }
  };

  // If we have a direct file (new format)
  if (fileUrl) {
    const isImage = fileType?.toLowerCase().includes('png') || 
                   fileType?.toLowerCase().includes('jpg') || 
                   fileType?.toLowerCase().includes('jpeg') || 
                   fileType?.toLowerCase().includes('gif');
    const isVideo = fileType?.toLowerCase().includes('mp4') || 
                   fileType?.toLowerCase().includes('mov');
    const isPDF = fileType?.toLowerCase().includes('pdf');

    const downloadUrl = getDownloadUrl(fileUrl);
    const displayUrl = fileUrl.startsWith('http') ? fileUrl : `http://mazadpalestine.runasp.net/${fileUrl}`;
    
    if (isImage) {
      return (
        <>
          {previewModalOpen && previewImageUrl && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
              onClick={closePreview}
            >
              <div className="relative max-w-[800px] w-full">
                <button
                  onClick={closePreview}
                  className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <img 
                  src={previewImageUrl} 
                  alt="معاينة كبيرة"
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={displayUrl}
              alt="مرفق"
              className="max-w-[200px] max-h-[200px] object-cover cursor-pointer"
              onClick={(e) => handleImageClick(e, displayUrl)}
            />
          </div>
        </>
      );
    }
    
    if (isVideo) {
      return (
        <div className="relative rounded-lg overflow-hidden">
          <video 
            src={displayUrl}
            controls
            className="max-w-[200px] max-h-[200px]"
          />
        </div>
      );
    }
    
    // Parse the job block before the conditional rendering
    const job = content ? parseJobBlock(content) : null;

    if (isPDF) {
      // If it's a job application message
      if (job) {
        return (
          <div className={`rounded-lg border overflow-hidden ${isCurrentUser ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
            <div className="p-3">
                {isInternalLink(job.url) ? (
                    <Link to={getInternalPath(job.url)} className={`font-bold text-base no-underline ${isCurrentUser ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                        {job.title}
                    </Link>
                ) : (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className={`font-bold text-base no-underline ${isCurrentUser ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                        {job.title}
                    </a>
                )}
                <div className={`text-sm mt-1 ${isCurrentUser ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {job.company && <span>الشركة: {job.company}</span>}
                    {job.company && job.location && <span> • </span>}
                    {job.location && <span>الموقع: {job.location}</span>}
                </div>
            </div>

            <div className={`px-3 pb-3 border-t ${isCurrentUser ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                {job.rest && (
                    <p className={`pt-2 mb-2 text-sm ${isCurrentUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {job.rest}
                    </p>
                )}
                <button
                    onClick={() => handlePdfDownload(downloadUrl, 'document.pdf')}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg w-full text-sm font-medium transition-colors ${
                        isCurrentUser
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                    disabled={downloadState?.isDownloading}
                >
                    <FileText className="w-5 h-5 text-red-500" />
                    <span>
                        {downloadState?.isDownloading
                            ? `جاري التحميل... ${downloadState.progress}%`
                            : downloadState?.downloadedUrl
                                ? 'تم التحميل - انقر للعرض'
                                : 'تحميل وعرض الملف'}
                    </span>
                </button>
                {downloadState?.isDownloading && (
                    <div className="mt-2 h-1 w-full bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${downloadState.progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
        );
      }
      
      // Regular PDF message (not a job)
      return (
        <div className="relative">
          <button 
            onClick={() => handlePdfDownload(downloadUrl, 'document.pdf')}
            className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 w-full"
            disabled={downloadState?.isDownloading}
          >
            <FileText className="w-5 h-5 text-red-500" />
            <span className="text-sm">
              {downloadState?.isDownloading ? (
                `جاري التحميل... ${downloadState.progress}%`
              ) : downloadState?.downloadedUrl ? (
                'تم التحميل - انقر للعرض'
              ) : (
                'تحميل وعرض الملف'
              )}
            </span>
          </button>
          {downloadState?.isDownloading && (
            <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${downloadState.progress}%` }}
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <a 
        href={downloadUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <File className="w-5 h-5 text-blue-500" />
        <span className="text-sm">تحميل الملف</span>
      </a>
    );
  }

  return null;
};

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
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
        (msg: Message) => !msg.isRead && Number(msg.receiverId) === Number(user?.id)
      );
      
      if (unreadMessages.length > 0) {
        await messageService.markAllInboxAsRead();
        // Update local state to reflect read status
        setMessages(prevMsgs => 
          prevMsgs.map(msg => 
            Number(msg.receiverId) === Number(user?.id) ? { ...msg, isRead: true } : msg
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || !files[0]) {
      return;
    }

    const file = files[0];
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 
      'video/mp4', 'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type) || file.size > maxFileSize) {
      toast.error(
        'الملف غير مدعوم أو حجمه كبير جداً. الحد الأقصى 10 ميجابايت.'
      );
      return;
    }

    // Create preview URL for images
    let previewUrl;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    setSelectedFile({ file, previewUrl });
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !messageSubject.trim() && !selectedFile) return;
    const receiverId = selectedConversationId || activeContact?.id;
    
    if (!receiverId) {
      toast.error('لا يوجد جهة اتصال محددة');
      return;
    }

    try {
      if (selectedFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', selectedFile.file);
        formData.append('ReceiverId', receiverId.toString());
        formData.append('Subject', messageSubject.trim() || 'مرفقات');
        formData.append('Content', newMessage.trim() || 'تم إرسال مرفقات');

        await axios.post('/Message/with-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Clean up preview URL
        if (selectedFile.previewUrl) {
          URL.revokeObjectURL(selectedFile.previewUrl);
        }
        setSelectedFile(null);
      } else {
        // Send regular message without file
        await messageService.sendMessage({
          receiverId,
          subject: messageSubject.trim() === '' ? "default" : messageSubject,
          content: newMessage,
        });
      }

      await fetchMessages(receiverId);
      setNewMessage('');
      setMessageSubject('');
      toast.success('تم إرسال الرسالة بنجاح');
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    }
  };

  // دالة تحويل الوقت إلى توقيت فلسطين الصيفي UTC+3
  const toPalestineTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString.getTime());
    date.setHours(date.getHours() + 3); // أضف 3 ساعات
    return date;
  };

  const formatTime = (dateInput: string | Date) => {
    const date = toPalestineTime(dateInput);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateInput: string | Date) => {
    const date = toPalestineTime(dateInput);
    const now = toPalestineTime(new Date());
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

  // إضافة معالج الرسائل الجديدة
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // أضف الرسالة إذا كانت تخص المحادثة الحالية (سواء أرسلها أو استقبلها المستخدم)
      if (
        (selectedConversationId && (message.senderId === selectedConversationId || message.receiverId === selectedConversationId)) ||
        (user && (message.senderId === Number(user.id) || message.receiverId === Number(user.id)))
      ) {
        setMessages(prev => [...prev, message]);
        // تحديث قائمة جهات الاتصال
        setContacts(prev => prev.map(contact => {
          if (contact.id === message.senderId) {
            return {
              ...contact,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              unreadCount: (contact.unreadCount || 0) + 1
            };
          }
          return contact;
        }));
      }
    };

    // بدء اتصال SignalR عند تحميل المكون
    signalRService.startConnection();

    // إضافة معالج الرسائل الجديدة
    signalRService.addMessageHandler(handleNewMessage);

    // تنظيف عند إزالة المكون
    return () => {
      signalRService.removeMessageHandler(handleNewMessage);
      signalRService.stopConnection();
    };
  }, [selectedConversationId, user]);

  // Add handleImageClick function
  const handleImageClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImageUrl(url);
    setPreviewModalOpen(true);
  };

  // Add closePreview function
  const closePreview = () => {
    setPreviewModalOpen(false);
    setPreviewImageUrl(null);
  };

  if (loading) {
    return (
        <div className="container mx-auto py-8 max-w-screen-xl">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
    );
  }

  const totalUnread = contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);

  return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#181E2A] flex items-center justify-center">
        {/* Image Preview Modal */}
        {previewModalOpen && previewImageUrl && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={closePreview}
          >
            <div className="relative max-w-[800px] w-full">
              <button
                onClick={closePreview}
                className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <img 
                src={previewImageUrl} 
                alt="معاينة كبيرة"
                className="w-full max-h-[70vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
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
                    <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700">
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar.startsWith('http') ? msg.senderAvatar : `http://mazadpalestine.runasp.net${msg.senderAvatar}`}
                          alt={msg.senderName}
                          className="w-full h-full rounded-full object-cover"
                          onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <AvatarFallback>{msg.senderName ? msg.senderName.charAt(0) : '؟'}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-base truncate dark:text-white">{msg.senderName || 'مستخدم'}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-400 ml-2 whitespace-nowrap">{formatDate(new Date(msg.timestamp))}</span>
                      </div>
                      <span className="block text-xs truncate text-gray-500 dark:text-gray-400">{(msg.lastMessage || msg.content) && (msg.lastMessage || msg.content).length > 40 ? (msg.lastMessage || msg.content).slice(0, 40) + '...' : (msg.lastMessage || msg.content)}</span>
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
          <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 dark:text-white">
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
                              <AvatarFallback>{contact.name ? contact.name.charAt(0) : '؟'}</AvatarFallback>
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
                    messages.map((message, index) => {
                      const isCurrentUser = user?.id ? message.senderId === Number(user.id) : false;
                      const isSpecialMessage = parseAuctionBlock(message.content) || 
                                              parseProductBlock(message.content) || 
                                              parseJobBlock(message.content) || 
                                              parseServiceBlock(message.content);
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div className={`max-w-[70%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-lg ${isSpecialMessage ? 'p-0 overflow-hidden' : 'p-3'}`}>
                            <div className={`${isSpecialMessage ? '' : 'text-sm mb-1'}`}>
                              <AuctionMessage content={message.content} isCurrentUser={isCurrentUser} fileType={message.fileType} />
                            </div>
                            {message.fileUrl ? (
                              <div className={`${isSpecialMessage ? 'px-3 pb-3' : 'mt-2'}`}>
                                <FilePreview 
                                  fileUrl={message.fileUrl} 
                                  fileType={message.fileType} 
                                  messageId={message.id}
                                  content={message.content}
                                  isCurrentUser={isCurrentUser}
                                />
                              </div>
                            ) : message.attachments && message.attachments.length > 0 ? (
                              <div className={`${isSpecialMessage ? 'px-3 pb-3' : 'mt-2'} space-y-2`}>
                                {message.attachments.map((attachment, i) => (
                                  <FilePreview key={i} attachment={attachment} />
                                ))}
                              </div>
                            ) : null}
                            <div className={`text-xs ${isSpecialMessage ? 'px-3 pb-2' : 'mt-1'} opacity-70`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })
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
                    {/* File Preview */}
                    {selectedFile && (
                      <div className="mb-2 relative">
                        {selectedFile.previewUrl ? (
                          <div className="relative inline-block">
                            <img 
                              src={selectedFile.previewUrl} 
                              alt="معاينة" 
                              className="max-h-32 rounded-lg cursor-pointer"
                              onClick={(e) => handleImageClick(e, selectedFile.previewUrl!)}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                URL.revokeObjectURL(selectedFile.previewUrl!);
                                setSelectedFile(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                            <File className="h-5 w-5 text-blue-500" />
                            <span className="text-sm">{selectedFile.file.name}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedFile(null);
                              }}
                              className="ml-auto text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-row-reverse bg-gray-50 dark:bg-[#232B3E] rounded-xl px-3 py-2 gap-2">
                      {/* Left: Send button only */}
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-700 hover:bg-blue-800 text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50 ml-auto"
                        disabled={!newMessage.trim() && !selectedFile}
                        aria-label="إرسال الرسالة"
                      >
                        <Send className="h-4 w-4" />
                      </button>
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
                      {/* File upload button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full w-9 h-9 flex items-center justify-center"
                        aria-label="إرفاق ملف"
                      >
                        <Paperclip className="h-5 w-5" />
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
  );
};

export default Chat;


