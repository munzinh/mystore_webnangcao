import React from 'react';

const categoryPath = (category) => `/products/${(category.slug || category.name).toLowerCase()}`;

const CategoryPopup = ({ category, position, onNavigate, onMouseEnter, onMouseLeave }) => {
  if (!category?.children?.length || !position) return null;

  return (
    <div
      className="absolute z-50 w-[260px] max-h-[320px] overflow-y-auto rounded-lg border border-gray-100 bg-white py-2 shadow-lg"
      style={{
        top: position.top,
        left: position.left,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {category.children.map((child) => (
        <button
          key={child._id}
          type="button"
          className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#d70018]"
          onClick={() => onNavigate(categoryPath(child))}
        >
          {child.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryPopup;
