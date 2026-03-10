import React from 'react';

const ProductModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl outline-none my-8 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h3 className="text-xl font-medium text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Đóng modal</span>
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
