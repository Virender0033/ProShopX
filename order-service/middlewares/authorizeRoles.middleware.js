import { ApiError } from "../utils/ApiError.js";

const authorizeRole = (...roles) =>
    (req,res, next) =>{
    if(!req.user || !roles.includes(req.user.role)){
        throw new ApiError(403, `Forbidden: Requires role(s) ${roles.join(",")}`);
    }
    next();
};

export default authorizeRole;