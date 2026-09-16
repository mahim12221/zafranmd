import express from 'express';
import { listProducts, addProduct, removeProduct, singleProduct, addReview } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
// We might want an auth middleware for reviews, or just let it pass to allow guests for this demo.
import authUser from '../middleware/auth.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.fields([{name:'image1', maxCount:1}, {name:'image2', maxCount:1}, {name:'image3', maxCount:1}, {name:'image4', maxCount:1}]), addProduct);
productRouter.get('/list', listProducts);
productRouter.post('/single', singleProduct);
productRouter.post('/remove', adminAuth, removeProduct);
// Allow both authenticated and guest reviews for better UX demo
productRouter.post('/review', addReview);

export default productRouter;