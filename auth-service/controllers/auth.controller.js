import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const userRegister = asyncHandler(async(req, res) =>{
    const {name, email, password, role} = req.body;

    if(!email || !password || !name){
        throw new ApiError(400, 'All fields are required')
    }

    const existingUser = await User.findOne({email});

    if(existingUser){
        throw new ApiError(400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name, 
        email, 
        password:hashedPassword, 
        role
    });

    

    const token = jwt.sign({id: user._id, role: user.role},
        process.env.JWT_SECRET
    );

    res.status(201)
    .json(
        new ApiResponse(201,
            {user, token},
            "User registered successfully"
        )
    );
});


const userLogin = asyncHandler(async(req, res)=>{
    const {email, password }= req.body;

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, 'User not found');
    }

    const match = await bcrypt.compare(password, user.password);

    if(!match){
        throw  new ApiError(401, 'Invalid credentials')
    }

    const token = jwt.sign({id: user._id, role: user.role},
        process.env.JWT_SECRET);

    res.status(200).json(
        new ApiResponse(200,
            {user, token},
            'Login successfully'
        )
    );
});

const getMe = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user.id).select('-password');
    if(!user){
        throw new ApiError(404, 'User not found')
    }

    res.status(200).json(new ApiResponse(200,
        user,
        'User profile'
    ));
});

export {
    userRegister,
    userLogin,
    getMe
}