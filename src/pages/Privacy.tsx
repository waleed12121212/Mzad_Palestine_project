
import React from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Shield, LockKeyhole, FileText, Users } from "lucide-react";

const Privacy = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="heading-lg mb-4">سياسة الخصوصية</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              نلتزم بحماية خصوصيتك وبياناتك الشخصية. اقرأ سياسة الخصوصية الخاصة بنا لفهم كيفية جمع واستخدام وحماية بياناتك.
            </p>
          </div>

          <div className="space-y-8 rtl">
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">مقدمة</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                مرحبًا بك في منصة مزاد فلسطين. نحن نقدر ثقتك ونلتزم بحماية خصوصيتك. تم وضع سياسة الخصوصية هذه لشرح ممارساتنا المتعلقة بجمع واستخدام وحماية المعلومات الشخصية التي قد نجمعها منك أثناء استخدام موقعنا.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                باستخدام موقعنا، فإنك توافق على ممارسات جمع البيانات واستخدامها الموضحة في هذه السياسة. نحن نراجع سياسة الخصوصية الخاصة بنا بانتظام ونحتفظ بالحق في إجراء تغييرات في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">المعلومات التي نجمعها</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                نحن نجمع معلومات شخصية عندما تسجل في موقعنا، تدخل في معاملة، تشارك في المزادات، أو تتواصل معنا. قد تشمل هذه المعلومات:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>الاسم والعنوان وعنوان البريد الإلكتروني ورقم الهاتف</li>
                <li>معلومات الدفع، مثل تفاصيل بطاقة الائتمان أو الحساب المصرفي</li>
                <li>معلومات الحساب، مثل اسم المستخدم وكلمة المرور</li>
                <li>سجلات المعاملات، بما في ذلك المزادات التي شاركت فيها والعناصر التي اشتريتها أو بعتها</li>
                <li>تفاصيل تقنية مثل عنوان IP ونوع المتصفح ومعلومات الجهاز</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                نحن نجمع أيضًا معلومات غير شخصية، مثل البيانات المجمعة الإحصائية، والتي قد نستخدمها لتحسين موقعنا وخدماتنا.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">كيف نستخدم معلوماتك</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                نستخدم المعلومات التي نجمعها للأغراض التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>لتوفير وتحسين خدماتنا</li>
                <li>لمعالجة المعاملات وإدارة حسابك</li>
                <li>للتواصل معك بشأن المزادات، والمعاملات، والإشعارات الأخرى</li>
                <li>لإرسال معلومات تسويقية إذا اخترت تلقيها</li>
                <li>للتحقق من هويتك والحماية من الاحتيال</li>
                <li>للامتثال للالتزامات القانونية</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                لن نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة لأغراض تسويقية دون موافقتك الصريحة.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">أمان المعلومات</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو التدمير. تشمل هذه التدابير:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>استخدام التشفير لحماية البيانات الحساسة المنقولة عبر الإنترنت</li>
                <li>تنفيذ ضوابط الوصول لتقييد من يمكنه الوصول إلى معلوماتك</li>
                <li>استخدام تدابير الحماية المادية والإلكترونية والإدارية</li>
                <li>مراجعة ممارسات جمع المعلومات وتخزينها ومعالجتها بانتظام</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                على الرغم من أننا نبذل قصارى جهدنا لحماية معلوماتك، فإن نقل البيانات عبر الإنترنت ليس آمنًا تمامًا. لا يمكننا ضمان أمان المعلومات المنقولة إلى موقعنا، وأي نقل يكون على مسؤوليتك الخاصة.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">اتصل بنا</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية الخاصة بنا، يرجى الاتصال بنا:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">
                  البريد الإلكتروني: privacy@mzadpalestine.ps
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  الهاتف: +970 59 123 4567
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  العنوان: رام الله، فلسطين
                </p>
              </div>
            </section>

            <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
              آخر تحديث: {new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Privacy;
