/**
 * Catch Async wrapper to handle errors in async route handlers
 * This properly catches errors and passes them to Express error handler
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // ✅ Ensure fn is a function
    if (typeof fn !== 'function') {
      return next(new Error('Handler must be a function'));
    }
    
    // ✅ Execute the function and catch any errors
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('❌ catchAsync Error:', err.message);
      console.error('📚 Stack:', err.stack);
      // ✅ Pass error to Express error handler
      return next(err);
    });
  };
};

module.exports = catchAsync;