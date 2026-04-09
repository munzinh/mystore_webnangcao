import React from 'react'
import { assets, categories } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Categories = () => {
  const navigate = useNavigate();

  return (
    /* Bỏ: bg-white, border, rounded-lg, shadow-sm. 
       Chỉ giữ lại: p-4 (để nội dung không sát lề) và kích thước. */
    <div className='p-4 w-full md:w-[280px] shrink-0'>
      <p className='text-xl font-bold mb-4 border-b pb-2'>Phân loại</p>
      
      <div className='flex flex-col gap-1'>
        {categories.map((category, index) => (
          <div
            key={index}
            /* Cập nhật class hover: chỉ đổi màu chữ và nền nhẹ, không bóng đổ */
            className='group cursor-pointer px-3 py-2.5 rounded-md flex items-center gap-3 hover:bg-orange-50 hover:text-orange-600 transition-all'
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              window.scrollTo(0, 0);
            }}
          >
            <img src={category.image} alt="" className='w-5 h-5 object-contain group-hover:scale-110 transition' />
            <p className='text-sm font-medium'>{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories
