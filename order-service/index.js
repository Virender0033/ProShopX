import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import orderRoutes from './routes/order.route.js';
import errorMiddleware from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/orders',orderRoutes);
app.use(errorMiddleware);

mongoose.connect(process.env.MONGODB_URI,{
}).then(()=>{
    console.log("MongoDB connected for orders");
    app.listen(process.env.PORT || 5003 ,
        ()=>{
            console.log(`Order service running on port ${process.env.PORT || 5003}`);
        }
    );
})
.catch((err)=>console.log("MongoDB connection error in order", err));