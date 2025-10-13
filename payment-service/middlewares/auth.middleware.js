import JWT from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next(new ApiError(401, "Unauthorized: token missing"));
  }

  try {
    const decodedToken = JWT.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = decodedToken;
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid token"));
  }
};

const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, `Forbidden: Requires role(s) ${roles.join(",")}`));
  }
  next();
};

export { authMiddleware, authorizeRole };
