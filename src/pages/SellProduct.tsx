import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from '@/components/layout/PageWrapper';

const SellProduct: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the CreateListing page
    navigate('/listings/create');
  }, [navigate]);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="loader">جاري التحويل...</div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SellProduct;