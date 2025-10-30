// Senior-level error handling and custom error classes
import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, message, "INTERNAL_ERROR", details);
    this.name = "InternalServerError";
  }
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Production: Don't expose internal error details
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        error: {
          code: "UNKNOWN_ERROR",
          message: isDevelopment ? error.message : "An unexpected error occurred",
          details: isDevelopment ? { stack: error.stack } : undefined,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

