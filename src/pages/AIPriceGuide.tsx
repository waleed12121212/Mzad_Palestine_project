
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIPriceExplainer from "@/components/ui/AIPriceExplainer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AIPriceGuide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8 rtl">
          <h1 className="heading-lg mb-2">تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</h1>
          <p className="text-gray-600 dark:text-gray-300">
            تعرف على كيفية الاستفادة من خوارزميات الذكاء الاصطناعي لتحديد السعر المثالي لمنتجاتك ومزاداتك
          </p>
        </div>
        
        <AIPriceExplainer />
        
        <div className="mt-8 flex justify-center">
          <Link to="/create-auction" className="btn-primary flex items-center gap-2 mx-2">
            <span>إنشاء مزاد جديد</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/sell-product" className="btn-secondary flex items-center gap-2 mx-2">
            <span>بيع منتج</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIPriceGuide;
