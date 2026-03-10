import React from 'react';
import { assets } from '../assets/assets';
import {
  MdSmartphone,
  MdLaptop,
  MdHeadphones,
  MdWatch,
  MdHome,
  MdCable,
  MdComputer,
  MdTv,
  MdAutorenew,
  MdArticle,
} from 'react-icons/md';

import { useNavigate } from 'react-router-dom';

const MainBanner = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (path) => {
    navigate(`/products/${path.toLowerCase()}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 max-w-[1280px] mx-auto px-2 lg:h-[320px]">

      {/* Cột trái: Menu danh mục sản phẩm */}
      <div className="hidden lg:flex flex-col w-[200px] bg-white rounded shadow p-2 h-full">
        <ul className="flex flex-col justify-between h-full text-sm font-medium text-gray-700">
          <li
            onClick={() => handleCategoryClick('Mobile')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition"
          >
            <MdSmartphone size={24} /> Điện thoại, Tablet
          </li>
          <li
            onClick={() => handleCategoryClick('Laptop')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition"
          >
            <MdLaptop size={24} /> Laptop
          </li>
          <li
            onClick={() => handleCategoryClick('Âm thanh')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition"
          >
            <MdHeadphones size={24} /> Âm thanh, Mic thu âm
          </li>
          <li
            onClick={() => handleCategoryClick('Đồng hồ')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition"
          >
            <MdWatch size={24} /> Đồng hồ, Camera
          </li>
          <li
            onClick={() => handleCategoryClick('Đồ gia dụng')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition"
          >
            <MdHome size={24} /> Đồ gia dụng
          </li>
          <li
            onClick={() => handleCategoryClick('Tivi')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition"
          >
            <MdTv size={24} /> Tivi
          </li>
          <li
            onClick={() => handleCategoryClick('Màn hình')}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition"
          >
            <MdComputer size={24} /> Màn hình
          </li>
        </ul>
      </div>

      {/* Banner chính ở giữa */}
      <div className="flex-1 h-full">
        <img
          src={assets.main_banner_bg}
          alt="banner"
          className="w-full h-full rounded shadow object-cover"
        />
      </div>

    </div>
  );
};

export default MainBanner;
