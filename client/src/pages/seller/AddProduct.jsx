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
                setFormKey(Date.now()); // Reset form
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
        <div className="flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="md:p-10 p-4 max-w-4xl">
                <h2 className="pb-4 text-lg font-medium">Thêm sản phẩm mới</h2>
                <ProductForm key={formKey} onSubmit={onSubmitHandler} loading={loading} />
            </div>
        </div>
    );
};

export default AddProduct;
