"""
Logging configuration module.
Provides centralized, hierarchical logging setup with appropriate log levels
and formatting for different environments.
"""

import json
import logging
import sys
from typing import Dict, Any, Optional


class StructuredJsonFormatter(logging.Formatter):
    """
    Custom formatter that outputs logs as structured JSON.

    Formats log records as JSON objects with standardized fields,
    making logs easier to parse, search, and analyze in log management systems.
    """

    def format(self, record):
        log_object = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }

        # Add exception info if present
        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)

        # Add any extra fields provided in the log call
        if hasattr(record, "extra"):
            log_object.update(record.extra)
        elif hasattr(record, "__dict__"):
            # Extract any extra fields added to the record
            for key, value in record.__dict__.items():
                if key not in {
                    "args",
                    "asctime",
                    "created",
                    "exc_info",
                    "exc_text",
                    "filename",
                    "funcName",
                    "id",
                    "levelname",
                    "levelno",
                    "lineno",
                    "module",
                    "msecs",
                    "message",
                    "msg",
                    "name",
                    "pathname",
                    "process",
                    "processName",
                    "relativeCreated",
                    "stack_info",
                    "thread",
                    "threadName",
                }:
                    log_object[key] = value

        return json.dumps(log_object)


def setup_logging(
    log_level: str = "INFO", json_format: bool = False, log_file: Optional[str] = None
) -> None:
    """
    Configure application-wide logging with support for structured logs.

    Args:
        log_level: The application logging level
        json_format: Whether to output logs in JSON format
        log_file: Optional path to log file (logs to stdout if None)
    """
    # Convert log level string to actual level
    level = getattr(logging, log_level.upper(), logging.INFO)

    # Configure handlers
    handlers = []

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    handlers.append(console_handler)

    # File handler if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        handlers.append(file_handler)

    # Apply formatters based on format choice
    if json_format:
        formatter = StructuredJsonFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    for handler in handlers:
        handler.setFormatter(formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove any existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add our configured handlers
    for handler in handlers:
        root_logger.addHandler(handler)

    # Reduce noise from third-party libraries
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with namespace isolation.

    Creates loggers with appropriate naming hierarchy to enable
    granular log level control for specific components.

    Args:
        name: The namespace of the logger, typically __name__

    Returns:
        logging.Logger: Configured logger for the specified namespace
    """
    return logging.getLogger(name)


class LogConfig:
    """
    FastAPI/Uvicorn logging configuration.

    Provides a standardized logging setup for integration with
    FastAPI's logging initialization system.
    """

    LOGGER_NAME: str = "news_ai"
    LOG_FORMAT: str = "%(levelprefix)s | %(asctime)s | %(message)s"
    LOG_LEVEL: str = "INFO"

    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        """
        Get logging configuration for FastAPI integration.

        Returns a dictionary that can be used with FastAPI's logging system
        to maintain consistent log formatting across the application.
        """
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "()": "uvicorn.logging.DefaultFormatter",
                    "fmt": cls.LOG_FORMAT,
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stderr",
                },
            },
            "loggers": {
                cls.LOGGER_NAME: {"handlers": ["default"], "level": cls.LOG_LEVEL},
            },
        }


if __name__ == "__main__":
    # Example usage
    setup_logging(log_level="DEBUG")
    logger = get_logger(__name__)
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning message")
    logger.error("This is an error message")
