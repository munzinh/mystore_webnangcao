import React, { useEffect, useState } from 'react';
import MapComponent from '../components/MapComponent';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handlechange, address }) => (
  <input
    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-[#d70018] transition'
    type={type}
    placeholder={placeholder}
    onChange={handlechange}
    name={name}
    value={address[name]}
    required
  />
);

const AddAddress = () => {

const {axios,user, navigate}= useAppContext();

  const [address, setAddress] = useState({
    firstname: '',
    lastname: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const handlechange = (e) => {
    const { name, value } = e.target;

    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const {data} = await axios.post('/api/address/add',{address, userId: user._id});

      if(data.success){
        toast.success(data.message)
        navigate('/cart')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() =>{
    if(!user){
      navigate('/cart')
    }
  },[])

  return (
    <div className='mt-16 px-4'>
      <div className='max-w-[1280px] mx-auto'>
        <p className='text-2xl md:text-3xl text-gray-500'>
          Địa chỉ <span className='font-semibold text-[#d70018]'>Giao hàng</span>
        </p>
        <div className='flex flex-col-reverse md:flex-row justify-between mt-10 gap-6'>
          <div className='flex max-w-wd w-full'>
            <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm w-full'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField handlechange={handlechange} address={address} name='firstname' type='text' placeholder="First Name" />
                <InputField handlechange={handlechange} address={address} name='lastname' type='text' placeholder="Last Name" />
              </div>

              <InputField handlechange={handlechange} address={address} name='email' type='email' placeholder="Email" />
              <InputField handlechange={handlechange} address={address} name='street' type='text' placeholder="Street" />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField handlechange={handlechange} address={address} name='city' type='text' placeholder="City" />
                <InputField handlechange={handlechange} address={address} name='state' type='text' placeholder="State" />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField handlechange={handlechange} address={address} name='zipcode' type='number' placeholder="Zip code" />
                <InputField handlechange={handlechange} address={address} name='country' type='text' placeholder="Country" />
              </div>

              <InputField handlechange={handlechange} address={address} name='phone' type='number' placeholder="Phone" />

              <button className='w-full mt-6 bg-[#d70018] text-white py-3 hover:bg-[#d70018]/80 transition cursor-pointer uppercase'>
                Lưu
              </button>
            </form>
          </div>

          <div className='md:w-[100%] w-full h-[300px] md:h-[400px] md:mt-0 rounded overflow-hidden'>
            <MapComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;