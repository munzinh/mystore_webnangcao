import React from 'react';
import { FiChevronUp } from 'react-icons/fi'; // Sử dụng icon mũi tên từ react-icons
import { FaClipboardList } from 'react-icons/fa';
import { OPEN_SURVEY_POPUP_EVENT } from './RecommendationSurveyPopup';

const ScrollToTop = () => {
    // Hàm xử lý cuộn lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Cuộn mượt mà
        });
    };

    const openSurveyPopup = () => {
        window.dispatchEvent(new Event(OPEN_SURVEY_POPUP_EVENT));
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-center gap-3">
            <button
                type="button"
                onClick={openSurveyPopup}
                className="group relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#2563eb] text-white shadow-lg transition-all duration-300 hover:bg-[#1d4ed8]"
                aria-label="Mở khảo sát gợi ý sản phẩm"
            >
                <FaClipboardList className="text-xl" />
                <span className="pointer-events-none absolute right-14 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
                    Khảo sát
                </span>
            </button>

            <button
                type="button"
                onClick={scrollToTop}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#d70018] text-white shadow-lg transition-all duration-300 hover:bg-red-700"
                aria-label="Cuộn lên đầu trang"
            >
                <FiChevronUp className="text-2xl" />
            </button>
        </div>
    );
};

export default ScrollToTop;
