import React, { useEffect, useState } from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';
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
  }, []);

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
  }, [user]);

  return (
    <div className="flex justify-center px-4 mt-4">
      <div className="w-full max-w-screen-xl px-1 justify-center items-center">
        <MainBanner />
        <Categories />
        <BestSeller />

        {/* Gợi ý cá nhân hoá - chỉ hiển thị khi đăng nhập */}
        {user && (
          <RecommendationSection
            title="Dành riêng cho bạn"
            subtitle="Dựa trên lịch sử duyệt và mua hàng của bạn"
            products={forYouProducts}
            loading={forYouLoading}
            badge="AI Powered"
            badgeColor="bg-blue-100 text-blue-600"
          />
        )}

        {/* Trending Products */}
        <RecommendationSection
          title="Sản phẩm nổi bật"
          subtitle="Được nhiều người quan tâm nhất tuần này"
          products={trendingProducts}
          loading={trendingLoading}
          badge=""
          badgeColor="bg-orange-100 text-orange-600"
        />
      </div>
    </div>
  );
};

export default Home;