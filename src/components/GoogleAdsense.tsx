import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdsenseProps {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
}

const GoogleAdsense: React.FC<GoogleAdsenseProps> = ({ adSlot, adFormat = 'auto', style }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Error loading Google AdSense:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-7931826501154545"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
};

export default GoogleAdsense; 