import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { serviceService } from "@/services/serviceService";
import { userService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, MapPin, MessageCircle } from "lucide-react";

const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const serviceData = await serviceService.getServiceById(id!);
      setService(serviceData);
      if (serviceData?.userId) {
        const ownerData = await userService.getUserById(serviceData.userId);
        setOwner(ownerData.data || ownerData);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>;
  if (!service) return <div className="text-center py-8">لم يتم العثور على الخدمة</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      {/* Header */}
      <div className="w-full bg-blue-100 rounded-2xl p-8 max-w-5xl mx-auto mb-8 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-white rounded-full p-5 shadow flex items-center justify-center">
            <svg className="w-14 h-14 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5v-15a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v15m-15 0h15m-15 0a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2" /></svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-800 mb-2">{service.title}</h1>
            <div className="flex gap-3 text-gray-500 mt-2">
              <span className="flex items-center gap-1"><MapPin className="w-5 h-5" />{service.location}</span>
              <span>•</span>
              <span>{service.contactInfo}</span>
            </div>
          </div>
        </div>
        {user?.id === service.userId && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/services/edit/${service.id}`)}>
              <Edit className="w-5 h-5" />
            </Button>
            <Button variant="destructive" onClick={() => {/* حذف الخدمة */}}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* شبكة معلومات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs mb-1">السعر</span>
          <span className="font-bold text-blue-700 text-lg">{service.price} ₪</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs mb-1">نوع الخدمة</span>
          <span className="font-bold text-blue-700 text-lg">خدمة</span>
        </div>
        {/* أضف المزيد إذا أردت */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {/* صندوق جانبي */}
        <div className="col-span-1 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          {owner?.profilePicture ? (
            <img src={owner.profilePicture} alt="صورة المالك" className="w-24 h-24 rounded-full object-cover mb-2" />
          ) : (
            <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold text-blue-700 mb-2">
              {owner?.firstName?.[0] || ''}{owner?.lastName?.[0] || '?'}
            </div>
          )}
          <div className="font-bold text-blue-700 mb-1 text-lg">{owner?.firstName} {owner?.lastName}</div>
          <div className="text-gray-500 text-sm mb-1">{owner?.email}</div>
          <div className="text-gray-500 text-sm mb-4">{owner?.phoneNumber}</div>
          <div className="w-full border-t my-2" />
          <div className="text-blue-800 font-semibold mb-2">معلومات التواصل</div>
          <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
            <Mail className="w-4 h-4" /> {service.contactInfo}
          </div>
          <Link
            to={`/chat?user=${owner?.id}`}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 font-bold shadow transition text-lg"
          >
            <MessageCircle className="w-5 h-5" />
            تواصل مع صاحب الخدمة
          </Link>
        </div>
        {/* تفاصيل الخدمة */}
        <div className="col-span-3 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">وصف الخدمة</h2>
          <p className="text-gray-700 mb-6">{service.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage; 