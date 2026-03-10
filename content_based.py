"""
Content-based Filtering Module
Sử dụng TF-IDF + Cosine Similarity dựa trên:
- Tên sản phẩm
- Danh mục
- Mô tả
- Giá (binned)
"""

from pymongo import MongoClient
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import numpy as np
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://mystore:XiyeLktDmi9a167P@cluster0.uuvmrro.mongodb.net')
DB_NAME = os.getenv('DB_NAME', 'Greencart')


def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]


def build_product_dataframe(db):
    """Lấy dữ liệu sản phẩm từ MongoDB và tạo DataFrame."""
    products = list(db['products'].find(
        {},
        {'name': 1, 'description': 1, 'category': 1, 'price': 1,
         'offerPrice': 1, 'image': 1, 'inStock': 1, '_id': 1}
    ))
    df = pd.DataFrame(products)
    if df.empty:
        return df

    # Xử lý description có thể là list hoặc string
    df['description_text'] = df['description'].apply(
        lambda d: ' '.join(d) if isinstance(d, list) else str(d)
    )
    df['price'] = df['price'].astype(float, errors='ignore').fillna(0)
    df['_id_str'] = df['_id'].astype(str)

    # Chia nhóm giá: low/mid/high/premium
    def price_bin(price):
        if price < 3_000_000: return 'budget'
        elif price < 10_000_000: return 'mid'
        elif price < 25_000_000: return 'high'
        else: return 'premium'

    df['price_bin'] = df['price'].apply(price_bin)

    # Feature cho TF-IDF: name + category + description + price_bin
    df['combined_features'] = (
        df['name'].fillna('') + ' ' +
        df['category'].fillna('') + ' ' +
        df['description_text'] + ' ' +
        df['price_bin']
    )
    return df


def compute_cosine_matrix(df):
    """Tính TF-IDF matrix và cosine similarity."""
    tfidf = TfidfVectorizer(
        max_features=5000,
        stop_words=None,  # Không dùng English stopwords vì có tiếng Việt
        ngram_range=(1, 2),
        min_df=1,
    )
    tfidf_matrix = tfidf.fit_transform(df['combined_features'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return cosine_sim


def get_content_recommendations(product_id_str, top_n=8):
    """
    Trả về top-N sản phẩm tương tự dựa trên content.
    Returns: list of product dicts
    """
    db = get_db()
    df = build_product_dataframe(db)

    if df.empty:
        return []

    cosine_sim = compute_cosine_matrix(df)

    # Tìm index
    matches = df[df['_id_str'] == product_id_str]
    if matches.empty:
        return []

    idx = matches.index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Bỏ qua chính nó (index 0)
    top_indices = [s[0] for s in sim_scores[1:top_n + 1]]

    result = []
    for i in top_indices:
        row = df.iloc[i]
        result.append({
            'productId': row['_id_str'],
            'name': row['name'],
            'category': row['category'],
            'price': row.get('price', 0),
            'offerPrice': row.get('offerPrice', 0),
            'image': row.get('image', []),
            'inStock': row.get('inStock', True),
            'score': float(cosine_sim[idx][i]),
        })
    return result


if __name__ == '__main__':
    # Test
    db = get_db()
    products = list(db['products'].find({}, {'_id': 1, 'name': 1}).limit(2))
    if products:
        pid = str(products[0]['_id'])
        print(f"Testing with product: {products[0]['name']} ({pid})")
        recs = get_content_recommendations(pid, top_n=5)
        for r in recs:
            print(f"  → {r['name']} (score: {r['score']:.4f})")