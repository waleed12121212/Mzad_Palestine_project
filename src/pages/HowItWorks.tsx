import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  SearchCheck, 
  Gavel, 
  Bell, 
  CreditCard, 
  Check, 
  Package, 
  HelpCircle, 
  ArrowRight 
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const HowItWorks: React.FC = () => {
  return (
      <div className="container mx-auto px-4 py-12">
        {/* قسم البانر الرئيسي */}
        <div className="text-center mb-16 rtl">
          <h1 className="text-4xl font-bold mb-6">كيف تعمل منصة مزاد فلسطين؟</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            منصة سهلة الاستخدام تمكنك من المشاركة في المزادات أو شراء المنتجات مباشرة بخطوات بسيطة وآمنة.
          </p>
        </div>

        {/* قسم خطوات المزايدة */}
        <div className="mb-20 rtl">
          <h2 className="text-3xl font-bold mb-12 text-center">خطوات المشاركة في المزادات</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              icon={<SearchCheck className="text-blue" />}
              number={1}
              title="ابحث عن المزادات"
              description="تصفح المزادات النشطة واختر المزاد الذي يناسبك بناءً على اهتماماتك وميزانيتك."
            />
            <StepCard 
              icon={<Gavel className="text-blue" />}
              number={2}
              title="قدم عرضك"
              description="قدم عرضًا أعلى من السعر الحالي بما لا يقل عن قيمة الحد الأدنى للمزايدة."
            />
            <StepCard 
              icon={<Bell className="text-blue" />}
              number={3}
              title="تابع المزاد"
              description="تابع حالة المزاد وتلقى إشعارات عندما يتم تقديم عروض جديدة أو عند اقتراب موعد إغلاق المزاد."
            />
            <StepCard 
              icon={<CreditCard className="text-blue" />}
              number={4}
              title="ادفع واستلم"
              description="إذا فزت بالمزاد، ستتلقى إشعارًا للدفع واستكمال عملية الشراء خلال 48 ساعة."
            />
          </div>
        </div>

        {/* قسم خطوات الشراء الفوري */}
        <div className="mb-20 rtl bg-gray-50 dark:bg-gray-900 p-12 rounded-xl">
          <h2 className="text-3xl font-bold mb-12 text-center">خطوات الشراء الفوري</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              icon={<Check className="text-green" />}
              number={1}
              title="اختر المنتج"
              description="تصفح منتجات الشراء الفوري واختر ما تريد شراءه مباشرة دون انتظار نهاية المزاد."
              variant="light"
            />
            <StepCard 
              icon={<CreditCard className="text-green" />}
              number={2}
              title="أتمم عملية الشراء"
              description="أضف المنتج إلى سلة التسوق وأكمل عملية الدفع بطريقة آمنة ومضمونة."
              variant="light"
            />
            <StepCard 
              icon={<Package className="text-green" />}
              number={3}
              title="استلم مشترياتك"
              description="سيتم شحن مشترياتك في أسرع وقت ممكن، ويمكنك تتبع الشحنة حتى تصل إليك."
              variant="light"
            />
          </div>

          <div className="text-center mt-10">
            <Button asChild className="bg-green hover:bg-green/90">
              <Link to="/buy-now">تصفح منتجات الشراء الفوري</Link>
            </Button>
          </div>
        </div>

        {/* قسم الأسئلة الشائعة */}
        <div className="mb-16 rtl">
          <h2 className="text-3xl font-bold mb-8 text-center">الأسئلة الشائعة</h2>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>كيف أسجل حساب في مزاد فلسطين؟</AccordionTrigger>
                <AccordionContent>
                  يمكنك التسجيل بسهولة من خلال النقر على زر "تسجيل" في أعلى الصفحة، ثم إدخال بياناتك الشخصية ومعلومات الاتصال، وتأكيد البريد الإلكتروني لتفعيل حسابك.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>ما هي طرق الدفع المتاحة؟</AccordionTrigger>
                <AccordionContent>
                  نوفر مجموعة متنوعة من طرق الدفع بما في ذلك بطاقات الائتمان (فيزا، ماستركارد)، البطاقات المدفوعة مسبقًا، المحافظ الإلكترونية، وخدمات الدفع عند الاستلام للبعض المنتجات.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>هل يمكنني إرجاع المنتج إذا لم يعجبني؟</AccordionTrigger>
                <AccordionContent>
                  نعم، نوفر سياسة إرجاع مرنة تتيح لك إرجاع المنتج خلال 14 يومًا من تاريخ الاستلام إذا كان بحالته الأصلية ولم يتم استخدامه. يرجى مراجعة سياسة الإرجاع الكاملة للحصول على التفاصيل.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>ما هي مدة الشحن المتوقعة؟</AccordionTrigger>
                <AccordionContent>
                  تعتمد مدة الشحن على موقعك والمنتج الذي اشتريته. بشكل عام، يتم شحن المنتجات داخل فلسطين خلال 2-5 أيام عمل، بينما قد تستغرق الشحنات الدولية 7-14 يوم عمل.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>كيف يمكنني بيع منتجاتي على المنصة؟</AccordionTrigger>
                <AccordionContent>
                  يمكنك التسجيل كبائع من خلال حسابك، وإكمال عملية التحقق، ثم إضافة منتجاتك مع الصور والتفاصيل. يمكنك اختيار بيعها بنظام المزاد أو بسعر ثابت للشراء الفوري.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/faq" className="inline-flex items-center text-blue hover:underline">
              عرض المزيد من الأسئلة الشائعة
              <ArrowRight className="h-4 w-4 mr-2" />
            </Link>
          </div>
        </div>

        {/* قسم الدعم */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-l from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-10 rounded-2xl shadow-lg mt-16 rtl animate-fade-in">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-right">
            <HelpCircle className="h-20 w-20 text-blue-700 dark:text-blue-300 mb-4 animate-bounce-slow" />
            <p className="text-gray-600 dark:text-gray-300 max-w-md text-lg">
              فريق خدمة العملاء لدينا متاح لمساعدتك في أي استفسارات أو مشاكل قد تواجهها.
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right">
            <h2 className="text-3xl font-extrabold mb-4 text-blue-900 dark:text-blue-100">هل تحتاج إلى مساعدة إضافية؟</h2>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 rounded-xl shadow-md">
              <Link to="/contact">تواصل مع الدعم الفني</Link>
            </Button>
          </div>
        </div>
      </div>
  );
};

interface StepCardProps {
  icon: React.ReactNode;
  number: number;
  title: string;
  description: string;
  variant?: "default" | "light";
}

const StepCard: React.FC<StepCardProps> = ({ 
  icon, 
  number, 
  title, 
  description,
  variant = "default" 
}) => {
  return (
    <div className={`
      relative group bg-gradient-to-br ${variant === "light" ? "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800" : "from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800"} rounded-2xl p-8 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center min-h-[320px]`}
    >
      <div className={`absolute -top-7 right-7 w-14 h-14 flex items-center justify-center rounded-full shadow-lg border-4 border-white dark:border-gray-900 text-2xl font-bold z-10 ${variant === "light" ? "bg-gradient-to-tr from-green-400 to-green-600 text-white" : "bg-gradient-to-tr from-blue-400 to-blue-600 text-white"}`}>
        {number}
      </div>
      <div className="mb-4 mt-6">
        <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg text-3xl ${variant === "light" ? "bg-white dark:bg-gray-800 text-green-600" : "bg-white dark:bg-gray-800 text-blue-600"}`}>
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-200">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-center">{description}</p>
    </div>
  );
};

export default HowItWorks;
