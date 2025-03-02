"""
Fix for compatibility issues between passlib and bcrypt
"""

import bcrypt
import logging

# Check if the bcrypt module has the __about__ attribute, and if not, add it
if not hasattr(bcrypt, "__about__"):
    # Create a dummy __about__ module with a __version__ attribute
    class DummyAbout:
        __version__ = bcrypt.__version__

    bcrypt.__about__ = DummyAbout()
    logging.info(
        f"Applied bcrypt compatibility fix. Using bcrypt version: {bcrypt.__version__}"
    )
