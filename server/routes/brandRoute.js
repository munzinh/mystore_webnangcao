import express from 'express';
import { addBrand, getBrands, updateBrand, deleteBrand } from '../controllers/brandController.js';
import authSeller from '../middlewares/authSeller.js';

const brandRouter = express.Router();

brandRouter.post('/add', authSeller, addBrand);
brandRouter.put('/update/:id', authSeller, updateBrand);
brandRouter.delete('/delete/:id', authSeller, deleteBrand);

brandRouter.get('/list', getBrands);

export default brandRouter;
