import express from 'express';
import { addCategory, getCategories, getCategoryTree } from '../controllers/categoryController.js';
import authSeller from '../middlewares/authSeller.js';

const categoryRouter = express.Router();

categoryRouter.post('/add', authSeller, addCategory);

categoryRouter.get('/list', getCategories);
categoryRouter.get('/tree', getCategoryTree);

export default categoryRouter;
