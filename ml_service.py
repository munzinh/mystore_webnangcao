"""
ML Service - Flask API Gateway
Port: 5000

Endpoints:
  GET  /ml/recommend/content/<productId>  - Content-based recommendations
  GET  /ml/recommend/user/<userId>        - Hybrid (CF + CB) recommendations
  GET  /ml/recommend/trending             - Trending products from behavior data
  POST /ml/train                          - Trigger model retraining (placeholder)
  GET  /ml/evaluate                       - Run evaluation metrics
  GET  /ml/health                         - Health check
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

from content_based import get_content_recommendations, get_db
from collaborative_filtering import get_cf_recommendations
from hybrid_recommendation import get_hybrid_recommendations
from evaluate import evaluate_content_based, evaluate_collaborative_filtering

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow Node.js backend to call

MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://mystore:XiyeLktDmi9a167P@cluster0.uuvmrro.mongodb.net')
DB_NAME = os.getenv('DB_NAME', 'Greencart')


# ─────────────────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────────────────
@app.route('/ml/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'MyStore ML Service', 'timestamp': datetime.now().isoformat()})


# ─────────────────────────────────────────────────────────
# Content-based Recommendation
# GET /ml/recommend/content/<productId>
# ─────────────────────────────────────────────────────────
@app.route('/ml/recommend/content/<product_id>', methods=['GET'])
def recommend_content(product_id):
    try:
        top_n = int(request.args.get('n', 8))
        recommendations = get_content_recommendations(product_id, top_n=top_n)

        if not recommendations:
            return jsonify({'success': False, 'message': 'Product not found or no recommendations', 'recommendations': []})

        return jsonify({
            'success': True,
            'algorithm': 'content_based',
            'productId': product_id,
            'recommendations': recommendations,
            'count': len(recommendations),
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'recommendations': []}), 500


# ─────────────────────────────────────────────────────────
# Hybrid Recommendation (CF + CB)
# GET /ml/recommend/user/<userId>
# ─────────────────────────────────────────────────────────
@app.route('/ml/recommend/user/<user_id>', methods=['GET'])
def recommend_user(user_id):
    try:
        top_n = int(request.args.get('n', 8))
        recommendations = get_hybrid_recommendations(user_id, top_n=top_n)

        if not recommendations:
            return jsonify({'success': False, 'message': 'No recommendations available', 'recommendations': []})

        # Enrich với product details
        db = get_db()
        product_ids = [r['productId'] for r in recommendations]
        products = list(db['products'].find(
            {'_id': {'$in': [ObjectId(pid) for pid in product_ids if len(pid) == 24]}},
            {'name': 1, 'category': 1, 'price': 1, 'offerPrice': 1, 'image': 1, 'inStock': 1}
        ))

        score_map = {r['productId']: r['score'] for r in recommendations}
        enriched = []
        for p in products:
            pid = str(p['_id'])
            enriched.append({
                'productId': pid,
                'name': p.get('name'),
                'category': p.get('category'),
                'price': p.get('price'),
                'offerPrice': p.get('offerPrice'),
                'image': p.get('image', []),
                'inStock': p.get('inStock', True),
                'score': score_map.get(pid, 0),
            })

        # Sort by score
        enriched.sort(key=lambda x: x['score'], reverse=True)

        return jsonify({
            'success': True,
            'algorithm': 'hybrid',
            'userId': user_id,
            'recommendations': enriched,
            'count': len(enriched),
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'recommendations': []}), 500


# ─────────────────────────────────────────────────────────
# Trending Products
# GET /ml/recommend/trending
# ─────────────────────────────────────────────────────────
@app.route('/ml/recommend/trending', methods=['GET'])
def recommend_trending():
    try:
        top_n = int(request.args.get('n', 12))
        days = int(request.args.get('days', 7))

        db = get_db()
        since = datetime.now() - timedelta(days=days)

        # Aggregate behavior scores
        pipeline = [
            {'$match': {'timestamp': {'$gte': since}}},
            {'$group': {
                '_id': '$productId',
                'totalScore': {'$sum': '$weight'},
                'purchaseCount': {'$sum': {'$cond': [{'$eq': ['$eventType', 'purchase']}, 1, 0]}},
                'viewCount': {'$sum': {'$cond': [{'$eq': ['$eventType', 'view']}, 1, 0]}},
            }},
            {'$sort': {'totalScore': -1}},
            {'$limit': top_n * 2},
        ]

        agg_results = list(db['userbehaviors'].aggregate(pipeline))
        score_map = {str(r['_id']): r['totalScore'] for r in agg_results}
        product_ids = [r['_id'] for r in agg_results]

        if product_ids:
            products = list(db['products'].find(
                {'_id': {'$in': product_ids}, 'inStock': True},
                {'name': 1, 'category': 1, 'price': 1, 'offerPrice': 1, 'image': 1, 'inStock': 1}
            ))

            enriched = [{
                'productId': str(p['_id']),
                'name': p.get('name'),
                'category': p.get('category'),
                'price': p.get('price'),
                'offerPrice': p.get('offerPrice'),
                'image': p.get('image', []),
                'inStock': p.get('inStock'),
                'score': score_map.get(str(p['_id']), 0),
            } for p in products]

            enriched.sort(key=lambda x: x['score'], reverse=True)

            return jsonify({
                'success': True,
                'algorithm': 'trending',
                'recommendations': enriched[:top_n],
                'period_days': days,
            })

        # Fallback: mới nhất
        latest = list(db['products'].find({'inStock': True}, {
            'name': 1, 'category': 1, 'price': 1, 'offerPrice': 1, 'image': 1
        }).sort('createdAt', -1).limit(top_n))

        return jsonify({
            'success': True,
            'algorithm': 'trending_fallback',
            'recommendations': [{**p, 'productId': str(p.pop('_id')), 'score': 0} for p in latest],
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ─────────────────────────────────────────────────────────
# Evaluation Metrics
# GET /ml/evaluate?k=5
# ─────────────────────────────────────────────────────────
@app.route('/ml/evaluate', methods=['GET'])
def evaluate():
    try:
        k = int(request.args.get('k', 5))
        cb_results = evaluate_content_based(k=k)
        cf_results = evaluate_collaborative_filtering(k=k)
        return jsonify({
            'success': True,
            'k': k,
            'content_based': cb_results,
            'collaborative': cf_results,
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ─────────────────────────────────────────────────────────
# Train (placeholder - có thể mở rộng sau)
# POST /ml/train
# ─────────────────────────────────────────────────────────
@app.route('/ml/train', methods=['POST'])
def train():
    """Trigger retraining. Hiện tại models được tính on-the-fly."""
    return jsonify({
        'success': True,
        'message': 'Models retrained successfully (on-demand computation)',
        'timestamp': datetime.now().isoformat(),
    })


if __name__ == '__main__':
    port = int(os.getenv('ML_PORT', 5000))
    print(f"Starting MyStore ML Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
