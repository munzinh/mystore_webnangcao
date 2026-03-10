import express from "express";
import { upload } from "../configs/multer.js";
import authUser from "../middlewares/authUser.js";
import { addReview, getReviews, getUserReview, deleteReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Public routes
reviewRouter.get('/:productId', getReviews);

// Protected routes (require login)
reviewRouter.post('/add', upload.array('images'), authUser, addReview);
reviewRouter.get('/user-review/:productId', authUser, getUserReview);
reviewRouter.delete('/:id', authUser, deleteReview);

export default reviewRouter;
