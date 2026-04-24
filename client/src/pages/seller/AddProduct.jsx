import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import ProductForm from '../../components/seller/ProductForm';

const AddProduct = () => {
    const { axios } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [formKey, setFormKey] = useState(Date.now());

    const onSubmitHandler = async (formData) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/product/add', formData);
            if (data.success) {
                toast.success(data.message);
                setFormKey(Date.now()); // reset form
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-slate-50 px-4 py-6">
            {/* Page header */}
            <div className="max-w-5xl mx-auto mb-6">
                <h1 className="text-xl font-bold text-slate-800">Thêm sản phẩm mới</h1>
                <p className="text-sm text-slate-500 mt-0.5">Điền đầy đủ thông tin để đăng bán sản phẩm</p>
            </div>
            <ProductForm key={formKey} onSubmit={onSubmitHandler} loading={loading} />
        </div>
    );
};

export default AddProduct;

