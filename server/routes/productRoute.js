import express from "express";
import { upload } from "../configs/multer.js";
import authSeller from "../middlewares/authSeller.js";
import { addProduct, productList, productById, changeStock, recommendProducts, editProduct, deleteProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), authSeller, addProduct)
productRouter.post('/edit', upload.array(["images"]), authSeller, editProduct)
productRouter.post('/delete', authSeller, deleteProduct)
productRouter.get('/list', productList)
productRouter.post('/id', productById)
productRouter.post('/stock', authSeller, changeStock)
productRouter.post('/recommend', recommendProducts)

export default productRouter;
