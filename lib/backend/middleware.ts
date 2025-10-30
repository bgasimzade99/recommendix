// Senior-level middleware for rate limiting and security
import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store (production should use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export function rateLimitMiddleware(
  request: NextRequest,
  identifier: string
): NextResponse | null {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window or expired window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return null; // Allow request
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((entry.resetTime - now) / 1000).toString(),
          "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
          "X-RateLimit-Remaining": Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count - 1).toString(),
          "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
        },
      }
    );
  }

  // Increment counter
  entry.count++;
  return null; // Allow request
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

// Security headers middleware
export function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };
}

// Request ID middleware for tracing
export function addRequestId(request: NextRequest): string {
  const requestId = crypto.randomUUID();
  request.headers.set("X-Request-ID", requestId);
  return requestId;
}

