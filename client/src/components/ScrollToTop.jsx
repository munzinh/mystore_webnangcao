import React, { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi'; // Sử dụng icon mũi tên từ react-icons

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Kiểm tra độ cuộn của trang để ẩn/hiện nút
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Hàm xử lý cuộn lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Cuộn mượt mà
        });
    };

    return (
        <>
            {isVisible && (
                <div
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-[1000] cursor-pointer"
                >
                    <div className="bg-[#d70018] w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-red-700 transition-all duration-300 animate-bounce-subtle border-2 border-white">
                        <FiChevronUp className="text-2xl" />
                    </div>
                </div>
            )}
        </>
    );
};

export default ScrollToTop;