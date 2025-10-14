import Order from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createOrder = asyncHandler(async(req, res) =>{ 
    const {orderItems,shippingInfo, totalAmount, paymentInfo = {}} = req.body;
    if(!orderItems || orderItems.length === 0){
        throw new ApiError(400, "No order items provided");
    }

    const order = await Order.create({
        user:req.user.id,
        orderItems,
        shippingInfo,
        paymentInfo,
        totalAmount,
        paidAt: paymentInfo?.status === "Paid" ? new Date() : null
    });

    res.status(201).json(
        new ApiResponse(201,
            order,
            "Order created succeffully"
        )
    );
});

const getMyOrders = asyncHandler(async(req,res)=>{
    const orders = await Order.find({user: req.user.id}).sort({createdAt: -1});
    
    res.status(200).json(
        new ApiResponse(
            200,
            orders,
            "My orders fetched successfully"
        )
    );
});

const getOrderById = asyncHandler(async(req, res)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(
        new ApiResponse(
            200, 
            order, 
            "Order details fetched successfully"
        )
    );

});

const getAllOrders = asyncHandler(async(req, res) =>{
    const order = await Order.find().sort({createdAt: -1});

    res.status(200).json(
        new ApiResponse(
            200,
            order,
            "All Orders fetched"
        )
    );

});

export {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders
}