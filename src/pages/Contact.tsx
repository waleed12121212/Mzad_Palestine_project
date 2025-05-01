
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { toast } from "sonner";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // محاكاة إرسال النموذج
    setTimeout(() => {
      toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16 rtl">
        <h1 className="text-4xl font-bold mb-4">اتصل بنا</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت. تواصل معنا بالطريقة التي تناسبك.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 rtl">
        {/* معلومات الاتصال والخريطة */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-blue/10 w-fit mb-4">
                <MapPin className="h-6 w-6 text-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">عنواننا</h3>
              <p className="text-gray-600 dark:text-gray-400">
                شارع القدس، مبنى الإنماء، الطابق الثالث
                <br />
                رام الله، فلسطين
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-blue/10 w-fit mb-4">
                <Phone className="h-6 w-6 text-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">هاتف</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                +970 59 123 4567
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                +970 2 295 6789
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-blue/10 w-fit mb-4">
                <Mail className="h-6 w-6 text-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">البريد الإلكتروني</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                info@mzadpalestine.ps
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                support@mzadpalestine.ps
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-blue/10 w-fit mb-4">
                <Clock className="h-6 w-6 text-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ساعات العمل</h3>
              <p className="text-gray-600 dark:text-gray-400">
                الأحد - الخميس: 9:00 ص - 5:00 م
                <br />
                الجمعة - السبت: مغلق
              </p>
            </div>
          </div>

          {/* خريطة */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27104.699301186794!2d35.19973641937586!3d31.903302347481575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502d7d634c1fc4b%3A0xf8e0220d57fc32ec!2z2LHYp9mFINin2YTZhNmH!5e0!3m2!1sar!2s!4v1721148023781!5m2!1sar!2s"
                className="w-full h-full rounded-md"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* نموذج الاتصال */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="rtl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="rtl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="rtl"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue hover:bg-blue-600 text-white flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري الإرسال...
                </span>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  إرسال الرسالة
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* قسم الأسئلة الشائعة المصغر */}
      <div className="mt-20 rtl">
        <h2 className="text-2xl font-bold mb-8 text-center">أسئلة شائعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">كيف يمكنني التسجيل في المنصة؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              يمكنك التسجيل بسهولة من خلال النقر على زر "تسجيل" في الصفحة الرئيسية وإدخال بياناتك الشخصية المطلوبة وتفعيل حسابك عبر البريد الإلكتروني.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">ما هي رسوم استخدام المنصة؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              التسجيل والمشاركة في المزادات مجانية. يتم خصم عمولة بنسبة 5% فقط في حال إتمام البيع بنجاح. لا توجد أي رسوم مخفية.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">كيف يمكنني المزايدة على منتج؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              بعد التسجيل وتسجيل الدخول، انتقل إلى صفحة المزاد الذي ترغب بالمشاركة فيه، وأدخل قيمة عرضك بما يزيد عن الحد الأدنى للمزايدة.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">ما هي طرق الدفع المتاحة؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              نوفر طرق دفع متنوعة تشمل بطاقات الائتمان، والمحافظ الإلكترونية، والتحويل البنكي، والدفع عند الاستلام في بعض المناطق.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Button className="bg-transparent text-blue hover:bg-blue/5 border border-blue">
            عرض جميع الأسئلة الشائعة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
