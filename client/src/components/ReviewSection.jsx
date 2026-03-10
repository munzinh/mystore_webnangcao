import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

// Star display component (read-only)
const StarDisplay = ({ rating, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`${sizeClass} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

// Interactive star picker
const StarPicker = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <svg className={`w-8 h-8 ${star <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                        fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
                {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][hover || value] || ''}
            </span>
        </div>
    );
};

const ReviewSection = ({ productId }) => {
    const { user, axios } = useAppContext();

    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const [loading, setLoading] = useState(true);

    // Form state
    const [userReview, setUserReview] = useState(null); // existing review by this user
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const fileRef = useRef();

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/review/${productId}`);
            if (data.success) {
                setReviews(data.reviews);
                setAvgRating(data.avgRating);
                setTotalReviews(data.totalReviews);
                setDistribution(data.distribution);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const checkUserReview = async () => {
        if (!user) return;
        try {
            const { data } = await axios.get(`/api/review/user-review/${productId}`);
            if (data.success && data.review) {
                setUserReview(data.review);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
            checkUserReview();
        }
    }, [productId, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }
        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('productId', productId);
            formData.append('rating', rating);
            formData.append('comment', comment);
            files.forEach(f => formData.append('images', f));

            const { data } = await axios.post('/api/review/add', formData);
            if (data.success) {
                toast.success(data.message);
                setShowForm(false);
                setRating(0);
                setComment('');
                setFiles([]);
                fetchReviews();
                checkUserReview();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có muốn xóa đánh giá này không?')) return;
        try {
            const { data } = await axios.delete(`/api/review/${reviewId}`);
            if (data.success) {
                toast.success(data.message);
                setUserReview(null);
                fetchReviews();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-semibold mb-6">Đánh giá sản phẩm</h2>

            {/* Summary */}
            {loading ? (
                <div className="text-gray-400">Đang tải đánh giá...</div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Avg rating block */}
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 min-w-[160px] border border-gray-100">
                        <span className="text-5xl font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                        <StarDisplay rating={Math.round(avgRating)} size="md" />
                        <span className="text-sm text-gray-500 mt-1">{totalReviews} đánh giá</span>
                    </div>

                    {/* Distribution bars */}
                    <div className="flex-1 flex flex-col justify-center gap-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = distribution[star] || 0;
                            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 w-4">{star}</span>
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* CTA: Write review */}
            {user && !userReview && !showForm && (
                <button onClick={() => setShowForm(true)}
                    className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 bg-[#d70018] hover:bg-[#a7091a] text-white text-sm font-medium rounded-lg transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Viết đánh giá
                </button>
            )}

            {!user && (
                <p className="mb-6 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="font-medium">Đăng nhập</span> để viết đánh giá sản phẩm này.
                </p>
            )}

            {userReview && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center justify-between">
                    <span>Bạn đã đánh giá sản phẩm này.</span>
                    <button onClick={() => handleDeleteReview(userReview._id)}
                        className="ml-4 text-red-500 hover:text-red-700 font-medium transition">Xóa đánh giá</button>
                </div>
            )}

            {/* Review form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-medium">Đánh giá của bạn</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số sao</label>
                        <StarPicker value={rating} onChange={setRating} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={4}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                            className="w-full outline-none border border-gray-300 rounded-lg p-3 text-sm resize-none focus:border-blue-400 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (tối đa 3 ảnh)</label>
                        <div className="flex gap-3 flex-wrap">
                            {files.map((f, i) => (
                                <div key={i} className="relative">
                                    <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-300" />
                                    <button type="button" onClick={() => setFiles(files.filter((_, fi) => fi !== i))}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                                </div>
                            ))}
                            {files.length < 3 && (
                                <button type="button" onClick={() => fileRef.current.click()}
                                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" hidden multiple
                                onChange={e => {
                                    const selected = Array.from(e.target.files);
                                    const remaining = 3 - files.length;
                                    setFiles([...files, ...selected.slice(0, remaining)]);
                                    e.target.value = '';
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={submitting}
                            className="px-6 py-2.5 bg-[#d70018] hover:bg-[#a7091a] text-white text-sm font-medium rounded-lg transition disabled:bg-gray-400">
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition">
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews list */}
            {!loading && (
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-gray-400 text-sm py-8 text-center">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm">
                                    {review.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <span className="font-medium text-gray-800 text-sm">{review.userId?.name || 'Người dùng'}</span>
                                        <StarDisplay rating={review.rating} size="sm" />
                                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
                                    )}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            {review.images.map((img, i) => (
                                                <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
