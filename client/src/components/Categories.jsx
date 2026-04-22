import React from 'react'
import { assets, categories } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className='bg-white rounded-xl shadow-sm p-2.5 w-full h-full flex flex-col'>
      <p className='text-base font-bold mb-2 px-2 text-gray-800'>Danh mục</p>
      
      <div className='flex flex-col gap-0.5'>
        {categories.map((category, index) => (
          <div
            key={index}
            className='group cursor-pointer px-2 py-2 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors'
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              window.scrollTo(0, 0);
            }}
          >
            <img src={category.image} alt="" className='w-5 h-5 object-contain' />
            <p className='text-[13px] font-medium text-gray-700 group-hover:text-[#d70018] group-hover:font-bold transition-all'>{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories
