import express from 'express';
import {
    getSimilarProducts,
    getUserRecommendations,
    getTrendingProducts,
    getFrequentlyBoughtTogether,
} from '../controllers/recommendationController.js';
import authUser from '../middlewares/authUser.js';

const recommendationRouter = express.Router();

// Không cần auth
recommendationRouter.get('/trending', getTrendingProducts);
recommendationRouter.get('/product/:productId', getSimilarProducts);
recommendationRouter.get('/bought-together/:productId', getFrequentlyBoughtTogether);

// Cần auth
recommendationRouter.get('/user/:userId', authUser, getUserRecommendations);

export default recommendationRouter;
