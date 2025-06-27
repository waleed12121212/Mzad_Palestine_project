import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Users, Gavel, Package, Wrench, Briefcase, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { searchService, SearchResponse } from '@/services/searchService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
    // eslint-disable-next-line
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchService.search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue);
    }
  };

  const getTotalResults = () => {
    if (!searchResults) return 0;
    return (
      (searchResults.users?.length || 0) +
      (searchResults.auctions?.length || 0) +
      (searchResults.listings?.length || 0) +
      (searchResults.services?.length || 0) +
      (searchResults.jobs?.length || 0)
    );
  };

  const getActiveTabCount = (category: string) => {
    if (!searchResults) return 0;
    switch (category) {
      case 'users': return searchResults.users?.length || 0;
      case 'auctions': return searchResults.auctions?.length || 0;
      case 'listings': return searchResults.listings?.length || 0;
      case 'services': return searchResults.services?.length || 0;
      case 'jobs': return searchResults.jobs?.length || 0;
      default: return getTotalResults();
    }
  };

  const navigateToItem = (path: string) => navigate(path);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* هيدر الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2 self-start">
          <ChevronLeft className="h-4 w-4" /> العودة
        </Button>
        <div className="flex-1 text-center md:text-right">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center md:justify-end gap-3 text-blue dark:text-blue-light">
            <Search className="h-9 w-9" /> نتائج البحث
          </h1>
          {searchQuery && (
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-base md:text-lg">
              البحث عن: <span className="font-bold text-blue dark:text-blue-light">"{searchQuery}"</span>
            </p>
          )}
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="mb-6 shadow-lg rounded-xl border-blue/10 dark:border-blue-dark/20">
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center">
            <div className="relative flex-1 w-full max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="ابحث عن مستخدمين، مزادات، منتجات، خدمات، وظائف..."
                className="w-full pl-12 pr-4 py-3 md:py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue dark:focus:ring-blue-light focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg md:text-xl shadow"
              />
            </div>
            <Button type="submit" className="px-8 py-3 text-lg rounded-xl bg-blue hover:bg-blue-dark transition font-bold shadow">
              بحث
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* نتائج البحث */}
      {isLoading ? (
        <div className="text-center py-8 md:py-12">
          <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin text-blue dark:text-blue-light mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">جاري البحث...</p>
        </div>
      ) : searchResults ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* القائمة الجانبية */}
          <div className="md:col-span-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm md:border-r md:border-gray-100 dark:md:border-gray-800 p-2 md:p-4 flex flex-row md:flex-col gap-2 md:gap-4 items-center md:items-stretch mb-4 md:mb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-row md:flex-col gap-2 md:gap-3 bg-blue/5 dark:bg-blue-dark/10 rounded-lg p-2 md:p-3">
                <TabsTrigger value="all" className="flex items-center gap-2 text-sm md:text-base w-full justify-start">
                  <Search className="h-5 w-5" /> الكل <span className="ml-auto text-xs">({getTotalResults()})</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 text-sm md:text-base w-full justify-start">
                  <Users className="h-5 w-5" /> المستخدمين <span className="ml-auto text-xs">({getActiveTabCount('users')})</span>
                </TabsTrigger>
                <TabsTrigger value="auctions" className="flex items-center gap-2 text-sm md:text-base w-full justify-start">
                  <Gavel className="h-5 w-5" /> المزادات <span className="ml-auto text-xs">({getActiveTabCount('auctions')})</span>
                </TabsTrigger>
                <TabsTrigger value="listings" className="flex items-center gap-2 text-sm md:text-base w-full justify-start">
                  <Package className="h-5 w-5" /> المنتجات <span className="ml-auto text-xs">({getActiveTabCount('listings')})</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2 text-sm md:text-base w-full justify-start">
                  <Wrench className="h-5 w-5" /> الخدمات <span className="ml-auto text-xs">({getActiveTabCount('services')})</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2 text-sm md:text-base w-full justify-start">
                  <Briefcase className="h-5 w-5" /> الوظائف <span className="ml-auto text-xs">({getActiveTabCount('jobs')})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* النتائج */}
          <div className="md:col-span-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* All Results Tab */}
              <TabsContent value="all" className="mt-4 md:mt-0">
                <div className="space-y-6 md:space-y-8">
                  {/* Users Section */}
                  {searchResults.users && searchResults.users.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-blue dark:text-blue-light" />
                        <h2 className="text-lg md:text-xl font-semibold">المستخدمين</h2>
                        <Badge variant="secondary">{searchResults.users.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.users.slice(0, 6).map((user) => (
                          <Card key={`user-${user.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                            <CardContent className="p-4 md:p-6">
                              <div className="flex items-center gap-2 md:gap-3" onClick={() => navigateToItem(`/seller/${user.id}`)}>
                                <Avatar size="lg">
                                  <AvatarImage src={user.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://mazadpalestine.runasp.net${user.profilePicture}`) : undefined} alt={user.username} />
                                  <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base md:text-lg">{user.username}</h3>
                                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {searchResults.users.length > 6 && (
                        <div className="text-center mt-3 md:mt-4">
                          <Button variant="outline" onClick={() => setActiveTab('users')} className="text-sm">
                            عرض كل المستخدمين ({searchResults.users.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auctions Section */}
                  {searchResults.auctions && searchResults.auctions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Gavel className="h-4 w-4 md:h-5 md:w-5 text-blue dark:text-blue-light" />
                        <h2 className="text-lg md:text-xl font-semibold">المزادات</h2>
                        <Badge variant="secondary">{searchResults.auctions.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.auctions.slice(0, 6).map((auction) => (
                          <Card key={`auction-${auction.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                            <CardContent className="p-4 md:p-6">
                              <div onClick={() => navigateToItem(`/auction/${auction.id}`)}>
                                <div className="w-full h-28 md:h-36 rounded-lg overflow-hidden mb-3">
                                  <img
                                    src={(auction.images && auction.images.length > 0) ? auction.images[0] : "/images/default-product.png"}
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{auction.title}</h3>
                                <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{auction.currentBid} ₪</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {searchResults.auctions.length > 6 && (
                        <div className="text-center mt-3 md:mt-4">
                          <Button variant="outline" onClick={() => setActiveTab('auctions')} className="text-sm">
                            عرض كل المزادات ({searchResults.auctions.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Listings Section */}
                  {searchResults.listings && searchResults.listings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Package className="h-4 w-4 md:h-5 md:w-5 text-blue dark:text-blue-light" />
                        <h2 className="text-lg md:text-xl font-semibold">المنتجات</h2>
                        <Badge variant="secondary">{searchResults.listings.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.listings.slice(0, 6).map((listing) => (
                          <Card key={`listing-${listing.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                            <CardContent className="p-4 md:p-6">
                              <div onClick={() => navigateToItem(`/listing/${listing.id}`)}>
                                <div className="w-full h-28 md:h-36 rounded-lg overflow-hidden mb-3">
                                  <img
                                    src={(listing.images && listing.images.length > 0) ? listing.images[0] : "/images/default-product.png"}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{listing.title}</h3>
                                <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{listing.price} ₪</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {searchResults.listings.length > 6 && (
                        <div className="text-center mt-3 md:mt-4">
                          <Button variant="outline" onClick={() => setActiveTab('listings')} className="text-sm">
                            عرض كل المنتجات ({searchResults.listings.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Services Section */}
                  {searchResults.services && searchResults.services.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Wrench className="h-4 w-4 md:h-5 md:w-5 text-blue dark:text-blue-light" />
                        <h2 className="text-lg md:text-xl font-semibold">الخدمات</h2>
                        <Badge variant="secondary">{searchResults.services.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.services.slice(0, 6).map((service) => (
                          <Card key={`service-${service.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                            <CardContent className="p-4 md:p-6">
                              <div onClick={() => navigateToItem(`/service/${service.id}`)}>
                                <div className="w-full h-28 md:h-36 rounded-lg overflow-hidden mb-3">
                                  <img
                                    src={(service.images && service.images.length > 0) ? service.images[0] : "/images/default-service.png"}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{service.title}</h3>
                                <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{service.price} ₪</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {searchResults.services.length > 6 && (
                        <div className="text-center mt-3 md:mt-4">
                          <Button variant="outline" onClick={() => setActiveTab('services')} className="text-sm">
                            عرض كل الخدمات ({searchResults.services.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Jobs Section */}
                  {searchResults.jobs && searchResults.jobs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-blue dark:text-blue-light" />
                        <h2 className="text-lg md:text-xl font-semibold">الوظائف</h2>
                        <Badge variant="secondary">{searchResults.jobs.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.jobs.slice(0, 6).map((job) => (
                          <Card key={`job-${job.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                            <CardContent className="p-4 md:p-6">
                              <div onClick={() => navigateToItem(`/job/${job.id}`)}>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{job.title}</h3>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">{job.userName}</p>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">{job.address}</p>
                                <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{job.salary}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {searchResults.jobs.length > 6 && (
                        <div className="text-center mt-3 md:mt-4">
                          <Button variant="outline" onClick={() => setActiveTab('jobs')} className="text-sm">
                            عرض كل الوظائف ({searchResults.jobs.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              {/* Users Tab */}
              <TabsContent value="users" className="mt-4 md:mt-0">
                {searchResults.users && searchResults.users.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.users.map((user) => (
                      <Card key={`user-${user.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-center gap-2 md:gap-3" onClick={() => navigateToItem(`/seller/${user.id}`)}>
                            <Avatar size="lg">
                              <AvatarImage src={user.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://mazadpalestine.runasp.net${user.profilePicture}`) : undefined} alt={user.username} />
                              <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base md:text-lg">{user.username}</h3>
                              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Users className="h-12 w-12 md:h-16 md:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد مستخدمين مطابقين للبحث</p>
                  </div>
                )}
              </TabsContent>
              {/* Auctions Tab */}
              <TabsContent value="auctions" className="mt-4 md:mt-0">
                {searchResults.auctions && searchResults.auctions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.auctions.map((auction) => (
                      <Card key={`auction-${auction.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                        <CardContent className="p-4 md:p-6">
                          <div onClick={() => navigateToItem(`/auction/${auction.id}`)}>
                            <div className="w-full h-28 md:h-36 rounded-lg overflow-hidden mb-3">
                              <img
                                src={(auction.images && auction.images.length > 0) ? auction.images[0] : "/images/default-product.png"}
                                alt={auction.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{auction.title}</h3>
                            <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{auction.currentBid} ₪</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Gavel className="h-12 w-12 md:h-16 md:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد مزادات مطابقة للبحث</p>
                  </div>
                )}
              </TabsContent>
              {/* Listings Tab */}
              <TabsContent value="listings" className="mt-4 md:mt-0">
                {searchResults.listings && searchResults.listings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.listings.map((listing) => (
                      <Card key={`listing-${listing.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                        <CardContent className="p-4 md:p-6">
                          <div onClick={() => navigateToItem(`/listing/${listing.id}`)}>
                            <div className="w-full h-28 md:h-36 rounded-lg overflow-hidden mb-3">
                              <img
                                src={(listing.images && listing.images.length > 0) ? listing.images[0] : "/images/default-product.png"}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{listing.title}</h3>
                            <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{listing.price} ₪</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Package className="h-12 w-12 md:h-16 md:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات مطابقة للبحث</p>
                  </div>
                )}
              </TabsContent>
              {/* Services Tab */}
              <TabsContent value="services" className="mt-4 md:mt-0">
                {searchResults.services && searchResults.services.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.services.map((service) => (
                      <Card key={`service-${service.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                        <CardContent className="p-4 md:p-6">
                          <div onClick={() => navigateToItem(`/service/${service.id}`)}>
                            <div className="w-full h-28 md:h-36 rounded-lg overflow-hidden mb-3">
                              <img
                                src={(service.images && service.images.length > 0) ? service.images[0] : "/images/default-service.png"}
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{service.title}</h3>
                            <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{service.price} ₪</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Wrench className="h-12 w-12 md:h-16 md:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد خدمات مطابقة للبحث</p>
                  </div>
                )}
              </TabsContent>
              {/* Jobs Tab */}
              <TabsContent value="jobs" className="mt-4 md:mt-0">
                {searchResults.jobs && searchResults.jobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.jobs.map((job) => (
                      <Card key={`job-${job.id}`} className="hover:shadow-lg transition-shadow cursor-pointer border border-blue/10 dark:border-blue-dark/20">
                        <CardContent className="p-4 md:p-6">
                          <div onClick={() => navigateToItem(`/job/${job.id}`)}>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base md:text-lg">{job.title}</h3>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">{job.userName}</p>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">{job.address}</p>
                            <p className="text-base md:text-lg font-bold text-blue dark:text-blue-light">{job.salary}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Briefcase className="h-12 w-12 md:h-16 md:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد وظائف مطابقة للبحث</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : searchQuery ? (
        <div className="text-center py-8 md:py-12">
          <Search className="h-12 w-12 md:h-16 md:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">لا توجد نتائج للبحث</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 md:mb-6 px-4 text-sm md:text-base">
            لم نتمكن من العثور على نتائج مطابقة لـ "{searchQuery}"
          </p>
          <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 px-4">
            جرب استخدام كلمات مفتاحية أخرى أو تحقق من التهجئة
          </p>
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <Search className="h-12 w-12 md:h-16 md:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">مرحباً بك في البحث الشامل</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 md:mb-6 px-4 text-sm md:text-base">
            ابحث عن مستخدمين، مزادات، منتجات، خدمات، وظائف في منصة مزاد فلسطين
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 