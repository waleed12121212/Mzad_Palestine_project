import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import AuctionCard from '@/components/ui/AuctionCard';
import { auctionService } from '@/services/auctionService';
import { categoryService } from '@/services/categoryService';
import { Category } from '@/types';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch category details
        const categoryData = await categoryService.getCategoryById(categoryId!);
        setCategory(categoryData);

        // Fetch all active auctions
        const allAuctionsResponse: any = await auctionService.getActiveAuctions();
        const allAuctions = allAuctionsResponse.data || [];
        // Debug: log raw auctions
        console.log('Raw auctions from API:', allAuctions);

        // Normalize as in ActiveAuctions.tsx
        const normalizedData = Array.isArray(allAuctions)
          ? allAuctions
              .map(auction => {
                const normalized = {
                  ...auction,
                  id: Number(auction.id ?? auction['auctionId'] ?? auction['AuctionId']),
                  listingId: Number(auction.listingId ?? auction['ListingId']),
                  title: auction.title ?? auction.name ?? auction['Name'] ?? "",
                  currentPrice: auction.currentBid ?? auction.currentPrice ?? auction.reservePrice ?? auction['ReservePrice'] ?? 0,
                  reservePrice: auction.reservePrice ?? auction['ReservePrice'] ?? 0,
                  currentBid: auction.currentBid ?? auction['CurrentBid'] ?? 0,
                  bidIncrement: auction.bidIncrement ?? auction['BidIncrement'] ?? 0,
                  Bids: auction.Bids || auction['Bids'] || [],
                  bidsCount: auction.bidsCount ?? auction['BidsCount'] ?? 0,
                  userId: auction.userId ?? auction['UserId'],
                  imageUrl: auction.imageUrl ?? auction['ImageUrl'],
                  endTime: auction.endTime ?? auction['EndTime'],
                  categoryId: String(auction.categoryId ?? auction['CategoryId']),
                };
                return normalized;
              })
              .filter(
                auction => {
                  const match = Number.isFinite(auction.id) &&
                    auction.id > 0 &&
                    String(auction.categoryId) === String(categoryId);
                  // Debug: log each auction and whether it matches
                  console.log('Normalized auction:', auction, 'Matches category?', match);
                  return match;
                }
              )
          : [];
        // Debug: log normalized and filtered auctions
        console.log('Normalized and filtered auctions:', normalizedData);

        setAuctions(normalizedData);

        document.title = `${categoryData.name} - مزاد فلسطين`;
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
        console.error('Error fetching category data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  // Animation variants for the grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
            <button 
              onClick={() => navigate('/')} 
              className="btn-primary"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{category?.name}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {auctions.length} مزادات نشطة
          </p>
        </div>

        {/* Auctions Grid */}
        {auctions.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {auctions.map((auction) => (
              <motion.div key={auction.id} variants={itemVariants}>
                <AuctionCard
                  id={auction.id}
                  listingId={auction.listingId}
                  title={auction.title}
                  description={auction.description ?? ""}
                  currentPrice={auction.currentPrice}
                  minBidIncrement={auction.bidIncrement}
                  imageUrl={auction.imageUrl}
                  endTime={auction.endTime}
                  bidders={auction.bidsCount ?? 0}
                  userId={auction.userId}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              لا توجد مزادات نشطة في هذه الفئة حالياً
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="btn-primary"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default CategoryPage; 