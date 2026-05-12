import React from 'react'
import { categories as fallbackCategories } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext';

const normalize = (value = '') => value.toString().toLowerCase();

const getCategoryImage = (category) => {
  const match = fallbackCategories.find(item =>
    normalize(item.path) === normalize(category.slug) ||
    normalize(item.path) === normalize(category.name) ||
    normalize(item.text) === normalize(category.name)
  );

  return match?.image;
};

const Categories = () => {
  const navigate = useNavigate();
  const { categories, isCategoriesLoading } = useAppContext();

  const visibleCategories = categories.filter(category => !category.parentId);

  return (
    <div className='bg-white rounded-xl shadow-sm p-2.5 w-full h-full flex flex-col'>
      <p className='text-base font-bold mb-2 px-2 text-gray-800'>Danh mục</p>
      
      <div className='flex flex-col gap-0.5'>
        {isCategoriesLoading && (
          <p className='px-2 py-2 text-[13px] text-gray-400'>Đang tải...</p>
        )}

        {!isCategoriesLoading && visibleCategories.map((category) => {
          const image = getCategoryImage(category);

          return (
          <div
            key={category._id}
            className='group cursor-pointer px-2 py-2 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors'
            onClick={() => {
              navigate(`/products/${(category.slug || category.name).toLowerCase()}`);
              window.scrollTo(0, 0);
            }}
          >
            {image ? (
              <img src={image} alt="" className='w-5 h-5 object-contain' />
            ) : (
              <span className='w-5 h-5 rounded bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center'>
                {category.name?.charAt(0)}
              </span>
            )}
            <p className='text-[13px] font-medium text-gray-700 group-hover:text-[#d70018] group-hover:font-bold transition-all'>{category.name}</p>
          </div>
        )})}
      </div>
    </div>
  )
}

export default Categories
