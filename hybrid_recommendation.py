"""
Hybrid Recommendation Module
Kết hợp Content-based Filtering (CB) và Collaborative Filtering (CF):

hybrid_score = α * CF_score + (1-α) * CB_score

Chiến lược cold start:
- User mới (< 5 interactions): α = 0.0 (pure Content-based)
- User có dữ liệu (≥ 5 interactions): α = 0.6 (ưu tiên CF)
"""

import numpy as np
from content_based import get_content_recommendations, get_db, build_product_dataframe, compute_cosine_matrix
from collaborative_filtering import get_cf_recommendations, get_user_interaction_count

COLD_START_THRESHOLD = 5  # số interactions tối thiểu để dùng CF
CF_WEIGHT = 0.6           # α khi user có đủ data


def get_hybrid_recommendations(user_id_str, top_n=8):
    """
    Gợi ý sản phẩm cá nhân hoá cho user bằng Hybrid approach.
    Returns: list of {productId, score, source}
    """
    interaction_count = get_user_interaction_count(user_id_str)

    if interaction_count < COLD_START_THRESHOLD:
        # Cold start: dùng pure content-based dựa trên sản phẩm xem gần nhất
        return _cold_start_recommendations(user_id_str, top_n)

    # Lấy CF recommendations
    cf_recs = get_cf_recommendations(user_id_str, top_n=top_n * 2)

    if not cf_recs:
        return _cold_start_recommendations(user_id_str, top_n)

    # Normalize CF scores vào [0, 1]
    cf_scores = {r['productId']: r['score'] for r in cf_recs}
    max_cf = max(cf_scores.values()) if cf_scores else 1.0
    min_cf = min(cf_scores.values()) if cf_scores else 0.0
    range_cf = max_cf - min_cf if max_cf != min_cf else 1.0

    cf_normalized = {
        pid: (score - min_cf) / range_cf
        for pid, score in cf_scores.items()
    }

    # Lấy CB recommendations dựa trên sản phẩm gần nhất user đã xem
    db = get_db()
    recent_behavior = db['userbehaviors'].find_one(
        {'userId': user_id_str},
        sort=[('timestamp', -1)]
    )

    cb_scores = {}
    if recent_behavior:
        last_product_id = str(recent_behavior.get('productId', ''))
        cb_recs = get_content_recommendations(last_product_id, top_n=top_n * 2)
        max_cb = max((r['score'] for r in cb_recs), default=1.0)
        min_cb = min((r['score'] for r in cb_recs), default=0.0)
        range_cb = max_cb - min_cb if max_cb != min_cb else 1.0
        cb_scores = {
            r['productId']: (r['score'] - min_cb) / range_cb
            for r in cb_recs
        }

    # Kết hợp scores
    all_products = set(cf_normalized.keys()) | set(cb_scores.keys())
    hybrid = []
    for pid in all_products:
        cf_s = cf_normalized.get(pid, 0.0)
        cb_s = cb_scores.get(pid, 0.0)
        hybrid_score = CF_WEIGHT * cf_s + (1 - CF_WEIGHT) * cb_s
        hybrid.append({'productId': pid, 'score': hybrid_score, 'source': 'hybrid'})

    hybrid.sort(key=lambda x: x['score'], reverse=True)
    return hybrid[:top_n]


def _cold_start_recommendations(user_id_str, top_n=8):
    """
    Cold start: recommend dựa trên hành vi gần nhất hoặc trending.
    """
    db = get_db()
    recent = list(db['userbehaviors'].find(
        {'userId': user_id_str},
        sort=[('timestamp', -1)],
        limit=1
    ))

    if recent:
        last_product_id = str(recent[0].get('productId', ''))
        recs = get_content_recommendations(last_product_id, top_n=top_n)
        return [{'productId': r['productId'], 'score': r['score'], 'source': 'cold_start_cb'} for r in recs]

    # Không có behavior nào: trả top trending từ DB
    trending = list(db['products'].find({'inStock': True}, {'_id': 1}).limit(top_n))
    return [{'productId': str(p['_id']), 'score': 0.5, 'source': 'cold_start_popular'} for p in trending]


if __name__ == '__main__':
    # Test
    db = get_db()
    user = db['userbehaviors'].find_one({}, {'userId': 1})
    if user:
        uid = str(user['userId'])
        print(f"Testing Hybrid for user: {uid}")
        recs = get_hybrid_recommendations(uid, top_n=5)
        for r in recs:
            print(f"  → {r['productId']} (score: {r['score']:.4f}, source: {r['source']})")
    else:
        print("No behavior data found.")
