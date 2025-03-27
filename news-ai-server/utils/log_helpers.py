"""
Logging helper functions.

Provides standardized logging patterns for common operations
to ensure consistency in log format and content across the application.
"""

from ..utils.logging_config import get_logger

logger = get_logger(__name__)


def log_create(entity_type, entity_id=None, user_id=None, **extra_fields):
    """
    Log entity creation with consistent format.

    Args:
        entity_type: The type of entity being created (e.g., 'article', 'user')
        entity_id: The ID of the created entity
        user_id: The ID of the user performing the action
        **extra_fields: Additional context fields to include in the log
    """
    extra = {k: v for k, v in extra_fields.items()}
    if entity_id:
        extra["entity_id"] = entity_id
    if user_id:
        extra["user_id"] = user_id

    logger.info(f"{entity_type.title()} created", extra=extra)


def log_update(
    entity_type, entity_id, user_id=None, changed_fields=None, **extra_fields
):
    """
    Log entity update with consistent format.

    Args:
        entity_type: The type of entity being updated
        entity_id: The ID of the updated entity
        user_id: The ID of the user performing the action
        changed_fields: List of fields that were changed
        **extra_fields: Additional context fields to include in the log
    """
    extra = {"entity_id": entity_id, **{k: v for k, v in extra_fields.items()}}

    if user_id:
        extra["user_id"] = user_id

    if changed_fields:
        extra["changed_fields"] = changed_fields

    logger.info(f"{entity_type.title()} updated", extra=extra)


def log_delete(entity_type, entity_id, user_id=None, **extra_fields):
    """
    Log entity deletion with consistent format.

    Args:
        entity_type: The type of entity being deleted
        entity_id: The ID of the deleted entity
        user_id: The ID of the user performing the action
        **extra_fields: Additional context fields to include in the log
    """
    extra = {"entity_id": entity_id, **{k: v for k, v in extra_fields.items()}}

    if user_id:
        extra["user_id"] = user_id

    logger.info(f"{entity_type.title()} deleted", extra=extra)


def log_read(entity_type, entity_id=None, user_id=None, count=None, **extra_fields):
    """
    Log entity read operation with consistent format.

    Args:
        entity_type: The type of entity being read
        entity_id: The ID of the entity (or None for list operations)
        user_id: The ID of the user performing the action
        count: For list operations, the number of entities returned
        **extra_fields: Additional context fields to include in the log
    """
    extra = {k: v for k, v in extra_fields.items()}

    if entity_id:
        extra["entity_id"] = entity_id
    if user_id:
        extra["user_id"] = user_id
    if count is not None:
        extra["count"] = count

    # Use debug level for read operations to reduce log volume
    logger.debug(
        f"{entity_type.title()} {'retrieved' if entity_id else 'listed'}", extra=extra
    )
