import express from 'express';
import { addBrand, getBrands } from '../controllers/brandController.js';
import authSeller from '../middlewares/authSeller.js';

const brandRouter = express.Router();

brandRouter.post('/add', authSeller, addBrand);

brandRouter.get('/list', getBrands);

export default brandRouter;
