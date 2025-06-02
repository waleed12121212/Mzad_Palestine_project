import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share2, MapPin, Calendar, Package, X, AlertTriangle, Edit, Trash2, ChevronLeft, ChevronRight, Flag, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { serviceService } from "@/services/serviceService";
import { wishlistService } from "@/services/wishlistService";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserProfile } from "@/services/userService";
import ReportDialog from '@/components/ReportDialog';

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);

  const serviceId = id ? parseInt(id) : 0;

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;
      
      setIsLoading(true);
      try {
        const data = await serviceService.getServiceById(serviceId);
        setService(data);
        
        // Check if service is in user's wishlist
        if (isAuthenticated) {
          const wishlistStatus = await wishlistService.isInWishlist(serviceId);
          setIsInWishlist(wishlistStatus);
        }
      } catch (error) {
        console.error('Error fetching service details:', error);
        toast({
          title: 'فشل في تحميل بيانات الخدمة',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, isAuthenticated]);

  useEffect(() => {
    if (service && service.userId) {
      setOwnerLoading(true);
      userService.getUserById(service.userId.toString())
        .then(res => setOwner(res.data))
        .catch(() => setOwner(null))
        .finally(() => setOwnerLoading(false));
    }
  }, [service?.userId]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'يرجى تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await wishlistService.removeListingFromWishlist(serviceId);
        setIsInWishlist(false);
      } else {
        await wishlistService.addListingToWishlist(serviceId);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShareService = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.title || 'مشاركة خدمة',
        text: service?.description || 'تفاصيل الخدمة',
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'تم نسخ الرابط',
        description: 'يمكنك مشاركة الرابط مع الآخرين',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    try {
      if (!service) return;
      
      await serviceService.deleteService(service.id);
      toast({
        title: "تم حذف الخدمة بنجاح",
        description: "تم حذف الخدمة والصور المرتبطة بها"
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "فشل حذف الخدمة",
        description: error.message || "حدث خطأ أثناء حذف الخدمة",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
  return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loader"></div>
        <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الخدمة...</p>
          </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 text-yellow-500 dark:text-yellow-400">
            <AlertTriangle className="h-24 w-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4">لم يتم العثور على الخدمة</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || "عذراً، لم نتمكن من العثور على الخدمة المطلوبة. قد تكون الخدمة غير متوفرة أو تم حذفها."}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            معرف الخدمة: {`${id}`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/services')} className="w-full sm:w-auto">
              استعراض الخدمات
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full sm:w-auto"
            >
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 rtl justify-start" style={{direction: 'rtl'}}>
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">الرئيسية</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 dark:text-gray-100">الخدمات</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 dark:text-gray-100">{service.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content - images and details */}
        <div className="md:col-span-2">
          {/* Image Modal */}
          {isImageModalOpen && selectedImage && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
              <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center p-4">
                <button 
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40"
                  onClick={() => setIsImageModalOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
                <img 
                  src={selectedImage} 
                  alt="صورة مكبرة" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          )}

          {/* Delete confirmation dialog */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">تأكيد حذف الخدمة</h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    حذف الخدمة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image gallery (main image + thumbnails) */}
          <div className="mb-6 rounded-lg overflow-hidden">
            {service.images && service.images.length > 0 ? (
              <>
                {/* Main Image with navigation arrows */}
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  {/* أزرار التعديل والحذف داخل الصورة */}
                  {user && service && String(user.id) === String(service.userId) && (
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/services/edit/${service.id}`);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-blue-50 text-blue-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
                        title="تعديل الخدمة"
                      >
                        <Edit className="h-5 w-5" />
                        <span className="hidden sm:inline">تعديل</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowDeleteDialog(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
                        title="حذف الخدمة"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="hidden sm:inline">حذف</span>
                      </button>
                    </div>
                  )}
                  <img
                    src={service.images[activeImageIdx] || '/placeholder.svg'}
                    alt={`${service.title} - صورة ${activeImageIdx + 1}`}
                    className="w-full h-96 object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedImage(service.images[activeImageIdx]);
                      setIsImageModalOpen(true);
                    }}
                    onError={e => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIdx((prev) => (prev - 1 + service.images.length) % service.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                        type="button"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setActiveImageIdx((prev) => (prev + 1) % service.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                        type="button"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
                {/* Thumbnails Row */}
                {service.images.length > 1 && (
                  <div className="flex gap-2 w-full mt-2">
                    {service.images.map((img, idx) => (
                      <img
                        key={img + idx}
                        src={img || '/placeholder.svg'}
                        alt={`Thumbnail ${idx + 1}`}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-16 object-cover rounded-lg cursor-pointer border-2 flex-1 ${activeImageIdx === idx ? 'border-blue-500' : 'border-transparent'}`}
                        style={{ boxSizing: 'border-box' }}
                        onError={e => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Package className="h-12 w-12 text-gray-400" />
                <span className="text-gray-400">لا توجد صور متاحة</span>
              </div>
            )}
          </div>

          {/* Service Details */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {service.title}
                    {String(user?.id) === String(service.userId) && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/services/edit/${service.id}`)}
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShareService}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">وصف الخدمة</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{service.description}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">السعر</div>
                  <div className="text-xl font-bold text-blue-600">{service.price} ₪</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">معلومات التواصل</div>
                  <div className="text-lg font-medium">{service.contactInfo}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                {owner?.profilePicture ? (
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={owner.profilePicture} />
                    <AvatarFallback>{owner.firstName?.[0]}{owner.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarFallback>{owner?.firstName?.[0]}{owner?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                <h3 className="text-xl font-bold mb-1">{owner?.firstName} {owner?.lastName}</h3>
                <p className="text-gray-500 text-sm mb-4">{owner?.email}</p>
              </div>

              <div className="space-y-4">
          <Link
            to={`/chat?user=${owner?.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 font-bold shadow transition"
          >
            <MessageCircle className="w-5 h-5" />
            تواصل مع صاحب الخدمة
          </Link>

        </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 