"""
Request logging middleware.

Provides request tracking and correlation IDs for associating
related log entries across a single request lifecycle.
"""

import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds request tracking and performance logging.

    Assigns a unique correlation ID to each request and logs request
    details including duration, method, path, and status code.
    """

    async def dispatch(self, request: Request, call_next):
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        request.state.start_time = time.time()

        # Add request ID to all logs in this context
        logger.debug(
            "Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
            },
        )

        try:
            # Process the request
            response = await call_next(request)

            # Calculate duration and log request completion
            duration_ms = round((time.time() - request.state.start_time) * 1000)
            logger.info(
                f"Request completed in {duration_ms}ms",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                },
            )

            # Add request ID to response headers for client-side correlation
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception as e:
            # Log exceptions with request context
            logger.error(
                f"Request failed: {str(e)}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e),
                },
                exc_info=True,
            )
            raise
