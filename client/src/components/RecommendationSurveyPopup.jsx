import { useEffect, useState } from "react";
import { FaArrowRight, FaTimes } from "react-icons/fa";

export const SURVEY_URL = "https://forms.gle/Zfbgm57Wc3QKDF6N6";
export const OPEN_SURVEY_POPUP_EVENT = "openRecommendationSurveyPopup";
export const SURVEY_AFTER_PURCHASE_KEY = "mystoreShowSurveyAfterPurchase";

const RecommendationSurveyPopup = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1200);

        const openPopup = () => setIsVisible(true);
        window.addEventListener(OPEN_SURVEY_POPUP_EVENT, openPopup);

        return () => {
            clearTimeout(timer);
            window.removeEventListener(OPEN_SURVEY_POPUP_EVENT, openPopup);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleOpenSurvey = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-gray-950/55 px-4 py-6 backdrop-blur-[2px]">
            <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Đóng khảo sát"
                >
                    <FaTimes size={14} />
                </button>

                <div className="bg-[#d70018] px-6 pb-7 pt-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/75">
                        Khảo sát nhanh
                    </p>
                    <h2 className="mt-2 max-w-[310px] text-2xl font-bold leading-tight">
                        Góp ý để MyStore gợi ý sản phẩm tốt hơn
                    </h2>
                </div>

                <div className="px-6 py-5">
                    <p className="text-sm leading-6 text-gray-600">
                        Chia sẻ cảm nhận của bạn về độ phù hợp và mức độ hữu ích của các sản phẩm được gợi ý.
                    </p>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                    <a
                        href={SURVEY_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleOpenSurvey}
                        className="mx-auto flex w-full max-w-[260px] items-center justify-center gap-2 rounded-xl bg-[#d70018] px-5 py-3.5 text-base font-bold text-white shadow-[0_12px_28px_rgba(215,0,24,0.3)] transition hover:-translate-y-0.5 hover:bg-[#b80014] hover:shadow-[0_16px_34px_rgba(215,0,24,0.38)]"
                    >
                        Làm khảo sát
                        <FaArrowRight size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RecommendationSurveyPopup;
