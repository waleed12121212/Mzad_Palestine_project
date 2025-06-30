import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { MapPin, Briefcase, DollarSign, Clock, Building, Mail, Phone, Calendar, Edit, Trash2, Share2, Heart, Send, Paperclip, FileText, X } from 'lucide-react';
import { Dialog } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { messageService } from '../services/messageService';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import axios from 'axios';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">آخر موعد للتقديم</span>
              <span className="font-bold text-red-700 dark:text-red-300">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-GB') : '-'}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">الحالة</span>
              <span className={`font-bold ${job.status === 'Open' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {job.status === 'Open' ? 'مفتوحة' : 'مغلقة'}
              </span>
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
              {job.contactInfo ? (
                <div className="flex items-center gap-3">
                  {isEmail(job.contactInfo) ? (
                    <Mail className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Phone className="w-5 h-5 text-blue-600" />
                  )}
                  <div>
                    <div className="text-sm text-gray-500">
                      {isEmail(job.contactInfo) ? 'البريد الإلكتروني' : 'معلومات التواصل'}
                    </div>
                    <div className="font-medium">{job.contactInfo}</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">لا يوجد معلومات تواصل متاحة</div>
              )}
            </div>
          </div>
          {user && user.id !== job.userId && job.status === 'Open' && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg text-lg py-3 mt-4" onClick={() => setShowApplyModal(true)}>
              تقديم طلب
            </Button>
          )}
          {/* Modal for sending application message */}
          {showApplyModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
              <div className="bg-background dark:bg-gray-900 rounded-2xl p-8 max-w-lg w-full relative border border-border">
                <button 
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedFile(null);
                    setMessageContent('');
                  }} 
                  className="absolute left-4 top-4 text-2xl text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  ×
                </button>

                <h2 className="text-xl font-bold mb-6 text-foreground">تقديم طلب على وظيفة {job.title}</h2>
                
                <form 
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSending(true);
                    try {
                      const jobUrl = `${window.location.origin}/jobs/${job.id}`;
                      const formattedMessage = 
                        `[وظيفة: ${job.title}](${jobUrl})\n` +
                        `الشركة: ${job.companyName}\n` +
                        `الموقع: ${job.location}\n` +
                        `-----------------\n` +
                        messageContent;

                      if (selectedFile) {
                        const formData = new FormData();
                        formData.append('file', selectedFile);
                        formData.append('ReceiverId', jobOwner.id.toString());
                        formData.append('Subject', `تقديم طلب على وظيفة ${job.title}`);
                        formData.append('Content', formattedMessage);

                        await axios.post('/Message/with-file', formData, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        });
                      } else {
                        await messageService.sendMessage({
                          receiverId: jobOwner.id,
                          subject: `تقديم طلب على وظيفة ${job.title}`,
                          content: formattedMessage,
                        });
                      }

                      toast.success('تم إرسال الطلب بنجاح');
                      setShowApplyModal(false);
                      setMessageContent('');
                      setSelectedFile(null);
                    } catch (err) {
                      console.error('Error sending application:', err);
                      toast.error('فشل إرسال الطلب');
                    } finally {
                      setIsSending(false);
                    }
                  }}
                >
                  <div>
                    <label className="block mb-2 font-semibold text-foreground">محتوى الرسالة</label>
                    <Textarea
                      className="w-full bg-background text-foreground border-input"
                      rows={5}
                      value={messageContent}
                      onChange={e => setMessageContent(e.target.value)}
                      required
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>

                  <div className="flex flex-row-reverse bg-muted rounded-xl px-3 py-2 gap-2">
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50"
                      disabled={isSending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;

                        const file = files[0];
                        const maxSize = 10 * 1024 * 1024; // 10MB

                        if (file.size > maxSize) {
                          toast.error('حجم الملف يجب أن يكون أقل من 10 ميجابايت');
                          return;
                        }

                        setSelectedFile(file);
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-muted-foreground hover:text-foreground rounded-full w-9 h-9 flex items-center justify-center"
                      aria-label="إرفاق ملف"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>

                    {selectedFile && (
                      <div className="flex-1 text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>تنبيه:</strong> بمجرد الضغط على زر الإرسال، سيتم إرسال رسالتك والملف المرفق مباشرة إلى صاحب العمل. تأكد من مراجعة المحتوى قبل الإرسال.
                    </p>
                  </div>
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