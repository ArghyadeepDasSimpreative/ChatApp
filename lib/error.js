export const errorHandler = (err, req, res) => {
  let statusCode = 500;
  let message = 'Something went wrong';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Mongoose bad ObjectId error
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key error (e.g., unique email)
  else if (err.code && err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field: ${field} already exists`;
  }

  // Custom error with statusCode/message
  else if (err.statusCode && err.message) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
