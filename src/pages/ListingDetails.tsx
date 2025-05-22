import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BuyNowButton } from '@/components/listing/BuyNowButton';
import { Heart, Share2, MapPin, Calendar, Package, X, AlertTriangle, Edit, Trash2, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { listingService, Listing } from '@/services/listingService';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/contexts/AuthContext';
import { ListingContactSellerDialog } from '@/components/listing/ListingContactSellerDialog';
import ReviewForm from '@/components/ReviewForm';
import ListingReviews from '@/components/ListingReviews';
import { userService, UserProfile } from '@/services/userService';

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
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
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const listingId = id ? parseInt(id) : 0;

  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!listingId) return;
      
      setIsLoading(true);
      try {
        const data = await listingService.getListingById(listingId);
        setListing(data);
        
        // Check if listing is in user's wishlist
        if (isAuthenticated) {
          const wishlistStatus = await wishlistService.isInWishlist(listingId);
          setIsInWishlist(wishlistStatus);
        }
      } catch (error) {
        console.error('Error fetching listing details:', error);
        toast({
          title: 'فشل في تحميل بيانات المنتج',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingDetails();
  }, [listingId, isAuthenticated]);

  useEffect(() => {
    if (listing && listing.userId) {
      setSellerLoading(true);
      userService.getUserById(listing.userId.toString())
        .then(res => setSeller(res.data))
        .catch(() => setSeller(null))
        .finally(() => setSellerLoading(false));
    }
  }, [listing?.userId]);

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
        await wishlistService.removeListingFromWishlist(listingId);
        setIsInWishlist(false);
      } else {
        await wishlistService.addListingToWishlist(listingId);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShareListing = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title || 'مشاركة منتج',
        text: listing?.description || 'تفاصيل المنتج',
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
      if (!listing) return;
      
      await listingService.deleteListing(listing.listingId);
      toast({
        title: "تم حذف المنتج بنجاح",
        description: "تم حذف المنتج والصور المرتبطة به"
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "فشل حذف المنتج",
        description: error.message || "حدث خطأ أثناء حذف المنتج",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">جاري تحميل تفاصيل المنتج...</p>
        </div>
    );
  }

  if (error || !listing) {
    return (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6 text-yellow-500 dark:text-yellow-400">
              <AlertTriangle className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4">لم يتم العثور على المنتج</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || "عذراً، لم نتمكن من العثور على المنتج المطلوب. قد يكون المنتج غير متوفر أو تم حذفه."}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              معرف المنتج: {`${id}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/buy-now')} className="w-full sm:w-auto">
                استعراض المنتجات
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
            <span className="text-gray-900 dark:text-gray-100">{listing.categoryName}</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 dark:text-gray-100">{listing.title}</span>
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
                  <h3 className="text-xl font-bold mb-4">تأكيد حذف المنتج</h3>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
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
                      حذف المنتج
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Image gallery (main image + thumbnails) */}
            <div className="mb-6 rounded-lg overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <>
                  {/* Main Image with navigation arrows */}
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    {/* أزرار التعديل والحذف داخل الصورة */}
                    {user && listing && user.id === listing.userId && (
                      <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/listing/${listing.listingId}/edit`);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-blue-50 text-blue-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
                          title="تعديل المنتج"
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
                          title="حذف المنتج"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="hidden sm:inline">حذف</span>
                        </button>
                      </div>
                    )}
                    <img
                      src={listing.images[activeImageIdx] || '/placeholder.svg'}
                      alt={`${listing.title} - صورة ${activeImageIdx + 1}`}
                      className="w-full h-96 object-cover cursor-pointer"
                      onClick={() => {
                        setSelectedImage(listing.images[activeImageIdx]);
                        setIsImageModalOpen(true);
                      }}
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIdx((prev) => (prev - 1 + listing.images.length) % listing.images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                          type="button"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setActiveImageIdx((prev) => (prev + 1) % listing.images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                          type="button"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails Row */}
                  {listing.images.length > 1 && (
                    <div className="flex gap-2 w-full mt-2">
                      {listing.images.map((img, idx) => (
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

            {/* Product details */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{listing.title}</h1>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">الوصف</h3>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
              </div>

              {/* استبدال Badge ببطاقة الفئة */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-white dark:bg-gray-100/10 rounded-xl p-6 text-center shadow border font-bold">
                  <div className="text-gray-500 mb-2">الفئة</div>
                  <div className="text-xl">{listing.categoryName}</div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-100/10 rounded-xl p-6 text-center shadow border font-bold">
                  <div className="text-gray-500 mb-2">الموقع</div>
                  <div className="text-xl">{listing.address}</div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-100/10 rounded-xl p-6 text-center shadow border font-bold">
                  <div className="text-gray-500 mb-2">السعر</div>
                  <div className="text-xl text-blue-600">{listing.price.toLocaleString('en-US')} ₪</div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-100/10 rounded-xl p-6 text-center shadow border font-bold">
                  <div className="text-gray-500 mb-2">متاح حتى</div>
                  <div className="text-xl ">{new Date(listing.endDate).toLocaleDateString('en-US')}</div>
                </div>
              </div>
              

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-12">
                <h2 className="text-2xl font-bold mb-6">التقييمات والمراجعات</h2>
                {user && listing && user.id !== listing.userId && (
                  <div className="mb-8">
                    <ReviewForm
                      listingId={String(listing.listingId)}
                      onReviewSubmitted={() => {
                        // يمكن تحديث التقييمات هنا إذا رغبت
                      }}
                    />
                  </div>
                )}
                <ListingReviews listingId={String(listing.listingId)} />
              </div>
            </div>
          </div>

          {/* Sidebar - seller info and actions */}
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Link to={`/seller/${listing.userId}`} className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group" tabIndex={0}>
                    {sellerLoading ? (
                      <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
                    ) : seller && seller.profilePicture ? (
                      <img
                        src={seller.profilePicture.startsWith('http') ? seller.profilePicture : `http://mazadpalestine.runasp.net${seller.profilePicture}`}
                        alt={seller.username}
                        className="w-full h-full object-cover group-hover:opacity-80 transition"
                        onError={e => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                          (e.target as HTMLImageElement).onerror = () => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerHTML = seller.username?.charAt(0)?.toUpperCase() || 'U';
                            }
                          };
                        }}
                      />
                    ) : seller ? (
                      <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                        {seller.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    ) : (
                      <span className="text-xl font-bold text-gray-400">?</span>
                    )}
                  </Link>
                  <div className="ml-3 rtl:mr-3">
                    <Link to={`/seller/${listing.userId}`} className="font-semibold text-gray-900 dark:text-white hover:no-underline focus:outline-none">
                      {seller ? seller.username : listing.userName}
                    </Link>
                    <p className="text-sm text-gray-500">البائع</p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <BuyNowButton
                    listingId={listing.listingId}
                    price={listing.price}
                    title={listing.title}
                  />
                  
                  <ListingContactSellerDialog 
                    sellerId={listing.userId}
                    productName={listing.title} 
                    productImage={listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder.svg'} 
                    productPrice={listing.price}
                  />
                  {/* أزرار المفضلة والمشاركة والإبلاغ */}
                  <div className="flex gap-2 mt-4 justify-center">
                    <button
                      onClick={handleToggleWishlist}
                      disabled={isAddingToWishlist}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isInWishlist ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>المفضلة</span>
                    </button>
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center gap-2 justify-center"
                      onClick={handleShareListing}
                    >
                      <Share2 className="h-5 w-5" />
                      <span>مشاركة</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center gap-2 justify-center"
                      // يمكنك إضافة منطق الإبلاغ لاحقاً
                    >
                      <Flag className="h-5 w-5" />
                      <span>إبلاغ</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* بطاقة نصائح للشراء الآمن */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-blue-700">نصائح للشراء الآمن</h3>
                <ul className="list-disc pr-4 text-gray-700 space-y-2 text-sm rtl text-right">
                  <li>تأكد من فحص المنتج جيداً قبل الدفع.</li>
                  <li>لا ترسل أي دفعات أو بيانات حساسة قبل التأكد من البائع.</li>
                  <li>يفضل إتمام المعاملة في مكان عام وآمن.</li>
                  <li>استخدم وسائل دفع موثوقة.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
} 