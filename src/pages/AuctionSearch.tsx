import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { auctionService, Auction } from '@/services/auctionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FilterX } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import AuctionCard from '@/components/ui/AuctionCard';

const AuctionSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    status: searchParams.get('status') || 'all',
    userId: searchParams.get('userId') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, [searchParams]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {
        keyword: searchParams.get('keyword') || undefined,
        minPrice: Number(searchParams.get('minPrice')) || undefined,
        status: searchParams.get('status') || undefined,
        userId: searchParams.get('userId') || undefined,
      };

      const data = await auctionService.searchAuctions(params);
      setAuctions(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء البحث عن المزادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.userId) params.set('userId', filters.userId);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      minPrice: 0,
      status: 'all',
      userId: '',
    });
    setSearchParams({});
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">البحث في المزادات</h1>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            {showFilters ? <FilterX className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
          </Button>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="ابحث عن مزادات..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="w-full"
              />
            </div>
            <Button type="submit">
              <Search className="w-4 h-4 ml-2" />
              بحث
            </Button>
          </div>

          {showFilters && (
            <Card className="p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">السعر الأدنى</label>
                  <Slider
                    value={[filters.minPrice]}
                    onValueChange={([value]) => setFilters({ ...filters, minPrice: value })}
                    max={10000}
                    step={100}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">₪{filters.minPrice}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الحالة</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="closed">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">معرف المستخدم</label>
                  <Input
                    placeholder="أدخل معرف المستخدم"
                    value={filters.userId}
                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFilters}
                  className="ml-2"
                >
                  إعادة تعيين
                </Button>
                <Button type="submit">تطبيق الفلاتر</Button>
              </div>
            </Card>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          </div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                title={auction.name}
                description=""
                currentPrice={auction.currentPrice}
                minBidIncrement={auction.bidIncrement}
                imageUrl={auction.imageUrl}
                endTime={auction.endTime}
                bidders={auction.bidders}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">لا توجد نتائج مطابقة للبحث</p>
            <Button variant="outline" onClick={handleResetFilters}>
              إعادة تعيين البحث
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AuctionSearch; 