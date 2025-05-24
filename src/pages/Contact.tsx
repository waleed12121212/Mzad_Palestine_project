import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import supportService from '@/services/supportService';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supportService.createTicket({
        subject: formData.subject,
        description: formData.message
      });
      toast.success("تم إرسال تذكرتك للدعم الفني بنجاح! سنرد عليك قريباً.");
      setFormData({ subject: "", message: "" });
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال التذكرة. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-l from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-10 rounded-2xl shadow-lg rtl animate-fade-in">
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-right">
          <HelpCircle className="h-20 w-20 text-blue-700 dark:text-blue-300 mb-4 animate-bounce-slow" />
          <h1 className="text-3xl font-extrabold mb-4 text-blue-900 dark:text-blue-100">الدعم الفني</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-md text-lg mb-4">
            نحن هنا لمساعدتك في أي استفسار أو مشكلة تواجهها. أرسل تذكرتك وسيتم الرد عليك من فريق الدعم.
          </p>
        </div>
        <div className="flex-1 w-full max-w-lg bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">أرسل تذكرة دعم</h2>
          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
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
              <Label htmlFor="message">وصف المشكلة أو الاستفسار</Label>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-lg px-8 py-3 rounded-xl shadow-md"
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
                  إرسال التذكرة
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* قسم الأسئلة الشائعة المصغر */}
      <div className="mt-20 rtl">
        <h2 className="text-2xl font-bold mb-8 text-center">الأسئلة الشائعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">لماذا لم أستلم رسالة التفعيل على بريدي الإلكتروني؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              تحقق من مجلد الرسائل غير المرغوب فيها (Spam). إذا لم تجد الرسالة، يمكنك طلب إعادة إرسالها من صفحة تسجيل الدخول أو التواصل مع الدعم الفني.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">كيف أتابع حالة تذكرة الدعم الخاصة بي؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              يمكنك متابعة حالة تذكرتك من خلال صفحة "تذاكري" في حسابك، أو ستصلك إشعارات عبر البريد الإلكتروني عند تحديث الحالة.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">ما هي المدة المتوقعة للرد على تذكرة الدعم؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              عادةً يتم الرد خلال 24 ساعة في أيام العمل الرسمية. أحياناً قد يستغرق الأمر وقتاً أطول في أوقات الذروة.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3">كيف أرفق صور أو ملفات مع تذكرة الدعم؟</h3>
            <p className="text-gray-600 dark:text-gray-400">
              بعد إنشاء التذكرة يمكنك الرد عليها وإرفاق الملفات المطلوبة من خلال صفحة التذاكر في حسابك.
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
