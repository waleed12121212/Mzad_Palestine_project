
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Wallet, Truck, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CheckoutProps {}

const Checkout: React.FC<CheckoutProps> = () => {
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // محاكاة إرسال الطلب
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("تم تقديم الطلب بنجاح!");
      // يمكن إضافة التوجيه إلى صفحة التأكيد هنا
    }, 2000);
  };

  const cartItems = [
    {
      id: 1,
      name: "مزهرية خزفية تقليدية",
      price: 250,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=1000",
    },
    {
      id: 2,
      name: "وشاح مطرز يدوياً",
      price: 120,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?q=80&w=1000",
    },
  ];

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 30;
    const tax = subtotal * 0.15;
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total,
    };
  };

  const { subtotal, shipping, tax, total } = calculateTotal();

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
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                    <CreditCard className="ml-2 h-5 w-5 text-blue" />
                    بطاقة ائتمانية
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                    <Wallet className="ml-2 h-5 w-5 text-blue" />
                    محفظة إلكترونية
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center cursor-pointer">
                    <Truck className="ml-2 h-5 w-5 text-blue" />
                    الدفع عند الاستلام
                  </Label>
                </div>
              </RadioGroup>
              
              {paymentMethod === "credit_card" && (
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
          </form>
        </div>
        
        {/* ملخص الطلب */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 sticky top-24 rtl">
            <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 space-x-reverse">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {item.price} ش.ج
                    </p>
                  </div>
                  <span className="font-semibold">{item.price * item.quantity} ش.ج</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span>{subtotal} ش.ج</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رسوم الشحن</span>
                <span>{shipping} ش.ج</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الضريبة (15%)</span>
                <span>{tax.toFixed(2)} ش.ج</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>الإجمالي</span>
              <span>{total.toFixed(2)} ش.ج</span>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md mb-6 flex items-start space-x-3 space-x-reverse">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                سيتم تأكيد طلبك بعد التحقق من دفعتك. سيتم إرسال تفاصيل التأكيد عبر البريد الإلكتروني.
              </p>
            </div>
            
            <Button 
              className="w-full bg-blue hover:bg-blue-600 text-white"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري المعالجة...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="ml-2 h-5 w-5" />
                  إتمام الطلب
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
