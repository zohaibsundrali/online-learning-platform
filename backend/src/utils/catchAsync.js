/**
 * Catch Async wrapper to handle errors in async route handlers
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('❌ catchAsync Error:', err.message);
      console.error('📚 Stack:', err.stack);
      return next(err);
    });
  };
};

module.exports = catchAsync;