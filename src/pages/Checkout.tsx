import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Wallet, Truck, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/services/paymentService";

interface CheckoutProps {}

const Checkout: React.FC<CheckoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<string>("CreditCard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  // Extract checkout data from location state
  useEffect(() => {
    if (location.state?.checkoutData) {
      setCheckoutData(location.state.checkoutData);
    } else {
      // If no checkout data, redirect to home
      toast.error("لا توجد بيانات للدفع");
      navigate("/");
    }
  }, [location.state, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkoutData) {
      toast.error("لا توجد بيانات للدفع");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create payment based on the type (listing or auction)
      if (checkoutData.type === 'listing') {
        await paymentService.createListingPayment({
          listingId: checkoutData.id,
          amount: checkoutData.amount,
          paymentMethod: paymentMethod,
          notes: `دفع للمنتج ${checkoutData.title}`
        });
      } else if (checkoutData.type === 'auction') {
        await paymentService.createAuctionPayment({
          auctionId: checkoutData.id,
          amount: checkoutData.amount,
          paymentMethod: paymentMethod,
          notes: `دفع للمزاد ${checkoutData.title}`
        });
      }
      
      toast.success("تم إتمام عملية الدفع بنجاح!");
      
      // Redirect based on type
      if (checkoutData.type === 'listing') {
        navigate("/my-listings");
      } else {
        navigate("/auctions/won");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsProcessing(false);
    }
  };

  // If no checkout data yet, show loading
  if (!checkoutData) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">إتمام الطلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج بيانات العميل وطرق الدفع */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8 rtl">
            {/* قسم بيانات العميل */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-4">بيانات العميل</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="rtl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rtl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="rtl"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* قسم العنوان */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-4">العنوان</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="address">العنوان التفصيلي</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 w-full rtl"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="rtl"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">الرمز البريدي</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="rtl"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* قسم طرق الدفع */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-4">طريقة الدفع</h2>
              
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="CreditCard" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                    <CreditCard className="ml-2 h-5 w-5 text-blue" />
                    بطاقة ائتمانية
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="PayPal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                    <Wallet className="ml-2 h-5 w-5 text-blue" />
                    محفظة إلكترونية
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="CashOnDelivery" id="cash" />
                  <Label htmlFor="cash" className="flex items-center cursor-pointer">
                    <Truck className="ml-2 h-5 w-5 text-blue" />
                    الدفع عند الاستلام
                  </Label>
                </div>
              </RadioGroup>
              
              {paymentMethod === "CreditCard" && (
                <div className="mt-6 space-y-6">
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">رقم البطاقة</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="rtl"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-2">
                      <Label htmlFor="cardHolder">اسم حامل البطاقة</Label>
                      <Input
                        id="cardHolder"
                        name="cardHolder"
                        value={formData.cardHolder}
                        onChange={handleInputChange}
                        className="rtl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                      <div className="flex items-center">
                        <Input
                          id="expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          className="rtl"
                        />
                        <Calendar className="h-4 w-4 text-gray-400 -mr-8" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">رمز الأمان (CVV)</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="password"
                        maxLength={4}
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="rtl"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" className="w-full md:w-auto" disabled={isProcessing}>
                {isProcessing ? "جاري معالجة الدفع..." : "إتمام الدفع"}
              </Button>
            </div>
          </form>
        </div>
        
        {/* ملخص الطلب */}
        <div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span>{checkoutData.type === 'listing' ? 'منتج' : 'مزاد'}</span>
                <span className="font-semibold">{checkoutData.title}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span>السعر</span>
                <span className="font-semibold">{checkoutData.amount.toLocaleString()} ₪</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span>الشحن</span>
                <span className="font-semibold">30 ₪</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span>الضريبة</span>
                <span className="font-semibold">{(checkoutData.amount * 0.15).toLocaleString()} ₪</span>
              </div>
              
              <div className="flex justify-between items-center py-3 text-lg font-bold">
                <span>الإجمالي</span>
                <span>{(checkoutData.amount + 30 + checkoutData.amount * 0.15).toLocaleString()} ₪</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
