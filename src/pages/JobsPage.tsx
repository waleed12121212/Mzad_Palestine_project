import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Job, JobCategory } from '../types/job';
import { jobService } from '../services/jobService';
import { jobCategoryService } from '../services/jobCategoryService';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Edit, Trash2, MapPin, Briefcase, DollarSign, Plus, Filter, Clock } from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // فلاتر
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [search, setSearch] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, categoriesData] = await Promise.all([
        jobService.getAllJobs(),
        jobCategoryService.getAllJobCategories()
      ]);
      setJobs(jobsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;
    try {
      await jobService.deleteJob(id);
      toast.success("تم حذف الوظيفة بنجاح");
      loadData();
    } catch (error) {
      toast.error("فشل حذف الوظيفة");
      console.error(error);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || "غير محدد";
  };

  if (isLoading) {
    return <div className="container py-8">جاري التحميل...</div>;
  }

  const isAdmin = user && String(user.role).toLowerCase() === 'admin';

  // استخراج القيم الفريدة للفلاتر
  const uniqueTypes = Array.from(new Set(jobs.map(j => j.jobType).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));
  const uniqueLevels = Array.from(new Set(jobs.map(j => j.experienceLevel).filter(Boolean)));

  // تطبيق الفلاتر
  const filteredJobs = jobs.filter(job => {
    // فلترة الراتب
    const salaryOk =
      (!minSalary || job.salary >= Number(minSalary)) &&
      (!maxSalary || job.salary <= Number(maxSalary));

    // فلترة التاريخ
    let dateOk = true;
    if (dateFilter) {
      const jobDate = new Date(job.createdAt || job.updatedAt || job.date || Date.now());
      const now = new Date();
      if (dateFilter === 'today') {
        dateOk = jobDate.toDateString() === now.toDateString();
      } else if (dateFilter === '3days') {
        const diff = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
        dateOk = diff <= 3;
      } else if (dateFilter === 'week') {
        const diff = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
        dateOk = diff <= 7;
      }
    }

    return (
      (!filterCategory || job.jobCategoryId === Number(filterCategory)) &&
      (!filterType || job.jobType === filterType) &&
      (!filterLocation || job.location.includes(filterLocation)) &&
      (!filterLevel || job.experienceLevel === filterLevel) &&
      (!search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName.toLowerCase().includes(search.toLowerCase())
      ) &&
      salaryOk &&
      dateOk
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight">الوظائف</h1>
          <div className="flex gap-2">
            {!isAdmin && (
              <Link to="/job-categories">
                <Button className="bg-gray-100 hover:bg-gray-200 text-blue-700 rounded-full shadow px-6 py-2 text-lg font-semibold transition border border-blue-100">
                  عرض تصنيفات الوظائف
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link to="/jobs/categories">
                <Button className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-full shadow px-6 py-2 text-lg font-semibold transition flex items-center gap-2">
                  إدارة تصنيفات الوظائف
                  <Building2 className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/jobs/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow px-6 py-2 text-lg font-semibold transition">إضافة وظيفة</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 py-10">
        {/* Sidebar Filters */}
        <aside className="col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 h-fit sticky top-28 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" /> الفلاتر
            </h2>
            {/* الفئة */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> الفئة
              </label>
              <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">كل الفئات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* نطاق السعر */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-400" /> نطاق السعر
              </label>
              <div className="flex gap-2">
                <input type="number" className="border rounded-lg px-3 py-2 w-1/2" placeholder="الحد الأدنى" value={minSalary} onChange={e => setMinSalary(e.target.value)} />
                <input type="number" className="border rounded-lg px-3 py-2 w-1/2" placeholder="الحد الأقصى" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} />
              </div>
            </div>
            {/* الوقت */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> الوقت
              </label>
              <select className="w-full border rounded-lg px-3 py-2" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="">جميع الوظائف</option>
                <option value="today">أضيفت اليوم</option>
                <option value="3days">أضيفت مؤخراً (خلال 3 أيام)</option>
                <option value="week">جديدة (خلال أسبوع)</option>
              </select>
            </div>
            {/* نوع الدوام */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> نوع الدوام
              </label>
              <select className="w-full border rounded-lg px-3 py-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">كل الأنواع</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {/* المدينة */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> المدينة
              </label>
              <select className="w-full border rounded-lg px-3 py-2" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
                <option value="">كل المدن</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {/* مستوى الخبرة */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> مستوى الخبرة
              </label>
              <select className="w-full border rounded-lg px-3 py-2" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="">كل المستويات</option>
                {uniqueLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            {/* البحث */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" /> بحث
              </label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="بحث عن وظيفة أو شركة..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="w-full rounded-full" onClick={() => {
              setFilterCategory('');
              setFilterType('');
              setFilterLocation('');
              setFilterLevel('');
              setSearch('');
              setMinSalary('');
              setMaxSalary('');
              setDateFilter('');
            }}>إعادة ضبط</Button>
          </div>
        </aside>
        {/* Main Content */}
        <section className="col-span-1 lg:col-span-3">
          {/* شريط البحث والترتيب */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 rtl">
            <div className="relative w-full md:w-auto md:flex-1">
              <svg className="absolute top-1/2 transform -translate-y-1/2 right-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="ابحث عن وظيفة..."
                className="pr-10 rtl w-full border rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex space-s-2 w-full md:w-auto">
              <select
                className="w-full md:w-48 border rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-400"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              >
                <option value="">الأحدث</option>
                <option value="today">اليوم</option>
                <option value="3days">آخر 3 أيام</option>
                <option value="week">آخر أسبوع</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredJobs.length === 0 && (
              <div className="text-center text-gray-500 py-8 col-span-full">لا توجد وظائف مطابقة للبحث أو الفلاتر.</div>
            )}
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-400 transition overflow-hidden flex flex-col"
              >
                <div className="flex items-center gap-4 p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 group-hover:text-blue-600 transition">{job.title}</h2>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">{job.companyName} • {job.location}</div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded px-2 py-1"><Briefcase className="w-4 h-4" /> {job.jobType}</span>
                      <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">₪ {job.salary}</span>
                      <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">{job.experienceLevel}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">{job.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Link to={`/jobs/${job.id}`}>
                      <Button className="rounded-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow transition">تفاصيل</Button>
                    </Link>
                    {user?.id === job.userId && (
                      <div className="flex gap-2">
                        <Link to={`/jobs/edit/${job.id}`}>
                          <Button size="icon" variant="ghost"><Edit className="w-5 h-5" /></Button>
                        </Link>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(job.id)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}; 