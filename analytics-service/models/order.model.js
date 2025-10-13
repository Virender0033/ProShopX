import mongoose from "mongoose";

const orderSchema = new mongoose.Schema
(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        orderItems :[
            {
                product:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true
                },
                price:{
                    type:Number,
                    required: true
                }
            }
        ],
        shippingInfo: {
            address: String,
            city:String,
            country:String,
            postalCode:String,
            phone:String
        },
        paymentInfo: {
            id:String,
            status:String
        },
        orderStatus: {
            type:String,
            default:"Processing"
        },
        totalAmount:{
            type:Number,
            required:true
        },
        paidAt:{
            type:Date
        }
    },
    {
        timestamps:true
    }
);

const Order = mongoose.model("Order",orderSchema);

export default Order;