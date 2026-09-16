import {v2 as cloudinary} from 'cloudinary';
import productModel from '../models/productModel.js';
import mongoose from 'mongoose';
import { defaultProducts } from '../config/seedProducts.js';

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
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

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
                imagesUrl = images.map(() => "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60");
            }
        }
        if (imagesUrl.length === 0) {
            imagesUrl = ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60"];
        }

        let parsedSizes = [];
        try {
            parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        } catch {
            parsedSizes = Array.isArray(sizes) ? sizes : ["M", "L"];
        }

        // ✅ Create product data object
        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: parsedSizes,
            bestseller: bestseller === "true" || bestseller === true,
            images: imagesUrl,
            date: Date.now(),
        };

        if (mongoose.connection.readyState === 1) {
            const product = new productModel(productData);
            await product.save();
            mockProducts.unshift({ ...productData, _id: product._id.toString() });
        } else {
            const fakeId = 'prod_' + Date.now();
            mockProducts.unshift({ ...productData, _id: fakeId });
        }

        res.json({ success: true, message: "Product Added" });
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

export { listProducts, addProduct, removeProduct, singleProduct, mockProducts }