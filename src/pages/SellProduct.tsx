import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { toast } from "sonner";

const SellProduct = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast("هذه الميزة ستكون متوفرة قريبًا", {
      description: "لتجربة أفضل على موقعنا. تابعنا لمعرفة موعد الإطلاق!"
    });
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8 rtl">
          <h1 className="heading-lg mb-2">بيع منتج</h1>
          <p className="text-gray-600 dark:text-gray-300">
            قم بإنشاء إعلان بيع جديد لعرض منتجك على منصة مزاد فلسطين
          </p>
        </div>
      </main>
    </div>
  );
};

export default SellProduct;