import JWT from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const authmiddleware = (req,res,next)  => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new ApiError(401, 'Unauthorized')
    }

    const token = authHeader.split(" ")[1];
    try {
        const decodeToken = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decodeToken
        next();
    } catch (error) {
        throw new ApiError(401, 'Invalid token')
    }
}

export default authmiddleware;