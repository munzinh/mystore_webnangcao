import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  OPEN_SURVEY_POPUP_EVENT,
  SURVEY_AFTER_PURCHASE_KEY,
} from '../components/RecommendationSurveyPopup';

const MyOrders = () => {

  const [myOrders, setMyOrders] = useState([]);
  const { axios, user, navigate } = useAppContext();

  const fetchMyOrders = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/order/user')
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  }, [axios])

  useEffect(() => {
    if (!user) return undefined;

    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 10000);

    return () => clearInterval(interval);
  }, [fetchMyOrders, user]);

  useEffect(() => {
    if (!user || localStorage.getItem(SURVEY_AFTER_PURCHASE_KEY) !== "true") return undefined;

    localStorage.removeItem(SURVEY_AFTER_PURCHASE_KEY);
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event(OPEN_SURVEY_POPUP_EVENT));
    }, 900);

    return () => clearTimeout(timer);
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getVariantText = (item) => {
    if (item.variantInfo) return item.variantInfo;

    const variants = item.product?.variants || [];
    if (variants.length === 0) return "";

    const getVariantLabel = (variant) => {
      if (variant.variantLabel) return variant.variantLabel;

      const attributes = variant.attributes instanceof Map
        ? Object.fromEntries(variant.attributes)
        : variant.attributes || {};

      return Object.values(attributes).filter(Boolean).join(" / ");
    };

    if (variants.length === 1) {
      return getVariantLabel(variants[0]);
    }

    if (!item.price_at_purchase) return "";

    const matchingVariants = variants.filter((variant) => (
      Number(variant.offerPrice) === Number(item.price_at_purchase)
      || Number(variant.price) === Number(item.price_at_purchase)
    ));

    if (matchingVariants.length !== 1) return "";

    const variant = matchingVariants[0];
    return getVariantLabel(variant);
  };

  const openProductDetails = (product) => {
    if (!product?._id) return;

    const categoryPath = product.category?.slug || product.category?.name || product.category || "product";
    navigate(`/products/${String(categoryPath).toLowerCase()}/${product._id}`);
    scrollTo(0, 0);
  };

  return (
    <div className="mt-12 pb-16 px-4 max-w-[1120px] mx-auto">
      <div className="mb-8">
        <p className="text-2xl font-bold uppercase tracking-tight text-gray-900">Đơn hàng của tôi</p>
        <div className="mt-3 h-1 w-20 rounded-full bg-[#d70018]"></div>
      </div>

      {myOrders.map((order, index) => (
        <div
          key={index}
          className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mã đơn</p>
              <p className="mt-1 text-base font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {order.paymentType}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {order.status}
              </span>
              <div className="min-w-[160px] text-left md:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tổng tiền</p>
                <p className="mt-1 text-lg font-bold text-[#d70018]">{formatCurrency(order.amount)}</p>
              </div>
            </div>
          </div>

          {order.items.map((item, idx) => (
            <div
              key={idx}
              className={`grid gap-4 px-5 py-5 md:grid-cols-[1fr_170px_170px] md:items-center ${order.items.length !== idx + 1 ? 'border-b border-gray-100' : ''
                }`}
            >
              <button
                type="button"
                onClick={() => openProductDetails(item.product)}
                className="flex min-w-0 items-center gap-4 text-left transition hover:text-[#d70018]"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                  <img
                    src={item.product.image[0]}
                    alt={item.product.name}
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-base font-bold text-gray-900 md:text-lg">
                    {item.product.name}
                  </h2>
                  {getVariantText(item) && (
                    <p className="mt-1 text-sm text-gray-500">
                      Phiên bản: <span className="font-semibold text-gray-700">{getVariantText(item)}</span>
                    </p>
                  )}
                </div>
              </button>

              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 md:bg-transparent md:px-0 md:py-0">
                <p className="flex justify-between gap-3 md:block">
                  <span className="text-gray-400">Số lượng</span>
                  <span className="font-semibold text-gray-800 md:ml-0 md:block">{item.quantity || '1'}</span>
                </p>
                <p className="mt-2 flex justify-between gap-3 md:block">
                  <span className="text-gray-400">Ngày đặt</span>
                  <span className="font-semibold text-gray-800 md:block">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Thành tiền</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {formatCurrency((item.price_at_purchase || item.product?.offerPrice || 0) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
