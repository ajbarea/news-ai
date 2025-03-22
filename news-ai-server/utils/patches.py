"""
Compatibility patch module.

Applies runtime fixes for third-party library compatibility issues
to ensure smooth operation in varying environments without requiring
modifications to external dependency code.
"""

import bcrypt
from ..utils.logging_config import get_logger

# Set up logging
logger = get_logger(__name__)

# Apply compatibility fix for bcrypt
# Some versions of bcrypt don't include the __about__ attribute
# that certain libraries (like FastAPI's dependency system) expect
if not hasattr(bcrypt, "__about__"):
    logger.warning(
        f"Applying bcrypt compatibility patch for version {bcrypt.__version__}. "
        "This addresses an issue with FastAPI's dependency system that expects __about__ attribute."
    )

    # Create a dummy __about__ class to avoid AttributeError during dependency resolution
    class DummyAbout:
        __version__ = bcrypt.__version__

    bcrypt.__about__ = DummyAbout()
    logger.debug(
        f"Patch applied successfully: bcrypt.__about__.__version__ = {bcrypt.__about__.__version__}"
    )
