
import React from "react";
import { Lightbulb, TrendingUp, BarChart3, Brain, Check, AlertCircle } from "lucide-react";

const AIPriceExplainer = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden rtl">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue/10 dark:bg-blue/20 p-3 rounded-full">
            <Lightbulb className="h-6 w-6 text-blue" />
          </div>
          <h2 className="text-xl font-bold">تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          ميزة "تحديد السعر التلقائي للمنتج" هي نظام ذكي يستخدم التعلم الآلي لمساعدتك في تحديد السعر المناسب للمنتج استنادًا إلى بيانات تاريخية وتحليل السوق.
        </p>
      </div>

      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">أهمية استخدام السعر التلقائي</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-green-500">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">تقليل التخمين وعدم اليقين</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">يساعدك في معرفة القيمة الحقيقية لمنتجك بناءً على السوق الفعلي.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 text-green-500">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">زيادة الأرباح</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">يمنحك القدرة على تحديد أسعار تنافسية دون بيع المنتج بأقل من قيمته.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 text-green-500">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">تحسين تجربة المستخدم</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">تعزيز ثقة البائعين والمشترين في السوق من خلال تسعير عادل.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 text-green-500">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">تحليل السوق المستمر</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">فهم اتجاهات السوق بناءً على بيانات العرض والطلب الحالية.</p>
            </div>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-4">كيف يعمل نظام تحديد السعر؟</h3>
        
        <div className="space-y-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue/10 dark:bg-blue/20 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
              <span className="font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">إدخال بيانات المنتج</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                أدخل تفاصيل المنتج مثل الفئة، الحالة، المواصفات، والموقع الجغرافي. كلما كانت المعلومات أكثر تفصيلاً، كان التحليل أكثر دقة.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-blue/10 dark:bg-blue/20 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
              <span className="font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">تحليل البيانات باستخدام الذكاء الاصطناعي</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                يقوم النظام بتحليل بيانات السوق ومقارنة المنتج بمزادات سابقة لمنتجات مماثلة، وقياس مدى شعبية المنتج في السوق، واستخدام نماذج التنبؤ.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-blue/10 dark:bg-blue/20 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
              <span className="font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">تقديم توصية بالسعر</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                يعرض النظام السعر المقترح مع الحد الأدنى والأعلى للسعر، واتجاه السعر في السوق. يمكنك قبول التوصية أو تعديل السعر يدوياً.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-3">التقنيات المستخدمة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>تحليل البيانات الضخمة</span>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue" />
              <span>النماذج الإحصائية</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>خوارزميات التنبؤ</span>
            </div>
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <span>نموذج التوصية الذكي</span>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              تذكر أن توصيات السعر هي للإرشاد فقط وتعتمد على دقة البيانات المدخلة. قد تختلف نتائج السعر الفعلي بناءً على ظروف السوق والطلب الحالي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPriceExplainer;
