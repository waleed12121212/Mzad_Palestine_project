import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { MapPin, Briefcase, DollarSign, Clock, Building, Mail, Phone, Calendar, Edit, Trash2, Share2, Heart } from 'lucide-react';
import { Dialog } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { messageService } from '../services/messageService';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [jobOwner, setJobOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // دوال مساعدة للتحقق من نوع التواصل
  const isEmail = (val) => val && val.includes('@');
  const isPhone = (val) => val && /^[0-9+\-\s]+$/.test(val);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobById(Number(id));
        setJob(data);
        if (data && data.userId) {
          const userRes = await userService.getUserById(String(data.userId));
          setJobOwner(userRes.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // مراقبة تغيّر حالة المودال
  useEffect(() => {
    console.log('showApplyModal:', showApplyModal);
  }, [showApplyModal]);

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
      try {
        await jobService.deleteJob(Number(id));
        navigate('/jobs');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!job) return <div className="text-center py-8">لم يتم العثور على الوظيفة</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-200 mb-1 flex items-center gap-4">
                {job.title}
                {/* أزرار التعديل والحذف بجانب العنوان */}
                {String(user?.id) === String(job?.userId) && (
                  <span className="flex gap-2 ms-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border-blue-200 text-blue-700 bg-white/80 hover:bg-blue-50 shadow"
                      title="تعديل"
                      onClick={() => navigate(`/jobs/edit/${job.id}`)}
                    >
                      <Edit className="w-5 h-5 text-blue-700" />
                      <span className="font-bold">تعديل</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border-red-200 text-red-600 bg-white/80 hover:bg-red-50 shadow"
                      title="حذف"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <span className="font-bold">حذف</span>
                    </Button>
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.companyName}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {/* تم نقل الأزرار إلى الأعلى */}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* المحتوى الرئيسي */}
        <section className="col-span-1 lg:col-span-3">
          {/* شبكة معلومات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">نوع الوظيفة</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{job.jobType}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">الراتب</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{job.salary}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">الخبرة</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{job.experienceLevel}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">تاريخ النشر</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-GB') : '-'}</span>
            </div>
          </div>
          {/* أقسام التفاصيل */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-4">وصف الوظيفة</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{job.description}</p>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-4">المتطلبات</h2>
            {job.requirements && (
              <ul className="list-disc pr-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                {job.requirements.split(/\n|,|-/).filter(Boolean).map((req, i) => (
                  <li key={i}>{req.trim()}</li>
                ))}
              </ul>
            )}
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-4">المميزات</h2>
            {job.benefits && (
              <ul className="list-disc pr-6 text-gray-700 dark:text-gray-300 space-y-2">
                {job.benefits.split(/\n|,|-/).filter(Boolean).map((b, i) => (
                  <li key={i}>{b.trim()}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
        {/* الشريط الجانبي */}
        <aside className="space-y-6 col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow flex flex-col items-center">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">معلومات صاحب الوظيفة</h3>
            {jobOwner ? (
              <div className="flex flex-col items-center gap-3 mb-4">
                <Avatar className="w-24 h-24 mb-2">
                  {jobOwner && jobOwner.profilePicture ? (
                    <img
                      src={jobOwner.profilePicture.startsWith('http') 
                        ? jobOwner.profilePicture 
                        : `http://mazadpalestine.runasp.net${jobOwner.profilePicture}`}
                      alt={jobOwner.username}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = '/default-avatar.png';
                        e.currentTarget.onerror = () => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = jobOwner.username?.charAt(0)?.toUpperCase() || 'U';
                          }
                        };
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                      {jobOwner?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </Avatar>
                <div className="font-bold text-blue-700 dark:text-blue-200 text-lg">{jobOwner.firstName} {jobOwner.lastName}</div>
                <div className="text-gray-500 text-sm">{jobOwner.email}</div>
                <div className="text-gray-500 text-sm">{jobOwner.phoneNumber}</div>
              </div>
            ) : (
              <div className="text-gray-400 text-center">جاري تحميل بيانات المستخدم...</div>
            )}
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 mt-6">معلومات التواصل</h3>
            <div className="space-y-4 w-full">
              {(() => {
                // الأولوية: رقم الهاتف ثم الإيميل
                if (job.contactPhone && job.contactPhone !== '-' && isPhone(job.contactPhone)) {
                  return (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">رقم الهاتف</div>
                        <div className="font-medium">{job.contactPhone}</div>
                      </div>
                    </div>
                  );
                } else if (job.contactInfo && isPhone(job.contactInfo)) {
                  return (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">رقم الهاتف</div>
                        <div className="font-medium">{job.contactInfo}</div>
                      </div>
                    </div>
                  );
                } else if (job.contactEmail && isEmail(job.contactEmail)) {
                  return (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                        <div className="font-medium">{job.contactEmail}</div>
                      </div>
                    </div>
                  );
                } else if (job.contactInfo && isEmail(job.contactInfo)) {
                  return (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                        <div className="font-medium">{job.contactInfo}</div>
                      </div>
                    </div>
                  );
                } else {
                  return <div className="text-gray-400">لا يوجد معلومات تواصل متاحة</div>;
                }
              })()}
            </div>
          </div>
          {user && user.id !== job.userId && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg text-lg py-3 mt-4" onClick={() => setShowApplyModal(true)}>
              تقديم طلب
            </Button>
          )}
          {/* Modal for sending application message (مودال React بسيط) */}
          {showApplyModal && (
            <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', position: 'relative'}}>
                <button onClick={() => setShowApplyModal(false)} style={{position: 'absolute', left: 16, top: 16, fontSize: 24, color: '#888', background: 'none', border: 'none', cursor: 'pointer'}}>×</button>
                <h2 className="text-xl font-bold mb-4 text-blue-700">تقديم طلب على وظيفة {job.title}</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSending(true);
                  try {
                    // Format message to include job details
                    const jobUrl = `${window.location.origin}/jobs/${job.id}`;
                    const formattedMessage = 
                      `[وظيفة: ${job.title}](${jobUrl})\n` +
                      `الشركة: ${job.companyName}\n` +
                      `الموقع: ${job.location}\n` +
                      `-----------------\n` +
                      messageContent;

                    await messageService.sendMessage({
                      receiverId: jobOwner.id,
                      subject: `تقديم طلب على وظيفة ${job.title}`,
                      content: formattedMessage,
                    });
                    toast.success('تم إرسال الطلب بنجاح');
                    setShowApplyModal(false);
                    setMessageContent('');
                  } catch (err) {
                    toast.error('فشل إرسال الطلب');
                  } finally {
                    setIsSending(false);
                  }
                }}>
                  <label className="block mb-2 font-semibold">محتوى الرسالة</label>
                  <Textarea
                    className="w-full mb-4"
                    rows={5}
                    value={messageContent}
                    onChange={e => setMessageContent(e.target.value)}
                    required
                    placeholder="اكتب رسالتك هنا..."
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg text-lg py-3" disabled={isSending}>
                    {isSending ? 'جاري الإرسال...' : 'إرسال الطلب'}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default JobDetailsPage; 