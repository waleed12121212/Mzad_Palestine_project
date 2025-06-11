import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { jobCategoryService } from '../services/jobCategoryService';
import { JobForm } from '../components/jobs/JobForm';
import { toast } from 'sonner';

export const AddJobPage: React.FC = () => {
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    jobCategoryService.getAllJobCategories().then(setCategories);
  }, []);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await jobService.createJob(data);
      toast.success('تم إضافة الوظيفة بنجاح');
      navigate('/jobs');
    } catch {
      toast.error('فشل إضافة الوظيفة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <div className="w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300 text-center">إضافة وظيفة جديدة</h2>
        <JobForm
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}; 