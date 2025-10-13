import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            type:String,
        },
        price:{
            type:Number,
            required:true
        },
        category:{
            type:String
        },
        image:{
            type:String
        },
        imagePublicId:{
            type:String
        },
        stock:{
            type:Number,
            default:1
        },
        brand:{
            type:String
        }
    },
    {
        timestamps:true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;