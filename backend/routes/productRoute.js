import express from 'express';
import { listProducts, addProduct, removeProduct, singleProduct, addReview, editReview, deleteReview, toggleStock, updateProduct } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.fields([{name:'image1', maxCount:1}, {name:'image2', maxCount:1}, {name:'image3', maxCount:1}, {name:'image4', maxCount:1}]), addProduct);
productRouter.get('/list', listProducts);
productRouter.post('/single', singleProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/update', adminAuth, updateProduct);
productRouter.post('/toggle-stock', adminAuth, toggleStock);
productRouter.post('/stock', adminAuth, toggleStock);
productRouter.post('/review', addReview);
productRouter.post('/review/edit', editReview);
productRouter.post('/review/delete', deleteReview);

export default productRouter;