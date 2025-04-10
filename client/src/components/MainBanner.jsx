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

const MainBanner = () => {
  return (
    <div className="flex flex-col md:flex-row gap-5 max-w-[1280px] mx-auto px-2">
      
      {/* Cột trái: Menu danh mục sản phẩm */}
      <div className="hidden lg:block w-[225px] bg-white rounded shadow mb-0 pt-0">
        <ul className="space-y-2 text-sm font-medium text-gray-700">
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdSmartphone size={24} />Điện thoại, Tablet</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdLaptop size={24} />Laptop</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdHeadphones size={24} />Âm thanh, Mic thu âm</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdWatch size={24} />Đồng hồ, Camera</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdHome size={24} />Đồ gia dụng</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdCable size={24} />Phụ kiện</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdComputer size={24} />PC, Màn hình, Máy in</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdTv size={24} />Tivi</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdAutorenew size={24} />Thu cũ đổi mới</li>
          <li className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#f3f4f6] hover:text-[#d70018] transition mb-0">
            <MdArticle size={24} />Tin công nghệ</li>
        </ul>
      </div>

      {/* Banner chính ở giữa */}
      <div className="flex-1 relative">
        <img 
          src={assets.main_banner_bg} 
          alt="banner" 
          className="w-full h-auto rounded-lg shadow object-cover"
        />
      </div>

      {/* Cột phải: Các banner phụ */}
      <div className="hidden md:flex flex-col gap-4 w-[230px]">
        <img src={assets.bn_m55_5g} alt="Side Banner 1" className="w-full rounded shadow"/>
        <img src={assets.bn_mb_m4} alt="Side Banner 2" className="w-full rounded shadow"/>
        <img src={assets.s_student} alt="Side Banner 3" className="w-full rounded shadow"/>
      </div>
    </div>
  );
};

export default MainBanner;
