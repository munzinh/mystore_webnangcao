import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaRegStar, FaStar, FaTimes } from "react-icons/fa";

const SURVEY_KEY = "mystoreRecommendationSurvey";
const SURVEY_TARGET = 20;

const defaultForm = {
    usefulness: "",
    accuracy: 4,
    discovery: "",
    comment: "",
};

const readSurvey = () => {
    try {
        return JSON.parse(localStorage.getItem(SURVEY_KEY)) || { responses: [], dismissed: false };
    } catch {
        return { responses: [], dismissed: false };
    }
};

const RecommendationSurveyPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [surveyData, setSurveyData] = useState({ responses: [], dismissed: false });

    const responseCount = surveyData.responses.length;
    const isCompleted = responseCount >= SURVEY_TARGET;
    const progress = useMemo(
        () => Math.min(100, Math.round((responseCount / SURVEY_TARGET) * 100)),
        [responseCount]
    );
    const canSubmit = form.usefulness && form.discovery;

    useEffect(() => {
        const stored = readSurvey();
        setSurveyData(stored);

        if (stored.dismissed || stored.responses.length >= SURVEY_TARGET) return undefined;

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    const persistSurvey = (nextData) => {
        setSurveyData(nextData);
        localStorage.setItem(SURVEY_KEY, JSON.stringify(nextData));
    };

    const handleClose = () => {
        const nextData = { ...surveyData, dismissed: true };
        persistSurvey(nextData);
        setIsVisible(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!canSubmit || isCompleted) return;

        const response = {
            ...form,
            createdAt: new Date().toISOString(),
        };
        const nextData = {
            dismissed: false,
            responses: [...surveyData.responses, response].slice(0, SURVEY_TARGET),
        };

        persistSurvey(nextData);
        setForm(defaultForm);
        setIsVisible(false);
        toast.success("Cảm ơn bạn đã góp ý cho tính năng gợi ý sản phẩm");
    };

    if (!isVisible || isCompleted) return null;

    return (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/45 px-4 py-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[460px] rounded-2xl border border-gray-100 bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#d70018]">
                            Khảo sát nhanh
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                            Gợi ý sản phẩm có hữu ích không?
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Đóng khảo sát"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                <div className="space-y-5 px-5 py-4">
                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">Mục tiêu khảo sát</span>
                            <span className="font-semibold text-[#d70018]">{responseCount}/{SURVEY_TARGET} người</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-[#d70018] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold text-gray-800">
                            Bạn đánh giá tính năng gợi ý sản phẩm thế nào?
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {["Hữu ích", "Bình thường", "Chưa hữu ích"].map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setForm((current) => ({ ...current, usefulness: option }))}
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                        form.usefulness === option
                                            ? "border-[#d70018] bg-[#fff1f2] text-[#d70018]"
                                            : "border-gray-200 text-gray-700 hover:border-[#d70018]/50"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold text-gray-800">
                            Mức độ đúng với nhu cầu của bạn
                        </p>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((score) => (
                                <button
                                    key={score}
                                    type="button"
                                    onClick={() => setForm((current) => ({ ...current, accuracy: score }))}
                                    className="text-[#f59e0b] transition hover:scale-105"
                                    aria-label={`Đánh giá ${score} sao`}
                                >
                                    {score <= form.accuracy ? <FaStar size={24} /> : <FaRegStar size={24} />}
                                </button>
                            ))}
                            <span className="ml-1 text-sm font-medium text-gray-600">{form.accuracy}/5</span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold text-gray-800">
                            Gợi ý này có giúp bạn tìm sản phẩm nhanh hơn không?
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {["Có", "Không"].map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setForm((current) => ({ ...current, discovery: option }))}
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                        form.discovery === option
                                            ? "border-[#d70018] bg-[#fff1f2] text-[#d70018]"
                                            : "border-gray-200 text-gray-700 hover:border-[#d70018]/50"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor="survey-comment">
                            Góp ý thêm
                        </label>
                        <textarea
                            id="survey-comment"
                            value={form.comment}
                            onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                            rows={3}
                            maxLength={180}
                            placeholder="Ví dụ: gợi ý đúng hơn theo giá, thương hiệu, sản phẩm đã xem..."
                            className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-[#d70018]"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        Để sau
                    </button>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="rounded-lg bg-[#d70018] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a7091a] disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        Gửi khảo sát
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecommendationSurveyPopup;
