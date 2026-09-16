import {v2 as cloudinary} from 'cloudinary';
import productModel from '../models/productModel.js';
import mongoose from 'mongoose';
import { defaultProducts } from '../config/seedProducts.js';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME || '', 
    api_key: process.env.CLOUDINARY_API_KEY || '', 
    api_secret: process.env.CLOUDINARY_SECRET_KEY || ''
});

// In-memory fallback product catalog
let mockProducts = [...defaultProducts];

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, discount, colors, images: bodyImages } = req.body;

        let imagesUrl = [];
        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files.image1?.[0];
            const image2 = req.files.image2?.[0];
            const image3 = req.files.image3?.[0];
            const image4 = req.files.image4?.[0];
            const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

            if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_NAME) {
                imagesUrl = await Promise.all(
                    images.map(async (item) => {
                        let result = await cloudinary.uploader.upload(item.path, {resource_type:'image'});
                        return result.secure_url;
                    })
                );
            } else {
                imagesUrl = images.map((item) => {
                    try {
                        if (item.path && fs.existsSync(item.path)) {
                            const buffer = fs.readFileSync(item.path);
                            const mime = item.mimetype || 'image/jpeg';
                            return `data:${mime};base64,${buffer.toString('base64')}`;
                        }
                    } catch (e) {
                        console.error('Error reading uploaded image:', e);
                    }
                    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                });
            }
        }

        // Support direct images array or URLs if passed in JSON body
        if (bodyImages) {
            let directImages = [];
            try {
                directImages = typeof bodyImages === 'string' ? JSON.parse(bodyImages) : bodyImages;
            } catch {
                directImages = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
            }
            if (Array.isArray(directImages) && directImages.length > 0) {
                imagesUrl = [...imagesUrl, ...directImages.filter(Boolean)];
            }
        }

        if (imagesUrl.length === 0) {
            imagesUrl = ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"];
        }

        let parsedSizes = [];
        try {
            parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        } catch {
            parsedSizes = Array.isArray(sizes) ? sizes : ["Standard"];
        }

        let parsedColors = [];
        try {
            parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
        } catch {
            parsedColors = typeof colors === 'string' 
                ? colors.split(',').map(c => c.trim()).filter(Boolean) 
                : (Array.isArray(colors) ? colors : []);
        }

        // ✅ Create product data object
        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: parsedSizes,
            colors: Array.isArray(parsedColors) ? parsedColors : [],
            bestseller: bestseller === "true" || bestseller === true,
            discount: Number(discount) || 0,
            salesCount: 0,
            image: imagesUrl,
            images: imagesUrl,
            date: Date.now(),
            reviews: [],
        };

        if (mongoose.connection.readyState === 1) {
            const product = new productModel(productData);
            await product.save();
            mockProducts.unshift({ ...productData, _id: product._id.toString() });
        } else {
            const fakeId = 'prod_' + Date.now();
            mockProducts.unshift({ ...productData, _id: fakeId });
        }

        res.json({ success: true, message: "Product Added", product: productData });
    } 
    catch (error){
        console.log(error);
        res.json({success:false, message: error.message})
    }
}

// function for list product
const listProducts = async (req, res) => {
    try{
        if (mongoose.connection.readyState === 1) {
            const products = await productModel.find({});
            if (products && products.length > 0) {
                return res.json({success: true, products});
            }
        }
        res.json({success: true, products: mockProducts});
    }
    catch (error){
        console.log(error);
        res.json({success: true, products: mockProducts});
    }
}

// function for remove product
const removeProduct = async (req, res) => {
    try {
        const id = req.body.id;
        if (mongoose.connection.readyState === 1) {
            await productModel.findByIdAndDelete(id);
        }
        mockProducts = mockProducts.filter(p => p._id !== id);
        res.json({ success: true, message: "Product removed"});
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        if (mongoose.connection.readyState === 1) {
            const product = await productModel.findById(productId)
            if (product) {
                return res.json({success: true, product});
            }
        }
        const product = mockProducts.find(p => p._id === productId);
        res.json({success: true, product})
    }
    catch (error){
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

// function to add review
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        // In a real app we would get userId/userName from the auth middleware `req.body.userId`.
        // The frontend will send a dummy username for this demo if not logged in, or we extract it.
        const userId = req.body.userId || 'guest';
        const userName = req.body.userName || 'Anonymous User';

        if (mongoose.connection.readyState === 1) {
            const product = await productModel.findById(productId);
            if (!product) return res.json({ success: false, message: 'Product not found' });
            
            product.reviews = product.reviews || [];
            product.reviews.push({ userId, userName, rating: Number(rating), comment });
            
            // Randomly increment salesCount to simulate real activity occasionally
            product.salesCount = (product.salesCount || 0) + Math.floor(Math.random() * 5) + 1;
            
            await product.save();

            // update mock products as well to keep sync
            const mockIndex = mockProducts.findIndex(p => p._id === productId);
            if (mockIndex !== -1) {
                mockProducts[mockIndex] = product;
            }

            return res.json({ success: true, message: 'Review added', product });
        }
        
        // Handle mock fallback
        const product = mockProducts.find(p => p._id === productId);
        if (product) {
            product.reviews = product.reviews || [];
            product.reviews.push({ userId, userName, rating: Number(rating), comment, date: new Date() });
            product.salesCount = (product.salesCount || 0) + Math.floor(Math.random() * 5) + 1;
            return res.json({ success: true, message: 'Review added', product });
        }

        res.json({ success: false, message: 'Product not found' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, addReview, mockProducts }