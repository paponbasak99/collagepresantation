import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  // Handle custom application errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // SQLite / Database constraint violations
  if (err.message && (err.message.includes('UNIQUE constraint failed') || err.message.includes('PRIMARY KEY'))) {
    return res.status(409).json({
      success: false,
      message: 'Resource conflict or duplicate entry.',
      details: err.message
    });
  }

  // General server error
  console.error('Unhandled Server Error:', err);
  const isDev = process.env.NODE_ENV !== 'production';

  return res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Internal server error. Please try again later.'
  });
}

export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
