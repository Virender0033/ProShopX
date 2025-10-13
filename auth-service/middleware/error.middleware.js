const errorMiddleware = (err, req, res, next) =>{
    const statusCode = err.statusCode || 500;
    res.statusCode(statusCode).json({
        success: false,
        message : err.message || 'Internal Server Error',
        errors : process.env.NODE_ENV === 'development' ? err.stack :undefined
    });
};

export default errorMiddleware;