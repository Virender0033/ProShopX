import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import productRoutes from './routes/product.route.js'
import errorMiddleware from './middleware/error.middleware.js';

dotenv.config({
    path:"./.env"
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/uploads", express.static("uploads"));
app.use('/api/products', productRoutes);
app.use(errorMiddleware);

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB connected")
    app.listen(process.env.PORT, () =>{
        console.log(`product-service running on port ${process.env.PORT}`);
    });
})
.catch((err)=>( 
    console.log("MongoDB error in product-service: ",err)
));
