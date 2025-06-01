import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-toastify';
import { serviceService, type Service } from '@/services/serviceService';
import { serviceCategoryService, type ServiceCategory } from '@/services/serviceCategoryService';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip';

const ServicePage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // Form states
  const [newService, setNewService] = useState({
    newServiceCategoryId: parseInt(categoryId || '0'),
    title: '',
    description: '',
    price: 0,
    location: '',
    contactInfo: ''
  });

  // New states for editing
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editServiceData, setEditServiceData] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    contactInfo: ''
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
      fetchServices();
    }
  }, [categoryId]);

  useEffect(() => {
    serviceCategoryService.getServiceCategories().then(setCategories);
  }, []);

  const fetchCategory = async () => {
    try {
      const data = await serviceCategoryService.getServiceCategoryById(categoryId || '');
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('حدث خطأ أثناء جلب فئة الخدمة');
    }
  };

  const fetchServices = async () => {
    try {
      const data = await serviceService.getServicesByCategoryId(categoryId || '0');
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('حدث خطأ أثناء جلب الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      await serviceService.createService(newService);
      toast.success('تم إنشاء الخدمة بنجاح');
      setNewService({
        newServiceCategoryId: parseInt(categoryId || '0'),
        title: '',
        description: '',
        price: 0,
        location: '',
        contactInfo: ''
      });
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('حدث خطأ أثناء إنشاء الخدمة');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    try {
      await serviceService.deleteService(id.toString());
      toast.success('تم حذف الخدمة بنجاح');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('حدث خطأ أثناء حذف الخدمة');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setEditServiceData({
      title: service.title,
      description: service.description,
      price: service.price,
      location: service.location,
      contactInfo: service.contactInfo
    });
    setEditDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    try {
      await serviceService.updateService(editingService.id, {
        ...editServiceData,
        newServiceCategoryId: editingService.newServiceCategoryId
      });
      toast.success('تم تحديث الخدمة بنجاح');
      setEditDialogOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('حدث خطأ أثناء تحديث الخدمة');
    }
  };

  const uniqueLocations = Array.from(new Set(services.map(s => s.location).filter(Boolean)));

  const filteredServices = services.filter(service => {
    const priceOk =
      (!minPrice || service.price >= Number(minPrice)) &&
      (!maxPrice || service.price <= Number(maxPrice));
    const locationOk = !filterLocation || service.location === filterLocation;
    const categoryOk = !filterCategory || service.newServiceCategoryId === Number(filterCategory);
    const searchOk =
      service.title.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());
    return priceOk && locationOk && categoryOk && searchOk;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">{category?.name || 'الخدمات'}</h1>
          <div className="flex gap-2">
            {user && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow px-6 py-2 text-lg font-semibold transition">
                إضافة خدمة جديدة
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* فلاتر جانبية وmain */}
      <div className="container mx-auto mt-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-1/4 bg-white rounded-xl shadow p-6 mb-6 md:mb-0">
          <div className="mb-4">
            <label className="block font-semibold mb-2">بحث</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="ابحث عن خدمة..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">التصنيف</label>
            <select className="w-full border rounded-lg px-3 py-2" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">كل التصنيفات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">نطاق السعر</label>
            <div className="flex gap-2">
              <input type="number" className="w-1/2 border rounded-lg px-2 py-1" placeholder="الحد الأدنى" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <input type="number" className="w-1/2 border rounded-lg px-2 py-1" placeholder="الحد الأعلى" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">المدينة</label>
            <select className="w-full border rounded-lg px-3 py-2" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
              <option value="">كل المدن</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredServices.length === 0 && (
              <div className="text-center text-gray-500 py-8 col-span-full">لا توجد خدمات مطابقة للبحث أو الفلاتر.</div>
            )}
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-blue-400 transition overflow-hidden flex flex-col"
              >
                <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5v-15a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v15m-15 0h15m-15 0a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 group-hover:text-blue-600 transition">{service.title}</h2>
                    <div className="text-gray-500 text-sm">{service.location} • {service.contactInfo}</div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 rounded px-2 py-1">خدمة</span>
                      <span className="flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1">{service.price} ₪</span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">{service.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Link to={`/services/${service.id}`}>
                      <Button className="rounded-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow transition">تفاصيل</Button>
                    </Link>
                    {user?.id === service.userId && (
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEditService(service)}><Edit className="w-5 h-5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteService(service.id)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الخدمة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">عنوان الخدمة</Label>
              <Input
                id="edit-title"
                value={editServiceData.title}
                onChange={(e) => setEditServiceData({ ...editServiceData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">الوصف</Label>
              <Textarea
                id="edit-description"
                value={editServiceData.description}
                onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">السعر</Label>
              <Input
                id="edit-price"
                type="number"
                value={editServiceData.price}
                onChange={(e) => setEditServiceData({ ...editServiceData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">الموقع</Label>
              <Input
                id="edit-location"
                value={editServiceData.location}
                onChange={(e) => setEditServiceData({ ...editServiceData, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactInfo">معلومات الاتصال</Label>
              <Input
                id="edit-contactInfo"
                value={editServiceData.contactInfo}
                onChange={(e) => setEditServiceData({ ...editServiceData, contactInfo: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleUpdateService}>حفظ التعديلات</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicePage; 