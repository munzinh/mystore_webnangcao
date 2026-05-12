import express from "express";
import { upload } from "../configs/multer.js";
import authSeller from "../middlewares/authSeller.js";
import { addProduct, productList, productById, changeStock, recommendProducts, editProduct, deleteProduct, searchProducts } from "../controllers/productController.js";

const productRouter = express.Router();

const uploadFields = [
    { name: 'image_0', maxCount: 1 },
    { name: 'image_1', maxCount: 1 },
    { name: 'image_2', maxCount: 1 },
    { name: 'image_3', maxCount: 1 }
];

productRouter.post('/add', upload.fields(uploadFields), authSeller, addProduct)
productRouter.post('/edit', upload.fields(uploadFields), authSeller, editProduct)
productRouter.post('/delete', authSeller, deleteProduct)
productRouter.get('/list', productList)
productRouter.get('/search', searchProducts)          // GET /api/product/search?q=iphone&category=mobile
productRouter.post('/id', productById)
productRouter.post('/stock', authSeller, changeStock)
productRouter.post('/recommend', recommendProducts)

export default productRouter;
