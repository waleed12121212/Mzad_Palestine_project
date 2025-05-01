
import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Clock, Award, Tag, AlertCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";

type NotificationType = "bid" | "win" | "outbid" | "ending" | "system";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: NotificationType;
  link?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      // Sample notifications data
      const sampleNotifications: Notification[] = [
        {
          id: "1",
          title: "تهانينا! لقد فزت بالمزاد",
          message: "لقد فزت بالمزاد على سيارة مرسيدس E200 موديل 2019. يرجى إتمام عملية الدفع في غضون 24 ساعة.",
          time: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          type: "win",
          link: "/auction/2",
        },
        {
          id: "2",
          title: "تمت المزايدة على عنصر من قبل مستخدم آخر",
          message: "تمت مزايدة أعلى من مزايدتك على iPhone 13 Pro Max. الآن السعر الحالي هو 3300 ₪.",
          time: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: false,
          type: "outbid",
          link: "/auction/3",
        },
        {
          id: "3",
          title: "مزاد ينتهي قريباً",
          message: "المزاد على طاولة طعام خشب زان سينتهي خلال ساعة واحدة. تأكد من وضع مزايدتك الأخيرة.",
          time: new Date(Date.now() - 1000 * 60 * 60 * 5),
          read: true,
          type: "ending",
          link: "/auction/8",
        },
        {
          id: "4",
          title: "مزايدة ناجحة",
          message: "لقد قمت بالمزايدة بنجاح على قطعة أرض في بيت لحم. المزايدة الحالية هي 90,000 ₪.",
          time: new Date(Date.now() - 1000 * 60 * 60 * 24),
          read: true,
          type: "bid",
          link: "/auction/6",
        },
        {
          id: "5",
          title: "تحديث سياسة الخصوصية",
          message: "لقد قمنا بتحديث سياسة الخصوصية وشروط الاستخدام. يرجى مراجعتها في أقرب وقت ممكن.",
          time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          read: true,
          type: "system",
        },
      ];
      
      setNotifications(sampleNotifications);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(notification => notification.type === filter);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "win":
        return <Award className="h-5 w-5 text-green" />;
      case "outbid":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "ending":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "bid":
        return <Tag className="h-5 w-5 text-blue" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 rtl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="heading-lg">الإشعارات</h1>
          </div>
          
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-blue hover:text-blue-light transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span>تعليم الكل كمقروء</span>
            </button>
          )}
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
                onClick={() => setFilter("win")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "win" 
                    ? "bg-green text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                فوز بمزاد
              </button>
              <button 
                onClick={() => setFilter("outbid")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "outbid" 
                    ? "bg-red-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                تم تجاوز مزايدتك
              </button>
              <button 
                onClick={() => setFilter("ending")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "ending" 
                    ? "bg-orange-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                مزادات تنتهي قريباً
              </button>
              <button 
                onClick={() => setFilter("bid")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "bid" 
                    ? "bg-blue text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                مزايدات ناجحة
              </button>
              <button 
                onClick={() => setFilter("system")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                  filter === "system" 
                    ? "bg-gray-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                )}
              >
                إشعارات النظام
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-start gap-4 p-4 rounded-lg rtl">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div>
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 rtl transition-colors hover:bg-gray-50 dark:hover:bg-gray-750",
                    !notification.read && "bg-blue/5 dark:bg-blue-dark/10"
                  )}
                >
                  <div 
                    className="flex items-start gap-4 cursor-pointer" 
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={cn(
                          "text-lg",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(notification.time).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.time).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        
                        {notification.link && (
                          <span className="text-blue text-sm flex items-center gap-1 hover:underline">
                            فتح 
                            <ArrowUpRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-500 dark:text-gray-400">
                ستظهر هنا الإشعارات المتعلقة بمزايداتك ونشاطاتك على المنصة
              </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Notifications;
