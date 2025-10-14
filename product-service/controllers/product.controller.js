import Product from '../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

const createProduct = asyncHandler(async (req,res) =>{
    const {name, description, price, brand, stock, category} = req.body;

    const image = req.file?.path || null;
    const imagePublicId = req.file?.filename;

    if(!name || !price){
        throw new ApiError(400, "Name and Price are required")
    }

    const product = await Product.create({name, price, description, category, brand, stock, image, imagePublicId});

    res.status(201).json(
        new ApiResponse(201,product, "Product created successfully")
    );

});

const getAllProducts = asyncHandler(async(req,res) => {
    const {page = 1, limit =10, category, brand, sort, keyword} = req.query;

    const query = {};
    
    if(category){
        query.category =  category;
    }

    if(brand){
        query.brand = brand
    }

    if(keyword){
        query.name = { $regex: keyword, $options: "i"};
    }

    const products = await Product.find(query)
        .sort(sort ? {price: sort === "asc" ? 1: -1} : {})
        .skip((page -1) *limit)
        .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {products, total}, "Product fetched successfully")
    );
});

const getProductById = asyncHandler( async (req, res) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(
        new ApiResponse(200, product)
    );
});

const updateProduct = asyncHandler( async (req,res) =>{

    const product = await Product.findById(req.params.id);

    if(!product){
        throw new ApiError(404, "Product not found");
    }

    if(req.file){
        if(product.imagePublicId){
            await cloudinary.uploader.destroy(product.imagePublicId);
        }
        product.image = req.file.path;
        product.imagePublicId= req.file.filename;
    }

    const updatableFields = ["name", "price", "category", "stock","brand", "description"];
    updatableFields.forEach(field=>{
        if(req.body[field] !== undefined){
            product[field] = req.body[field];
        }
    });

    await product.save();
    res.status(200).json(
        new ApiResponse(
            200,
            updatableFields,
            "Product update successfully"
        )
    );
});

const deleteProduct = asyncHandler( async (req, res) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        throw new ApiError(404, "Product not found");
    }

    if(product.imagePublicId){
        await cloudinary.uploader.destroy(product.imagePublicId)
    }

    if(product.image && fs.existsSync(product.image)){
        fs.unlinkSync(product.image);
    }

    await product.deleteOne();

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Product deleted successfully"
        )
    );
});

export {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
}