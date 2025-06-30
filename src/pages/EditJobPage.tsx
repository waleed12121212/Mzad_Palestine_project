import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { jobCategoryService } from '../services/jobCategoryService';
import { JobForm } from '../components/jobs/JobForm';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Job } from '../types/job';

export const EditJobPage: React.FC = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [job, setJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, jobData] = await Promise.all([
          jobCategoryService.getAllJobCategories(),
          jobService.getJobById(Number(id))
        ]);
        setCategories(cats);
        setJob(jobData);
        // حماية: السماح فقط لصاحب الوظيفة
        if (!user || String(jobData.userId) !== String(user.id)) {
          setNotAllowed(true);
          toast.error('غير مصرح لك بتعديل هذه الوظيفة');
          setTimeout(() => navigate('/jobs'), 3000);
        }
      } catch {
        toast.error('فشل تحميل بيانات الوظيفة');
        setTimeout(() => navigate('/jobs'), 3000);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user, navigate]);

  const handleSubmit = async (data: Partial<Job>) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Job> = {
        jobCategoryId: data.jobCategoryId,
        title: data.title,
        description: data.description,
        companyName: data.companyName,
        location: data.location,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
        salary: data.salary,
        requirements: data.requirements,
        benefits: data.benefits,
        contactInfo: data.contactInfo,
        status: data.status,
      };

      if (data.applicationDeadline) {
        payload.applicationDeadline = new Date(data.applicationDeadline).toISOString();
      }

      await jobService.updateJob(Number(id), payload);
      toast.success('تم تحديث الوظيفة بنجاح');
      navigate('/jobs');
    } catch {
      toast.error('فشل تحديث الوظيفة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="container py-8">جاري التحميل...</div>;
  if (notAllowed) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">غير مصرح لك</h2>
          <p className="text-gray-600 mb-2">لا يمكنك تعديل هذه الوظيفة.</p>
          <p className="text-gray-400 text-sm">سيتم تحويلك تلقائياً إلى صفحة الوظائف...</p>
        </div>
      </div>
    );
  }
  if (!job) return null;

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <div className="w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300 text-center">تعديل وظيفة</h2>
        <JobForm
          categories={categories}
          initialData={job}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}; 