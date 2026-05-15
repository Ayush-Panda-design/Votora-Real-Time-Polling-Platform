import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

 
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

 
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.path}:`, error.message);
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
