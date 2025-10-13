import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import errorMiddleware from './middleware/error.middleware.js';
import authRoutes from './routes/auth.route.js'


dotenv.config({
    path: "./.env"
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(errorMiddleware);
app.use('/api/auth', authRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB Connected Successfully");
        app.listen(process.env.PORT, ()=> 
        console.log(`Auth Service  running on port ${process.env.PORT}`)
    );
})
.catch(err => console.log('Auth-MongoDB connection failed', err));