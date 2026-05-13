import React from 'react';

const categoryPath = (category) => `/products/${(category.slug || category.name).toLowerCase()}`;

const CategoryItem = ({
  category,
  isMobile = false,
  isOpen = false,
  onNavigate,
  onToggle,
  onActivate,
  onMouseLeave,
}) => {
  const hasChildren = category.children?.length > 0;

  if (isMobile) {
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <div className="flex items-center">
          <button
            type="button"
            className="flex-1 cursor-pointer px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
            onClick={() => onNavigate(categoryPath(category))}
          >
            {category.name}
          </button>
          {hasChildren && (
            <button
              type="button"
              className="cursor-pointer px-4 py-3 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
              onClick={() => onToggle(category._id)}
            >
              {isOpen ? 'Thu gọn' : 'Mở'}
            </button>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="bg-gray-50 py-1">
            {category.children.map((child) => (
              <button
                key={child._id}
                type="button"
                className="block w-full cursor-pointer px-6 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-[#d70018]"
                onClick={() => onNavigate(categoryPath(child))}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="block w-full cursor-pointer rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#d70018]"
      onMouseEnter={(event) => onActivate(category, event.currentTarget)}
      onMouseLeave={onMouseLeave}
      onClick={(event) => {
        if (hasChildren) {
          onActivate(category, event.currentTarget);
        }
        onNavigate(categoryPath(category));
      }}
    >
      {category.name}
    </button>
  );
};

export default CategoryItem;
