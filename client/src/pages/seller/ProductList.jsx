import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import ProductTable from '../../components/seller/ProductTable';
import ProductFilter from '../../components/seller/ProductFilter';
import ProductModal from '../../components/seller/ProductModal';
import ProductForm from '../../components/seller/ProductForm';

const ProductList = () => {
    const { products, axios, fetchProducts } = useAppContext();

    // Auto load data if products empty
    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [])

    // Filter & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const toggleStock = async (id, inStock) => {
        try {
            const { data } = await axios.post('/api/product/stock', { id, inStock });
            if (data.success) {
                fetchProducts();
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (formData) => {
        try {
            setLoadingEdit(true);
            const { data } = await axios.post('/api/product/edit', formData);
            if (data.success) {
                toast.success(data.message);
                setIsEditModalOpen(false);
                setEditingProduct(null);
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleDeleteClick = (id) => {
        setProductToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoadingDelete(true);
            const { data } = await axios.post('/api/product/delete', { id: productToDelete });
            if (data.success) {
                toast.success(data.message);
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingDelete(false);
        }
    };

    // Derived Data
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCategory = filterCategory ? p.category === filterCategory : true;
            let matchStatus = true;
            if (filterStatus === 'inStock') matchStatus = p.inStock === true;
            if (filterStatus === 'outOfStock') matchStatus = p.inStock === false;

            return matchSearch && matchCategory && matchStatus;
        }).sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.offerPrice - b.offerPrice;
                case 'price-desc': return b.offerPrice - a.offerPrice;
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'date-desc':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }, [products, searchQuery, filterCategory, filterStatus, sortBy]);

    return (
        <div className="flex-1 h-[95vh] overflow-y-scroll flex flex-col pt-4 md:pt-10 px-4 md:px-10 pb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Danh sách sản phẩm</h2>
            </div>

            <ProductFilter
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                filterCategory={filterCategory} setFilterCategory={setFilterCategory}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                sortBy={sortBy} setSortBy={setSortBy}
            />

            <ProductTable
                products={filteredProducts}
                onToggleStock={toggleStock}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* Edit Modal */}
            <ProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Sửa sản phẩm"
            >
                {editingProduct && (
                    <ProductForm
                        initialData={editingProduct}
                        onSubmit={handleEditSubmit}
                        loading={loadingEdit}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                )}
            </ProductModal>

            {/* Delete Confirm Modal */}
            <ProductModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Xác nhận xóa"
            >
                <div className="text-center">
                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <h3 className="mb-5 text-lg font-normal text-gray-500">Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.</h3>
                    <div className="flex justify-center gap-4">
                        <button onClick={confirmDelete} disabled={loadingDelete} className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center transition">
                            {loadingDelete ? 'Đang xóa...' : 'Đồng ý xóa'}
                        </button>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 transition">
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            </ProductModal>
        </div>
    );
};

export default ProductList;