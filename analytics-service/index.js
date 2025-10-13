import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import analyticsRoutes from './routes/analytics.route.js';
import errorMiddleware from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/analytics", analyticsRoutes);

app.use(errorMiddleware);

mongoose.connect(process.env.MONGO_URI, {
}).then(()=> {
    console.log("MongoDB connected for Analytics");
    app.listen(process.env.PORT || 5005 ,
        ()=>{
            console.log(`Analytics service running on port ${process.env.PORT || 5005}`);
        }
    );
})
.catch((err)=>console.log("MongoDB connection error in analytics-service", err));
