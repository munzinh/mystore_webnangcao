"""
Collaborative Filtering Module
Sử dụng Truncated SVD (Matrix Factorization) trên User-Item Interaction Matrix

Weights:
- purchase:    3.0
- add_to_cart: 2.0
- view:        1.0
- rating:      2.5 (sử dụng giá trị rating nếu có)
"""

from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://mystore:XiyeLktDmi9a167P@cluster0.uuvmrro.mongodb.net')
DB_NAME = os.getenv('DB_NAME', 'Greencart')

EVENT_WEIGHTS = {
    'view': 1.0,
    'add_to_cart': 2.0,
    'purchase': 3.0,
    'rating': 2.5,
}


def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]


def build_interaction_matrix(db):
    """
    Xây dựng User-Item Interaction Matrix từ UserBehavior collection.
    Returns: (matrix_df, user_ids, product_ids)
    """
    behaviors = list(db['userbehaviors'].find(
        {},
        {'userId': 1, 'productId': 1, 'eventType': 1, 'weight': 1, '_id': 0}
    ))

    if not behaviors:
        return None, [], []

    df = pd.DataFrame(behaviors)
    df['userId'] = df['userId'].astype(str)
    df['productId'] = df['productId'].astype(str)

    # Tính tổng weighted score cho từng (user, product) pair
    df['score'] = df['weight'].fillna(1.0)

    interaction = df.groupby(['userId', 'productId'])['score'].sum().reset_index()

    # Pivot thành matrix
    matrix = interaction.pivot(index='userId', columns='productId', values='score').fillna(0)

    return matrix, list(matrix.index), list(matrix.columns)


def train_svd(matrix_df, n_components=20):
    """Huấn luyện Truncated SVD."""
    mat = csr_matrix(matrix_df.values)
    n_components = min(n_components, min(mat.shape) - 1)
    if n_components <= 0:
        return None, None, None

    svd = TruncatedSVD(n_components=n_components, random_state=42)
    user_factors = svd.fit_transform(mat)
    item_factors = svd.components_.T  # shape: (n_products, n_components)

    return svd, user_factors, item_factors


def get_cf_recommendations(user_id_str, top_n=8):
    """
    Gợi ý sản phẩm cho user dựa trên Collaborative Filtering (SVD).
    Returns: list of {productId, score}
    """
    db = get_db()
    matrix_df, user_ids, product_ids = build_interaction_matrix(db)

    if matrix_df is None or user_id_str not in user_ids:
        return []  # Cold start – return empty, caller sẽ fallback

    svd, user_factors, item_factors = train_svd(matrix_df)
    if svd is None:
        return []

    user_idx = user_ids.index(user_id_str)
    user_vec = user_factors[user_idx]  # shape: (n_components,)

    # Tính predicted score cho tất cả sản phẩm
    predicted_scores = user_vec @ item_factors.T  # shape: (n_products,)

    # Lấy các sản phẩm user chưa tương tác
    interacted = set(
        product_ids[i]
        for i, v in enumerate(matrix_df.iloc[user_idx].values)
        if v > 0
    )

    candidates = [
        {'productId': product_ids[i], 'score': float(predicted_scores[i])}
        for i in range(len(product_ids))
        if product_ids[i] not in interacted
    ]

    # Sắp xếp giảm dần theo score
    candidates.sort(key=lambda x: x['score'], reverse=True)
    return candidates[:top_n]


def get_user_interaction_count(user_id_str):
    """Đếm số interactions của user (để xác định cold start)."""
    db = get_db()
    return db['userbehaviors'].count_documents({'userId': ObjectId(user_id_str) if len(user_id_str) == 24 else user_id_str})


if __name__ == '__main__':
    db = get_db()
    behaviors = list(db['userbehaviors'].find({}, {'userId': 1}).limit(1))
    if behaviors:
        uid = str(behaviors[0]['userId'])
        print(f"Testing CF for user: {uid}")
        recs = get_cf_recommendations(uid, top_n=5)
        print(f"Recommendations: {recs}")
    else:
        print("No behavior data found. Please track some user interactions first.")
