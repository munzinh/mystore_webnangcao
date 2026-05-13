import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import CategoryItem from './CategoryItem';
import CategoryPopup from './CategoryPopup';

const DESKTOP_LIMIT = 10;
const POPUP_WIDTH = 260;
const POPUP_GAP = 8;

const CategorySidebar = ({ mobile = false }) => {
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMobileIds, setOpenMobileIds] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    let ignore = false;

    const fetchCategoryTree = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/category/tree');
        if (!ignore && data.success) {
          setCategories(data.tree || []);
        }
      } catch (error) {
        console.error('Fetch category tree error:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchCategoryTree();

    return () => {
      ignore = true;
    };
  }, [axios]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  const displayedCategories = useMemo(() => {
    if (mobile || expanded) return categories;
    return categories.slice(0, DESKTOP_LIMIT);
  }, [categories, expanded, mobile]);

  const navigateTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
    setDrawerOpen(false);
    setActiveCategory(null);
    setPopupPosition(null);
  };

  const activateCategory = (category, element) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    if (!category.children?.length) {
      setActiveCategory(null);
      setPopupPosition(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const shouldOpenLeft = rect.right + POPUP_GAP + POPUP_WIDTH > window.innerWidth;
    const left = shouldOpenLeft
      ? Math.max(8, rect.left - POPUP_GAP - POPUP_WIDTH)
      : rect.right + POPUP_GAP;

    setActiveCategory(category);
    setPopupPosition({
      top: Math.max(8, Math.min(rect.top, window.innerHeight - 340)),
      left,
    });
  };

  const closePopup = () => {
    setActiveCategory(null);
    setPopupPosition(null);
  };

  const scheduleClosePopup = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(closePopup, 120);
  };

  const keepPopupOpen = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const toggleMobileCategory = (id) => {
    setOpenMobileIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  if (mobile) {
    return (
      <>
        <button
          type="button"
          className="mb-3 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-gray-800 shadow-sm"
          onClick={() => setDrawerOpen(true)}
        >
          Danh mục sản phẩm
        </button>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/35"
              aria-label="Đóng danh mục"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86vw] max-w-[340px] overflow-y-auto bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-base font-bold text-gray-900">Danh mục</p>
                <button
                  type="button"
                  className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                  onClick={() => setDrawerOpen(false)}
                >
                  Đóng
                </button>
              </div>

              {loading ? (
                <p className="px-4 py-3 text-sm text-gray-400">Đang tải...</p>
              ) : (
                <div>
                  {categories.map((category) => (
                    <CategoryItem
                      key={category._id}
                      category={category}
                      isMobile
                      isOpen={!!openMobileIds[category._id]}
                      onNavigate={navigateTo}
                      onToggle={toggleMobileCategory}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative h-full w-full rounded-xl bg-white p-2.5 shadow-sm">
      <p className="mb-2 px-2 text-base font-bold text-gray-800">Danh mục</p>

      <div className="flex flex-col gap-1">
        {loading && <p className="px-3 py-2 text-sm text-gray-400">Đang tải...</p>}

        {!loading && displayedCategories.map((category) => (
          <CategoryItem
            key={category._id}
            category={category}
            onNavigate={navigateTo}
            onActivate={activateCategory}
            onMouseLeave={scheduleClosePopup}
          />
        ))}
      </div>

      {!loading && categories.length > DESKTOP_LIMIT && (
        <button
          type="button"
          className="mt-2 w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-semibold text-[#d70018] transition-colors hover:bg-red-50"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}

      <CategoryPopup
        category={activeCategory}
        position={popupPosition}
        onNavigate={navigateTo}
        onMouseEnter={keepPopupOpen}
        onMouseLeave={scheduleClosePopup}
      />
    </div>
  );
};

export default CategorySidebar;
