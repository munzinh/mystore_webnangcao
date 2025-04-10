import React from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';;

const Home = () => {
  return (
    <div className="flex justify-center px-4 mt-4">
      <div className="w-full max-w-screen-xl px-1 justify-center items-center">
        <MainBanner />
        <Categories />
        <BestSeller />
      </div>     
    </div>
  );
};

export default Home;