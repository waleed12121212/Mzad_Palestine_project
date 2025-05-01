
import React from "react";
import { ExternalLink } from "lucide-react";

interface AdCardProps {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  linkText?: string;
  gradient?: boolean;
}

const AdCard: React.FC<AdCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  link,
  linkText = "عرض التفاصيل",
  gradient = true
}) => {
  return (
    <div className="neo-card rounded-lg overflow-hidden transition-all duration-300 relative h-64 group">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover absolute inset-0 transform transition-transform duration-700 group-hover:scale-105"
      />
      
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
      )}
      
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 rtl">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/80 mb-4 line-clamp-2">{description}</p>
        <a 
          href={link}
          className="inline-flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-md transition-colors self-start"
        >
          <span>{linkText}</span>
          <ExternalLink className="h-4 w-4 mr-2" />
        </a>
      </div>
    </div>
  );
};

export default AdCard;
