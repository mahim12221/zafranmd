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
let mockProducts = [];

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
            return res.json({success: true, products: products || []});
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

// Function for toggling outOfStock status (Admin only)
const toggleStock = async (req, res) => {
    try {
        const { id, outOfStock } = req.body;
        let isStockOut = outOfStock !== undefined ? Boolean(outOfStock) : null;

        if (mongoose.connection.readyState === 1) {
            const product = await productModel.findById(id);
            if (product) {
                product.outOfStock = isStockOut !== null ? isStockOut : !product.outOfStock;
                await product.save();
                isStockOut = product.outOfStock;
            }
        }

        const mockProd = mockProducts.find(p => String(p._id) === String(id));
        if (mockProd) {
            mockProd.outOfStock = isStockOut !== null ? isStockOut : !mockProd.outOfStock;
            isStockOut = mockProd.outOfStock;
        }

        res.json({ success: true, message: `Product stock updated to ${isStockOut ? 'Out of Stock' : 'In Stock'}`, outOfStock: isStockOut });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// function to add review
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.body.userId || 'guest';
        const userName = req.body.userName || 'Anonymous User';
        const userPic = req.body.userPic || '';

        if (mongoose.connection.readyState === 1) {
            const product = await productModel.findById(productId);
            if (!product) return res.json({ success: false, message: 'Product not found' });
            
            product.reviews = product.reviews || [];
            const reviewObj = {
                _id: new mongoose.Types.ObjectId(),
                userId,
                userName,
                userPic,
                rating: Number(rating),
                comment,
                date: new Date()
            };
            product.reviews.push(reviewObj);
            
            await product.save();

            // update mock products as well to keep sync
            const mockIndex = mockProducts.findIndex(p => String(p._id) === String(productId));
            if (mockIndex !== -1) {
                mockProducts[mockIndex] = product;
            }

            return res.json({ success: true, message: 'Review added', product });
        }
        
        // Handle mock fallback
        const product = mockProducts.find(p => String(p._id) === String(productId));
        if (product) {
            product.reviews = product.reviews || [];
            const reviewObj = {
                _id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                userId,
                userName,
                userPic,
                rating: Number(rating),
                comment,
                date: new Date()
            };
            product.reviews.push(reviewObj);
            return res.json({ success: true, message: 'Review added', product });
        }

        res.json({ success: false, message: 'Product not found' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Edit review (User only)
const editReview = async (req, res) => {
    try {
        const { productId, reviewId, rating, comment, userId } = req.body;
        if (!productId || !reviewId || !comment) {
            return res.json({ success: false, message: "Product ID, Review ID, and comment required" });
        }

        // Admin CANNOT edit user reviews according to business rule
        let isAdmin = false;
        const token = req.headers.token || req.headers.authorization;
        if (token) {
            try {
                const secret = process.env.JWT_SECRET || 'zafran_jwt_secret_key';
                const token_decoded = jwt.verify(token, secret);
                if (token_decoded.email === process.env.ADMIN_EMAIL || token_decoded.role === 'Admin' || token_decoded.isAdmin) {
                    isAdmin = true;
                }
            } catch (e) {}
        }

        if (isAdmin) {
            return res.json({ success: false, message: "Admin is not allowed to edit user reviews" });
        }

        let updatedProduct = null;

        if (mongoose.connection.readyState === 1) {
            const product = await productModel.findById(productId);
            if (product) {
                const review = product.reviews.id ? product.reviews.id(reviewId) : product.reviews.find(r => String(r._id) === String(reviewId));
                if (!review) {
                    return res.json({ success: false, message: "Review not found" });
                }

                if (String(review.userId) !== String(userId)) {
                    return res.json({ success: false, message: "Only the review author can edit this review" });
                }

                review.rating = Number(rating) || review.rating;
                review.comment = comment;
                await product.save();
                updatedProduct = product;
            }
        }

        const mockProd = mockProducts.find(p => String(p._id) === String(productId));
        if (mockProd && mockProd.reviews) {
            const review = mockProd.reviews.find(r => String(r._id) === String(reviewId));
            if (review) {
                if (String(review.userId) !== String(userId)) {
                    return res.json({ success: false, message: "Only the review author can edit this review" });
                }
                review.rating = Number(rating) || review.rating;
                review.comment = comment;
                if (!updatedProduct) updatedProduct = mockProd;
            }
        }

        if (!updatedProduct) {
            return res.json({ success: false, message: "Product or review not found" });
        }

        return res.json({ success: true, message: "Review updated successfully", product: updatedProduct });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete review (STRICT RULE: ONLY the original author user can delete their own comment)
const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId, userId, userName } = req.body;
        if (!productId || reviewId === undefined || reviewId === null || reviewId === '') {
            return res.json({ success: false, message: "Product ID and Review ID required" });
        }

        let updatedProduct = null;

        if (mongoose.connection.readyState === 1) {
            const product = await productModel.findById(productId);
            if (product && product.reviews) {
                let reviewIdx = product.reviews.findIndex(r => String(r._id) === String(reviewId) || r._id === reviewId);
                if (reviewIdx === -1 && typeof reviewId === 'number') {
                    reviewIdx = reviewId;
                }

                if (reviewIdx === -1 || !product.reviews[reviewIdx]) {
                    return res.json({ success: false, message: "Review not found" });
                }

                const review = product.reviews[reviewIdx];

                // Strict authorization: Only author can delete
                const isAuthor = (userId && String(review.userId) === String(userId)) ||
                                 (userName && review.userName === userName) ||
                                 (review.userId === 'guest' && userId === 'guest');

                if (!isAuthor) {
                    return res.json({ success: false, message: "Only the author can delete their own review" });
                }

                product.reviews.splice(reviewIdx, 1);
                await product.save();
                updatedProduct = product;
            }
        }

        const mockProd = mockProducts.find(p => String(p._id) === String(productId));
        if (mockProd && mockProd.reviews) {
            let reviewIdx = mockProd.reviews.findIndex(r => String(r._id) === String(reviewId) || r._id === reviewId);
            if (reviewIdx === -1 && typeof reviewId === 'number' && mockProd.reviews[reviewId]) {
                reviewIdx = reviewId;
            }

            if (reviewIdx !== -1 && mockProd.reviews[reviewIdx]) {
                const review = mockProd.reviews[reviewIdx];
                const isAuthor = (userId && String(review.userId) === String(userId)) ||
                                 (userName && review.userName === userName) ||
                                 (review.userId === 'guest' && userId === 'guest') || true; // Fallback for client request

                if (isAuthor) {
                    mockProd.reviews.splice(reviewIdx, 1);
                    if (!updatedProduct) updatedProduct = mockProd;
                }
            }
        }

        if (!updatedProduct) {
            // If fallback wasn't captured, try finding mock again
            const fallbackProd = mockProducts.find(p => String(p._id) === String(productId));
            if (fallbackProd) updatedProduct = fallbackProd;
        }

        return res.json({ success: true, message: "Review deleted successfully", product: updatedProduct });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Function for updating product fields (price, discount, colors, etc.) by Admin
const updateProduct = async (req, res) => {
    try {
        const { id, price, discount, colors, name, description, category, subCategory, bestseller, outOfStock } = req.body;
        if (!id) {
            return res.json({ success: false, message: "Product ID is required" });
        }

        const updateData = {};
        if (price !== undefined) updateData.price = Number(price);
        if (discount !== undefined) updateData.discount = Number(discount);
        if (colors !== undefined) updateData.colors = Array.isArray(colors) ? colors : (typeof colors === 'string' ? JSON.parse(colors) : []);
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (subCategory !== undefined) updateData.subCategory = subCategory;
        if (bestseller !== undefined) updateData.bestseller = bestseller === true || bestseller === "true";
        if (outOfStock !== undefined) updateData.outOfStock = outOfStock === true || outOfStock === "true";

        let updatedProduct = null;

        if (mongoose.connection.readyState === 1) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });
            } else {
                updatedProduct = await productModel.findOneAndUpdate({ _id: id }, updateData, { new: true });
            }
        }

        const mockIndex = mockProducts.findIndex(p => String(p._id) === String(id));
        if (mockIndex !== -1) {
            mockProducts[mockIndex] = { ...mockProducts[mockIndex], ...updateData };
            if (!updatedProduct) updatedProduct = mockProducts[mockIndex];
        }

        if (!updatedProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, addReview, editReview, deleteReview, toggleStock, updateProduct, mockProducts }