import React, { useState, useEffect } from "react";
import { BellRing, CheckCheck, Clock, Award, Tag, AlertCircle, ArrowUpRight, Trash2, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationService, NotificationType, Notification } from "@/services/notificationService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAllNotifications();
      console.log('Notifications response:', response);
      setNotifications(response);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };
    
  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        setNotifications(notifications.map(notification => ({
          ...notification,
          status: "Read"
        })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const success = await notificationService.markAsRead(id);
      if (success) {
        setNotifications(notifications.map(notification => 
          notification.id === id ? { ...notification, status: "Read" } : notification
        ));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const success = await notificationService.deleteNotification(id);
      if (success) {
        setNotifications(notifications.filter(notification => notification.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      try {
        const success = await notificationService.clearAllNotifications();
        if (success) {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Failed to clear all notifications:', error);
      }
    }
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(notification => notification.type === filter);

  // ترتيب الإشعارات من الأحدث إلى الأقدم
  const sortedFilteredNotifications = [...filteredNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "AuctionWon":
        return <Award className="h-5 w-5 text-green-500" />;
      case "BidOutbid":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "AuctionEnded":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "BidPlaced":
        return <Tag className="h-5 w-5 text-blue-500" />;
      case "AuctionCancelled":
        return <BellRing className="h-5 w-5 text-red-500" />;
      case "MassageReceived":
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case "General":
        return <BellRing className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <BellRing className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    switch (notification.type) {
      case "MassageReceived":
        navigate(`/messages/${notification.relatedId}`);
        break;
      case "AuctionWon":
      case "BidOutbid":
      case "AuctionEnded":
      case "BidPlaced":
      case "AuctionCancelled":
        navigate(`/auctions/${notification.relatedId}`);
        break;
      case "General":
        if (notification.message.includes("فزت بالمزاد")) {
          navigate(`/auctions/won`);
        }
        break;
      default:
        // General or unknown notification: do nothing
        break;
    }
  };

  const NotificationItem = ({ notification, onClick }: { notification: Notification, onClick: () => void }) => {
    const getNotificationContent = (type: NotificationType) => {
      switch (type) {
        case 'AuctionWon':
          return {
            icon: <Award className="h-5 w-5 text-green-500" />,
            bgColor: 'bg-green-500/10',
            title: 'تهانينا! لقد فزت بالمزاد'
          };
        case 'BidOutbid':
          return {
            icon: <AlertCircle className="h-5 w-5 text-red-500" />,
            bgColor: 'bg-red-500/10',
            title: 'تم تجاوز مزايدتك'
          };
        case 'AuctionEnded':
          return {
            icon: <Clock className="h-5 w-5 text-orange-500" />,
            bgColor: 'bg-orange-500/10',
            title: 'المزاد انتهى'
          };
        case 'BidPlaced':
          return {
            icon: <Tag className="h-5 w-5 text-blue-500" />,
            bgColor: 'bg-blue-500/10',
            title: 'تمت مزايدة جديدة'
          };
        case 'MassageReceived':
          return {
            icon: <MessageCircle className="h-5 w-5 text-purple-500" />,
            bgColor: 'bg-purple-500/10',
            title: 'رسالة جديدة'
          };
        case 'AuctionCancelled':
          return {
            icon: <BellRing className="h-5 w-5 text-red-500" />,
            bgColor: 'bg-red-500/10',
            title: 'تم إلغاء المزاد'
          };
        default:
          return {
            icon: <BellRing className="h-5 w-5 text-gray-500" />,
            bgColor: 'bg-gray-500/10',
            title: 'إشعار'
          };
      }
    };

    const content = getNotificationContent(notification.type);
    // لون خلفية مختلف لغير المقروءة
    const unreadBg = notification.status === "Read" ? "bg-white dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900/30";

    // عند الضغط: markAsRead ثم onClick
    const handleClick = () => {
      if (notification.status !== "Read") {
        markAsRead(notification.id);
      }
      onClick();
    };

    return (
      <div
        className={`rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 rtl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${unreadBg}`}
        onClick={handleClick}
        tabIndex={0}
        role="button"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full ${content.bgColor} flex items-center justify-center`}>
              {content.icon}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {content.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="حذف الإشعار"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {notification.message}
            </p>
            <div className="text-xs text-gray-500">
              {notification.formattedDate || new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
      <div className="container mx-auto px-4 py-8 rtl">
        <div className="flex justify-between items-center mb-8 rtl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
              <BellRing className="w-5 h-5" />
            </div>
            <h1 className="heading-lg">الإشعارات</h1>
          </div>
          
          <div className="flex gap-4">
            {notifications.length > 0 && (
              <button 
                onClick={clearAllNotifications}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>حذف الكل</span>
              </button>
            )}
            
            {notifications.some(n => n.status !== "Read") && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 text-blue hover:text-blue-light transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                <span>تعليم الكل كمقروء</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700 p-4 rtl">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button 
                onClick={() => setFilter("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "all" 
                    ? "bg-blue text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                الكل
              </button>
              <button 
                onClick={() => setFilter("AuctionWon")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "AuctionWon" 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                فوز بمزاد
              </button>
              <button 
                onClick={() => setFilter("BidOutbid")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "BidOutbid" 
                    ? "bg-red-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                تم تجاوز مزايدتك
              </button>
              <button 
                onClick={() => setFilter("AuctionEnded")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "AuctionEnded" 
                    ? "bg-orange-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                مزادات منتهية
              </button>
              <button 
                onClick={() => setFilter("BidPlaced")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "BidPlaced" 
                    ? "bg-blue text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                مزايدات جديدة
              </button>
              <button 
                onClick={() => setFilter("MassageReceived")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "MassageReceived" 
                    ? "bg-purple-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                رسائل جديدة
              </button>
              <button 
                onClick={() => setFilter("General")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "General" 
                    ? "bg-gray-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                إشعارات عامة
              </button>
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start gap-4 p-4 rounded-lg rtl">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {sortedFilteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BellRing className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  ستظهر هنا الإشعارات المتعلقة بمزايداتك ونشاطاتك على المنصة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Notifications;
