"""
Evaluation Module - Precision@K và Recall@K
Dùng leave-one-out cross-validation trên UserBehavior data.
"""

import numpy as np
from pymongo import MongoClient
import pandas as pd
from content_based import get_content_recommendations
from collaborative_filtering import get_cf_recommendations, build_interaction_matrix, train_svd
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://mystore:XiyeLktDmi9a167P@cluster0.uuvmrro.mongodb.net')
DB_NAME = os.getenv('DB_NAME', 'Greencart')


def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]


def precision_at_k(recommended, relevant, k):
    """Precision@K: tỉ lệ sản phẩm gợi ý đúng trong top-K."""
    if not recommended or k == 0:
        return 0.0
    top_k = set(recommended[:k])
    relevant_set = set(relevant)
    hits = len(top_k & relevant_set)
    return hits / k


def recall_at_k(recommended, relevant, k):
    """Recall@K: tỉ lệ sản phẩm liên quan được gợi ý trong top-K."""
    if not relevant or k == 0:
        return 0.0
    top_k = set(recommended[:k])
    relevant_set = set(relevant)
    hits = len(top_k & relevant_set)
    return hits / len(relevant_set)


def evaluate_content_based(k=5, min_interactions=3, max_users=50):
    """
    Đánh giá Content-based Filtering bằng leave-one-out.
    Với mỗi user có đủ interactions:
    - Dùng (n-1) sản phẩm để gợi ý dựa trên content của sản phẩm cuối cùng
    - Kiểm tra xem sản phẩm còn lại có nằm trong top-K không
    """
    db = get_db()

    # Lấy purchase behaviors (ground truth mạnh nhất)
    behaviors = list(db['userbehaviors'].find(
        {'eventType': {'$in': ['purchase', 'add_to_cart']}},
        {'userId': 1, 'productId': 1}
    ))

    if not behaviors:
        return {'precision@k': 0.0, 'recall@k': 0.0, 'k': k, 'evaluated_users': 0}

    df = pd.DataFrame(behaviors)
    df['userId'] = df['userId'].astype(str)
    df['productId'] = df['productId'].astype(str)

    user_products = df.groupby('userId')['productId'].apply(list).reset_index()
    # Lọc user có đủ interactions
    user_products = user_products[user_products['productId'].apply(len) >= min_interactions]

    if user_products.empty:
        return {'precision@k': 0.0, 'recall@k': 0.0, 'k': k, 'evaluated_users': 0, 'note': 'Not enough data'}

    precisions, recalls = [], []
    evaluated = 0

    for _, row in user_products.head(max_users).iterrows():
        products = row['productId']
        # Leave-one-out: dùng sản phẩm cuối làm ground truth
        test_product = products[-1]
        train_products = products[:-1]

        # Gợi ý dựa trên sản phẩm cuối trong train
        seed_product = train_products[-1] if train_products else products[0]
        recs = get_content_recommendations(seed_product, top_n=k)
        rec_ids = [r['productId'] for r in recs]

        p = precision_at_k(rec_ids, [test_product], k)
        r = recall_at_k(rec_ids, [test_product], k)
        precisions.append(p)
        recalls.append(r)
        evaluated += 1

    return {
        'algorithm': 'content_based',
        f'precision@{k}': round(np.mean(precisions), 4) if precisions else 0.0,
        f'recall@{k}': round(np.mean(recalls), 4) if recalls else 0.0,
        'k': k,
        'evaluated_users': evaluated,
    }


def evaluate_collaborative_filtering(k=5, min_interactions=5, max_users=50):
    """Đánh giá Collaborative Filtering."""
    db = get_db()
    matrix_df, user_ids, product_ids = build_interaction_matrix(db)

    if matrix_df is None or len(user_ids) < 2:
        return {'precision@k': 0.0, 'recall@k': 0.0, 'k': k, 'evaluated_users': 0,
                'note': 'Not enough users for CF evaluation'}

    svd, user_factors, item_factors = train_svd(matrix_df)
    if svd is None:
        return {'precision@k': 0.0, 'recall@k': 0.0, 'k': k}

    precisions, recalls = [], []
    evaluated = 0

    for u_idx, user_id in enumerate(user_ids[:max_users]):
        # Sản phẩm user đã tương tác
        interactions = matrix_df.iloc[u_idx]
        interacted = [product_ids[i] for i, v in enumerate(interactions.values) if v > 0]

        if len(interacted) < min_interactions:
            continue

        # Leave-one-out: ẩn sản phẩm cuối
        test_product = interacted[-1]

        # Predict
        user_vec = user_factors[u_idx]
        predicted = user_vec @ item_factors.T
        # Lấy top-K từ những sản phẩm chưa tương tác (trừ test_product ẩn đi)
        train_interacted = set(interacted[:-1])
        candidates = [
            (product_ids[i], float(predicted[i]))
            for i in range(len(product_ids))
            if product_ids[i] not in train_interacted
        ]
        candidates.sort(key=lambda x: x[1], reverse=True)
        rec_ids = [c[0] for c in candidates[:k]]

        p = precision_at_k(rec_ids, [test_product], k)
        r = recall_at_k(rec_ids, [test_product], k)
        precisions.append(p)
        recalls.append(r)
        evaluated += 1

    return {
        'algorithm': 'collaborative_filtering',
        f'precision@{k}': round(np.mean(precisions), 4) if precisions else 0.0,
        f'recall@{k}': round(np.mean(recalls), 4) if recalls else 0.0,
        'k': k,
        'evaluated_users': evaluated,
    }


def run_full_evaluation(k=5):
    """Chạy đánh giá toàn bộ các algorithms."""
    print(f"=== Evaluation Results (K={k}) ===\n")

    cb_results = evaluate_content_based(k=k)
    print(f"Content-based Filtering:")
    print(f"  Precision@{k}: {cb_results.get(f'precision@{k}', 0):.4f}")
    print(f"  Recall@{k}:    {cb_results.get(f'recall@{k}', 0):.4f}")
    print(f"  Users evaluated: {cb_results.get('evaluated_users', 0)}")

    print()
    cf_results = evaluate_collaborative_filtering(k=k)
    print(f"Collaborative Filtering (SVD):")
    print(f"  Precision@{k}: {cf_results.get(f'precision@{k}', 0):.4f}")
    print(f"  Recall@{k}:    {cf_results.get(f'recall@{k}', 0):.4f}")
    print(f"  Users evaluated: {cf_results.get('evaluated_users', 0)}")

    return {'content_based': cb_results, 'collaborative': cf_results}


if __name__ == '__main__':
    results = run_full_evaluation(k=5)
