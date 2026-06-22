// ============================================================================
// Centralized Error Handler Middleware
// ============================================================================
// Catches all errors thrown in route handlers and returns consistent JSON
// error responses. Prevents stack traces from leaking to the client.
// ============================================================================

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: err.message,
    });
  }

  // MySQL foreign key constraint error (cannot delete referenced row)
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      error: 'Cannot delete',
      message: 'This record is referenced by other records and cannot be deleted.',
    });
  }

  // MySQL foreign key constraint error (referenced row not found)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Invalid reference',
      message: 'A referenced record (foreign key) does not exist.',
    });
  }

  // MySQL CHECK constraint violation
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
    });
  }

  // Custom application errors with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.error || 'Error',
      message: err.message,
    });
  }

  // Default 500 error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
  });
};

module.exports = errorHandler;
