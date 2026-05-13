import React, { useEffect, useState } from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';
import Marquee from "../components/Marquee";
import RecommendationSection from '../components/RecommendationSection';
import { useAppContext } from '../context/AppContext';

const Home = () => {
  const { user, axios } = useAppContext();

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [forYouProducts, setForYouProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [forYouLoading, setForYouLoading] = useState(false);

  // Fetch trending products
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await axios.get('/api/recommendations/trending');
        if (data.success) setTrendingProducts(data.recommendations);
      } catch (err) {
        console.log(err);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, [axios]);

  // Fetch personalized recommendations (chỉ khi đăng nhập)
  useEffect(() => {
    if (!user?._id) return;
    const fetchForYou = async () => {
      setForYouLoading(true);
      try {
        const { data } = await axios.get(`/api/recommendations/user/${user._id}`);
        if (data.success && data.recommendations?.length) {
          setForYouProducts(data.recommendations);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setForYouLoading(false);
      }
    };
    fetchForYou();
  }, [axios, user]);

  return (
    <div className="flex justify-center px-2 md:px-0">
      <div className="w-full max-w-[1200px]">

        <div className="mb-4">
          <Marquee />
        </div>

        <div className="md:hidden">
          <Categories mobile />
        </div>

        {/* 👇 layout ngang */}
        <div className="home-top flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-[250px] shrink-0 hidden md:block">
            <Categories />
          </div>

          <div className="flex-1 overflow-hidden min-w-0">
            <MainBanner />
          </div>
        </div>

        <BestSeller />

        {user && (
          <RecommendationSection
            title="Dành riêng cho bạn"
            subtitle="Dựa trên lịch sử duyệt và mua hàng của bạn"
            products={forYouProducts}
            loading={forYouLoading}
            badge=""
            badgeColor="bg-blue-100 text-blue-600"
          />
        )}

        <RecommendationSection
          title="Xu hướng mua sắm"
          subtitle="Được nhiều người quan tâm nhất"
          products={trendingProducts}
          loading={trendingLoading}
          badge=""
          badgeColor="bg-orange-100 text-orange-600"
        />

      </div>
    </div>
  );
};

export default Home
