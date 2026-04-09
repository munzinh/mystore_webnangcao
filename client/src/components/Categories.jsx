import React from 'react'
import { assets, categories } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Phân loại</p>
      <div className='flex flex-col mt-4 gap-2'>

        {categories.map((category, index) => (
          <div
            key={index}
            className='group cursor-pointer px-3 py-2 rounded-md flex items-center gap-3 hover:bg-gray-100 transition'
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              scrollTo(0, 0);
            }}
          >
            <img src={category.image} alt="" className='w-6 h-6 object-contain' />
            <p className='text-sm font-medium'>{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories
