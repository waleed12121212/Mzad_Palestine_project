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
        <div className="text-center bg-blue/5 dark:bg-blue/10 p-10 rounded-xl rtl">
          <HelpCircle className="h-16 w-16 mx-auto text-blue mb-4" />
          <h2 className="text-2xl font-bold mb-4">هل تحتاج إلى مساعدة إضافية؟</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            فريق خدمة العملاء لدينا متاح لمساعدتك في أي استفسارات أو مشاكل قد تواجهها.
          </p>
          <Button asChild>
            <Link to="/contact">تواصل معنا</Link>
          </Button>
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
      relative p-6 rounded-lg transition-all ${
        variant === "light" 
          ? "bg-white dark:bg-gray-800 shadow-sm hover:shadow" 
          : "border border-gray-200 dark:border-gray-800 hover:border-blue dark:hover:border-blue"
      }
    `}>
      <div className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center bg-blue/10 dark:bg-blue/20 rounded-full">
        <span className="text-blue font-medium">{number}</span>
      </div>
      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 inline-block mb-4">
        <div className="h-6 w-6">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export default HowItWorks;
