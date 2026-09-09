import React, { useState, useEffect } from 'react';
import { Wifi, ArrowLeft } from 'lucide-react';
import { ApiService } from '../services/api';

interface PromoBannerProps {
  onExplore: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onExplore }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    ApiService.getBanners().then((items) => {
      if (mounted && Array.isArray(items) && items.length > 0) {
        setBanners(items);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length > 0) {
    const currentBanner = banners[currentIndex];
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1D1924] shadow-lg group">
        <div
          onClick={onExplore}
          className="cursor-pointer block relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden"
        >
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title || 'إعلان نجاز'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          {currentBanner.title && (
            <div className="absolute bottom-3 right-4 left-4 text-right">
              <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow">
                {currentBanner.title}
              </h4>
              {currentBanner.subtitle && (
                <p className="text-[11px] text-[#A99DB7] drop-shadow">
                  {currentBanner.subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`انتقل للإعلان ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-5 bg-[#9B5CFF]' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#26202F] via-[#1D1924] to-[#26202F] border border-[#9B5CFF]/20 p-4 shadow-lg">
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#9B5CFF]/10 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#9B5CFF]/25 to-[#22D3EE]/20 border border-[#9B5CFF]/30 flex items-center justify-center text-[#22D3EE] shrink-0">
            <Wifi size={22} className="text-[#22D3EE]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F4EFFA]">عروض وخدمات نجاز كارد الحية</h3>
              <span className="text-[10px] bg-[#34D399]/20 text-[#34D399] font-bold px-1.5 py-0.5 rounded">
                مباشر
              </span>
            </div>
            <p className="text-xs text-[#A99DB7] mt-0.5 line-clamp-1">
              شحن الألعاب والبطاقات الرقمية والاشتراكات وتسليم آلي فوري 24/7
            </p>
          </div>
        </div>

        <button
          onClick={onExplore}
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#9B5CFF] hover:text-[#C084FC] bg-[#9B5CFF]/10 hover:bg-[#9B5CFF]/20 px-3 py-2 rounded-xl transition border border-[#9B5CFF]/20 active:scale-95"
        >
          <span>تصفح</span>
          <ArrowLeft size={14} />
        </button>
      </div>
    </div>
  );
};
