import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Award, Users, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const About = () => {
  const isMobile = useIsMobile();
  
  return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* القسم الرئيسي */}
        <div className="text-center mb-12 md:mb-16 rtl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">عن مزاد فلسطين</h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            منصة مزادات إلكترونية فلسطينية تهدف إلى ربط البائعين والمشترين في بيئة آمنة وشفافة، مع التركيز على دعم المنتجات والتراث الفلسطيني.
          </p>
        </div>

        {/* قسم القصة */}
        <div className="mb-12 md:mb-16 rtl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">قصتنا</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                بدأت قصة مزاد فلسطين في عام 2024، عندما اجتمعت مجموعة من طلاب علم الحاسوب بهدف إنشاء منصة تسهل على الفلسطينيين بيع وشراء السلع بطريقة عصرية وآمنة.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                ولدت الفكرة من خلال مشروع تخرج جامعي يهدف إلى تطوير منصة موثوقة تمزج بين التكنولوجيا الحديثة والقيم الفلسطينية الأصيلة، وتوفر فرصاً تجارية جديدة وتعزز الاقتصاد المحلي.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                استطاعت المنصة أن تنمو بشكل سريع لتصبح الوجهة الرئيسية للمزادات الإلكترونية في فلسطين، بفضل التفاني والجهود المستمرة من فريق طلابي متحمس ومبدع.
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhbXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="فريق مزاد فلسطين" 
                className="rounded-lg shadow-lg max-w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* قسم الرؤية والرسالة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16 rtl">
          <div className="bg-blue/5 dark:bg-blue/10 p-6 md:p-8 rounded-lg border border-blue/20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
              <Star className="text-blue mr-2 h-5 w-5 md:h-6 md:w-6" />
              رؤيتنا
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              نسعى لأن نكون المنصة الرائدة للمزادات الإلكترونية في المنطقة، ولتعزيز الاقتصاد الفلسطيني من خلال ربط البائعين والمشترين في بيئة رقمية آمنة ومتطورة، وتقديم تجربة مزايدة مميزة تعكس تراثنا وقيمنا.
            </p>
          </div>
          
          <div className="bg-green/5 dark:bg-green/10 p-6 md:p-8 rounded-lg border border-green/20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
              <Award className="text-green mr-2 h-5 w-5 md:h-6 md:w-6" />
              رسالتنا
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              توفير منصة مزادات إلكترونية متكاملة وموثوقة تمكّن الفلسطينيين من بيع وشراء المنتجات والخدمات بسهولة وأمان، والمساهمة في تطوير الاقتصاد الرقمي الفلسطيني، مع الالتزام بقيم الشفافية والنزاهة في جميع تعاملاتنا.
            </p>
          </div>
        </div>

        {/* قسم القيم */}
        <div className="mb-12 md:mb-16 rtl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">قيمنا</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="p-5 md:p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-all">
              <div className="bg-blue/10 p-3 rounded-full inline-block mb-4">
                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-blue" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">الثقة والأمان</h3>
              <p className="text-gray-600 dark:text-gray-400">
                نلتزم بتوفير بيئة آمنة وموثوقة لجميع مستخدمينا، مع ضمان حماية بياناتهم الشخصية وتعاملاتهم المالية.
              </p>
            </div>
            
            <div className="p-5 md:p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-all">
              <div className="bg-blue/10 p-3 rounded-full inline-block mb-4">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-blue" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">المجتمع والتعاون</h3>
              <p className="text-gray-600 dark:text-gray-400">
                نؤمن بأهمية بناء مجتمع متعاون يسهم في تعزيز الروابط بين الفلسطينيين ودعم الاقتصاد المحلي.
              </p>
            </div>
            
            <div className="p-5 md:p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-all">
              <div className="bg-blue/10 p-3 rounded-full inline-block mb-4">
                <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-blue" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">الابتكار والتطوير</h3>
              <p className="text-gray-600 dark:text-gray-400">
                نسعى دائماً للتطوير المستمر وتبني أحدث التقنيات لتقديم تجربة مستخدم متميزة وحلول مبتكرة.
              </p>
            </div>
          </div>
        </div>

        {/* قسم الإنجازات */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 md:p-8 rounded-lg mb-12 md:mb-16 rtl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">إنجازاتنا</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue mb-2">+5000</div>
              <p className="text-gray-600 dark:text-gray-400">مستخدم نشط</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue mb-2">+3500</div>
              <p className="text-gray-600 dark:text-gray-400">مزاد ناجح</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue mb-2">+12000</div>
              <p className="text-gray-600 dark:text-gray-400">منتج مباع</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue mb-2">+98%</div>
              <p className="text-gray-600 dark:text-gray-400">نسبة رضا العملاء</p>
            </div>
          </div>
        </div>

        {/* قسم فريق العمل */}
        <div className="mb-12 md:mb-16 rtl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">فريق العمل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-4 mx-auto overflow-hidden rounded-full w-32 h-32 md:w-40 md:h-40 relative">
                <img
                  src="../../public/images/team/waleed.png"
                  alt="وليد دويكات"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">وليد دويكات</h3>
              <p className="text-gray-600 dark:text-gray-400">المؤسس والرئيس التنفيذي</p>
            </div>
            <div className="text-center">
              <div className="mb-4 mx-auto overflow-hidden rounded-full w-32 h-32 md:w-40 md:h-40 relative">
                <img
                  src="../../public/images/team/saed.png"
                  alt="سعد عودة"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">سعد عودة</h3>
              <p className="text-gray-600 dark:text-gray-400">مدير العمليات</p>
            </div>
            <div className="text-center">
              <div className="mb-4 mx-auto overflow-hidden rounded-full w-32 h-32 md:w-40 md:h-40 relative">
                <img
                  src="../../public/images/team/kareem.png"
                  alt="كريم مثقال"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">كريم مثقال</h3>
              <p className="text-gray-600 dark:text-gray-400">مدير التقنية</p>
            </div>
          </div>
        </div>

        {/* قسم الدعوة للعمل */}
        <div className="bg-blue text-white p-8 md:p-12 rounded-lg text-center rtl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">انضم إلى مجتمع مزاد فلسطين اليوم</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            سواء كنت بائعاً تبحث عن منصة لبيع منتجاتك، أو مشترياً تبحث عن صفقات فريدة، مزاد فلسطين هو وجهتك المثالية.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-white text-blue hover:bg-gray-100 rounded-full px-6 md:px-8 py-2 text-base md:text-lg font-medium">
              تصفح المزادات
            </Button>
            <Button className="bg-transparent border-2 border-white hover:bg-white/10 rounded-full px-6 md:px-8 py-2 text-base md:text-lg font-medium">
              إنشاء حساب جديد
            </Button>
          </div>
        </div>
      </div>
  );
};

export default About;
