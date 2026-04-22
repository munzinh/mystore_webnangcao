import { useState, useEffect } from "react";

const images = [
  "/images/bn1.png",
  "/images/bn2.png",
  "/images/bn3.png"
];

export default function MainBanner() {
  const [index, setIndex] = useState(0);

  // ⏱ Auto chạy chậm hơn (5 giây)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, 5000); // 👈 chỉnh số này để nhanh/chậm

    return () => clearInterval(interval);
  }, []);

  // 👉 nút next
  const nextSlide = () => {
    setIndex(prev => (prev + 1) % images.length);
  };

  // 👉 nút prev
  const prevSlide = () => {
    setIndex(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full">
      
      {/* Ảnh */}
      <img
        src={images[index]}
        alt="banner"
        className="w-full h-[250px] md:h-[350px] object-cover rounded-xl shadow-sm"
      />

      {/* Nút trái */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 transition-colors text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md"
      >
        ‹
      </button>

      {/* Nút phải */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 transition-colors text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md"
      >
        ›
      </button>

      {/* Dot */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full cursor-pointer ${
              i === index ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>

    </div>
  );
}