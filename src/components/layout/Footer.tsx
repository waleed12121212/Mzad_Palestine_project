import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8 border-t border-gray-200 dark:border-gray-800 dark-mode-transition">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 rtl">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue dark:text-blue-light">مزاد فلسطين</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              منصة مزادات إلكترونية تجمع بين التقنيات الحديثة والثقافة الفلسطينية لتوفير تجربة مزايدة آمنة وموثوقة.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <SocialLink Icon={Facebook} href="https://facebook.com" />
              <SocialLink Icon={Twitter} href="https://twitter.com" />
              <SocialLink Icon={Instagram} href="https://instagram.com" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <FooterLink href="/about">من نحن</FooterLink>
              <FooterLink href="/terms">الشروط والأحكام</FooterLink>
              <FooterLink href="/privacy">سياسة الخصوصية</FooterLink>
              <FooterLink href="/how-it-works">الأسئلة الشائعة</FooterLink>
              <FooterLink href="/support">الدعم الفني</FooterLink>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4">الفئات</h3>
            <ul className="space-y-2">
              <FooterLink href="/categories/real-estate">العقارات</FooterLink>
              <FooterLink href="/categories/vehicles">السيارات</FooterLink>
              <FooterLink href="/categories/electronics">الإلكترونيات</FooterLink>
              <FooterLink href="/categories/furniture">الأثاث</FooterLink>
              <FooterLink href="/categories/antiques">التحف والمقتنيات</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 dark:text-gray-400 rtl">
                <MapPin className="h-5 w-5 ml-2 text-blue dark:text-blue-light" />
                <span>نابلس، فلسطين</span>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <Phone className="h-5 w-5 ml-2 text-blue dark:text-blue-light" />
                <span>+970568645283</span>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="h-5 w-5 ml-2 text-blue dark:text-blue-light" />
                <span>mzadpalestine5@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center rtl">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} مزاد فلسطين - جميع الحقوق محفوظة
            </p>
            <div className="flex mt-4 md:mt-0">
              <img
                src="https://cdn-icons-png.flaticon.com/512/196/196566.png"
                alt="Payment Method"
                className="h-8 mx-1"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
                alt="Payment Method"
                className="h-8 mx-1"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  return (
    <li>
      <Link
        to={href}
        className="text-gray-600 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light transition-colors duration-200"
      >
        {children}
      </Link>
    </li>
  );
};

const SocialLink: React.FC<{
  Icon: React.ElementType;
  href: string;
}> = ({ Icon, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
    >
      <Icon className="h-5 w-5 text-blue dark:text-blue-light" />
    </a>
  );
};

export default Footer;
