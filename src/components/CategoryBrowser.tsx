import React, { useState, useEffect } from 'react';
import { Category, ServiceItem } from '../types';
import { ApiService } from '../services/api';
import {
  Folder,
  Layers,
  Search,
  ChevronLeft,
  Sparkles,
  Zap,
  Tag,
  Loader2,
  RefreshCw,
  Home,
  ChevronRight,
} from 'lucide-react';
import { AppColors } from '../theme/colors';

interface CategoryBrowserProps {
  initialCategoryId?: number | null;
  onSelectService: (service: ServiceItem) => void;
  onClearInitialCategory?: () => void;
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  initialCategoryId,
  onSelectService,
  onClearInitialCategory,
}) => {
  // Navigation stack of categories (breadcrumbs)
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ServiceItem[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [allServicesCache, setAllServicesCache] = useState<ServiceItem[] | null>(null);

  const currentCategory = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;

  // Load categories and services for current level
  useEffect(() => {
    loadLevelData(currentCategory?.id ?? null);
  }, [currentCategory?.id]);

  // Handle external initialCategoryId navigation
  useEffect(() => {
    if (initialCategoryId) {
      loadInitialCategory(initialCategoryId);
    }
  }, [initialCategoryId]);

  const loadInitialCategory = async (catId: number) => {
    setLoading(true);
    try {
      // Fetch category tree or find it
      const rootCats = await ApiService.getCategories(null);
      const match = rootCats.find((c) => c.id === catId);
      if (match) {
        setCategoryPath([match]);
      } else {
        // Try direct fetch
        const targetSub = await ApiService.getCategories(catId);
        const dummy: Category = { id: catId, name: 'القسم المختار' };
        setCategoryPath([dummy]);
        setCategories(targetSub);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLevelData = async (parentId: number | null) => {
    setLoading(true);
    try {
      const [cats, srvs] = await Promise.all([
        ApiService.getCategories(parentId),
        parentId ? ApiService.getServices(parentId) : Promise.resolve([]),
      ]);
      setCategories(cats);
      setServices(srvs);
    } catch (e) {
      console.error('Failed loading categories/services for level', parentId, e);
    } finally {
      setLoading(false);
    }
  };

  const handlePushCategory = (cat: Category) => {
    setSearchQuery('');
    setCategoryPath((prev) => [...prev, cat]);
    if (onClearInitialCategory) {
      onClearInitialCategory();
    }
  };

  const handleNavigateToBreadcrumb = (index: number) => {
    setSearchQuery('');
    if (index === -1) {
      setCategoryPath([]);
    } else {
      setCategoryPath((prev) => prev.slice(0, index + 1));
    }
    if (onClearInitialCategory) {
      onClearInitialCategory();
    }
  };

  // Perform search across all services
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }

    let isMounted = true;
    const executeSearch = async () => {
      setSearchLoading(true);
      try {
        let pool = allServicesCache;
        if (!pool) {
          pool = await ApiService.getServices(null);
          if (isMounted) setAllServicesCache(pool);
        }
        const matches = pool.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q))
        );
        if (isMounted) setSearchResults(matches);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setSearchLoading(false);
      }
    };

    const timer = setTimeout(executeSearch, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, allServicesCache]);

  const handleSelectServiceWithDetail = async (service: ServiceItem) => {
    setDetailLoading(service.id);
    try {
      const detailed = await ApiService.getServiceDetail(service.id);
      onSelectService(detailed);
    } catch {
      onSelectService(service);
    } finally {
      setDetailLoading(null);
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Top Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في أكثر من 2,000 خدمة وباقة فورية..."
          className="w-full bg-[#1D1924] border border-white/10 rounded-2xl py-3 pr-11 pl-4 text-xs sm:text-sm text-[#F4EFFA] placeholder-[#6F637B] focus:outline-none focus:border-[#9B5CFF] transition shadow-inner"
        />
        <Search
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F637B]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#A99DB7] hover:text-white px-2 py-0.5 rounded-md bg-[#26202F] transition"
          >
            مسح
          </button>
        )}
      </div>

      {/* Navigation Breadcrumb hierarchy */}
      {!isSearching && categoryPath.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 rounded-2xl bg-[#1D1924] border border-white/5 text-xs no-scrollbar">
          <button
            onClick={() => handleNavigateToBreadcrumb(-1)}
            className="flex items-center gap-1 text-[#9B5CFF] hover:text-[#C084FC] shrink-0 font-bold transition p-1"
          >
            <Home size={14} />
            <span>الرئيسية</span>
          </button>

          {categoryPath.map((cat, idx) => {
            const isLast = idx === categoryPath.length - 1;
            return (
              <React.Fragment key={cat.id}>
                <ChevronLeft size={13} className="text-[#6F637B] shrink-0" />
                <button
                  onClick={() => !isLast && handleNavigateToBreadcrumb(idx)}
                  disabled={isLast}
                  className={`shrink-0 font-semibold p-1 transition ${
                    isLast
                      ? 'text-[#F4EFFA] font-bold cursor-default'
                      : 'text-[#A99DB7] hover:text-[#9B5CFF]'
                  }`}
                >
                  {cat.name}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Active Search Results View */}
      {isSearching ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F4EFFA] flex items-center gap-2">
              <Sparkles size={16} className="text-[#22D3EE]" />
              نتائج البحث عن: "{searchQuery}"
            </h3>
            <span className="text-xs text-[#A99DB7]">
              {searchLoading ? 'جاري البحث...' : `${searchResults.length} نتيجة`}
            </span>
          </div>

          {searchLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#A99DB7] gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#9B5CFF]" />
              <span className="text-xs">جاري البحث في قاعدة الخدمات...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 bg-[#1D1924] rounded-2xl border border-white/5 text-[#A99DB7] space-y-2">
              <p className="text-sm font-semibold">لم نتمكن من العثور على خدمات مطابقة</p>
              <p className="text-xs text-[#6F637B]">جرب كتابة اسم اللعبة أو الخدمة بشكل مختصر</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResults.slice(0, 60).map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleSelectServiceWithDetail(service)}
                  className="cursor-pointer flex items-start justify-between p-3.5 rounded-2xl bg-[#1D1924] hover:bg-[#26202F] border border-white/5 hover:border-[#9B5CFF]/40 transition group"
                >
                  <div className="flex gap-3 flex-1 pl-2">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#26202F] border border-white/5"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="space-y-1 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-[#F4EFFA] group-hover:text-[#9B5CFF] transition line-clamp-1">
                        {service.name}
                      </span>
                      {service.description && (
                        <p className="text-xs text-[#A99DB7] line-clamp-1 leading-relaxed">
                          {service.description}
                        </p>
                      )}
                      <div className="pt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-md border border-[#34D399]/20">
                          <Tag size={11} />
                          ${Number(service.price).toFixed(2)}
                        </span>
                        <span className="text-[11px] text-[#A99DB7] flex items-center gap-1">
                          <Zap size={11} className="text-[#FBBF24]" />
                          فوري
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={detailLoading === service.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectServiceWithDetail(service);
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#9B5CFF]/15 text-[#9B5CFF] group-hover:bg-[#9B5CFF] group-hover:text-white font-bold text-xs transition border border-[#9B5CFF]/30 active:scale-95 disabled:opacity-50"
                  >
                    {detailLoading === service.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      'طلب'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#A99DB7] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#9B5CFF]" />
          <span className="text-xs">جاري الاتصال وجلب الأقسام والخدمات الحية...</span>
        </div>
      ) : (
        <>
          {/* Subcategories / Root Categories Grid */}
          {categories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F4EFFA] flex items-center gap-2">
                  <Layers size={16} className="text-[#9B5CFF]" />
                  {currentCategory ? `الأقسام داخل ${currentCategory.name}` : 'الأقسام الرئيسية'}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A99DB7]">{categories.length} قسم</span>
                  <button
                    onClick={() => loadLevelData(currentCategory?.id ?? null)}
                    title="تحديث البيانات"
                    className="p-1 rounded-lg text-[#6F637B] hover:text-[#9B5CFF] transition"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat, idx) => {
                  const hasImage = Boolean(cat.image && cat.image.length > 0);
                  const iconColor = AppColors.iconColorFor(idx);

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handlePushCategory(cat)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#1D1924] hover:bg-[#26202F] border border-white/5 hover:border-[#9B5CFF]/30 transition group text-right active:scale-98 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                          style={{
                            backgroundColor: `${iconColor}15`,
                            color: iconColor,
                          }}
                        >
                          {hasImage ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Folder size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#F4EFFA] group-hover:text-white line-clamp-1 block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-[#A99DB7]">تصفح الخدمات</span>
                        </div>
                      </div>
                      <ChevronLeft size={15} className="text-[#6F637B] group-hover:text-[#9B5CFF] transition shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Services Grid under current category */}
          {services.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F4EFFA] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#22D3EE]" />
                  {currentCategory ? `باقات وخدمات: ${currentCategory.name}` : 'الخدمات المتوفرة'}
                </h3>
                <span className="text-xs text-[#A99DB7]">{services.length} باقة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleSelectServiceWithDetail(service)}
                    className="cursor-pointer flex items-start justify-between p-3.5 rounded-2xl bg-[#1D1924] hover:bg-[#26202F] border border-white/5 hover:border-[#9B5CFF]/40 transition group"
                  >
                    <div className="flex gap-3 flex-1 pl-2 min-w-0">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#26202F] border border-white/5"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-[#F4EFFA] group-hover:text-[#9B5CFF] transition line-clamp-1 block">
                          {service.name}
                        </span>
                        {service.description && (
                          <p className="text-xs text-[#A99DB7] line-clamp-1 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                        <div className="pt-1 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-md border border-[#34D399]/20">
                            <Tag size={11} />
                            ${Number(service.price).toFixed(2)}
                          </span>
                          <span className="text-[11px] text-[#A99DB7] flex items-center gap-1">
                            <Zap size={11} className="text-[#FBBF24]" />
                            فوري
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={detailLoading === service.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectServiceWithDetail(service);
                      }}
                      className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#9B5CFF]/15 text-[#9B5CFF] group-hover:bg-[#9B5CFF] group-hover:text-white font-bold text-xs transition border border-[#9B5CFF]/30 active:scale-95 disabled:opacity-50"
                    >
                      {detailLoading === service.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        'طلب'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if both categories and services are empty */}
          {categories.length === 0 && services.length === 0 && (
            <div className="text-center py-14 bg-[#1D1924] rounded-2xl border border-white/5 text-[#A99DB7] space-y-3">
              <Folder size={36} className="mx-auto text-[#6F637B]" />
              <p className="text-sm font-semibold">لا توجد خدمات أو أقسام فرعية هنا حالياً</p>
              {categoryPath.length > 0 && (
                <button
                  onClick={() => handleNavigateToBreadcrumb(-1)}
                  className="text-xs text-[#9B5CFF] hover:underline font-bold"
                >
                  العودة للأقسام الرئيسية
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
