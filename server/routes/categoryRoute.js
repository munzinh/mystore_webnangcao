import express from 'express';
import { addCategory, getCategories, getCategoryTree, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import authSeller from '../middlewares/authSeller.js';

const categoryRouter = express.Router();

categoryRouter.post('/add', authSeller, addCategory);
categoryRouter.put('/update/:id', authSeller, updateCategory);
categoryRouter.delete('/delete/:id', authSeller, deleteCategory);

categoryRouter.get('/list', getCategories);
categoryRouter.get('/tree', getCategoryTree);

export default categoryRouter;
