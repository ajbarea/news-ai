"""
Database seeding module.
Provides idempotent database initialization to ensure consistent
application state across development, testing, and production environments.
"""

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from .database import engine, SessionLocal, Base
from .. import models
from .seed_data import users, categories, sources, get_articles
from ..utils.logging_config import get_logger

# Set up logging
logger = get_logger(__name__)

# Set up password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_users(db: Session):
    """
    Seed the database with initial user accounts.

    Creates admin and demo users only if no users exist,
    ensuring idempotent application initialization.

    Args:
        db (Session): Database session
    """
    existing_users = db.query(models.User).count()
    if existing_users > 0:
        logger.info("Users already exist, skipping user seeding")
        return

    db.add_all(users)
    db.commit()
    logger.info(f"Created {len(users)} initial user accounts")


def seed_categories(db: Session):
    """
    Seed the database with content categories.

    Establishes the initial taxonomy for content organization.
    Skips seeding if categories already exist to preserve user data.

    Args:
        db (Session): Database session
    """
    existing_categories = db.query(models.Category).count()
    if existing_categories > 0:
        logger.info("Categories already exist, skipping category seeding")
        return

    db.add_all(categories)
    db.commit()
    logger.info(f"Created {len(categories)} content categories")


def seed_sources(db: Session):
    """
    Seed the database with news sources.

    Establishes the initial set of content providers with their
    attributes like subscription requirements and branding.

    Args:
        db (Session): Database session
    """
    existing_sources = db.query(models.Source).count()
    if existing_sources > 0:
        logger.info("Sources already exist, skipping source seeding")
        return

    db.add_all(sources)
    db.commit()
    logger.info(f"Created {len(sources)} news sources")


def seed_articles(db: Session):
    """
    Seed the database with sample articles.

    Establishes initial content for demonstration and testing purposes.
    Performs validation to ensure required categories and sources exist.

    Args:
        db (Session): Database session
    """
    existing_articles = db.query(models.Article).count()
    if existing_articles > 0:
        logger.info("Articles already exist, skipping seeding articles.")
        return

    # Get all categories and organize them into a dictionary
    db_categories = {}
    categories = db.query(models.Category).all()
    for category in categories:
        db_categories[category.name] = category

    # Get all sources and organize them into a dictionary
    db_sources = {}
    sources = db.query(models.Source).all()
    for source in sources:
        db_sources[source.name] = source

    # Check that we have all required categories and sources
    required_categories = [
        "Business",
        "Technology",
        "Health",
        "Sports",
        "Entertainment",
        "Science",
        "Politics",
        "Environment",
    ]
    required_sources = [
        "ABC News",
        "Apple",
        "Los Angeles Times",
        "NBC News",
        "NPR",
        "BBC",
        "CNN",
        "The New York Times",
        "The Hacker News",
        "Bloomberg",
        "Good Morning America",
    ]

    missing_categories = [c for c in required_categories if c not in db_categories]
    missing_sources = [s for s in required_sources if s not in db_sources]

    if missing_categories or missing_sources:
        if missing_categories:
            logger.warning(
                f"Warning: Missing required categories: {', '.join(missing_categories)}"
            )
        if missing_sources:
            logger.warning(
                f"Warning: Missing required sources: {', '.join(missing_sources)}"
            )
        return

    articles = get_articles(db_categories, db_sources)

    db.add_all(articles)
    db.commit()
    logger.info(f"Seeded {len(articles)} articles")


def seed_user_source_blacklist(db: Session):
    """
    Seed the database with user source blacklist entries.
    Skips seeding if blacklist entries already exist.

    Args:
        db (Session): Database session
    """
    existing_blacklists = db.query(models.UserSourceBlacklist).count()
    if existing_blacklists > 0:
        logger.info(
            "User source blacklist entries already exist, skipping seeding blacklists."
        )
        return

    # Get ajbarea user
    user = db.query(models.User).filter_by(username="ajbarea").first()

    # Get ABC News source
    abc_source = db.query(models.Source).filter_by(name="ABC News").first()

    # Verify user and source were found
    if not user or not abc_source:
        if not user:
            logger.warning("Warning: User 'ajbarea' not found. Available users:")
            users = db.query(models.User).all()
            for u in users:
                logger.warning(f" - {u.username}")

        if not abc_source:
            logger.warning("Warning: Source 'ABC News' not found. Available sources:")
            sources = db.query(models.Source).all()
            for s in sources:
                logger.warning(f" - {s.name}")
        return

    # Create blacklist entry
    blacklist_entry = models.UserSourceBlacklist(
        user_id=user.id, source_id=abc_source.id
    )

    db.add(blacklist_entry)
    db.commit()
    logger.info(
        f"Seeded 1 user source blacklist entry: User '{user.username}' blocking '{abc_source.name}'"
    )


def seed_user_article_blacklist(db: Session):
    """
    Seed the database with user article blacklist entries.
    Skips seeding if blacklist entries already exist.

    Args:
        db (Session): Database session
    """
    existing_blacklists = db.query(models.UserArticleBlacklist).count()
    if existing_blacklists > 0:
        logger.info(
            "User article blacklist entries already exist, skipping seeding blacklists."
        )
        return

    # Get ajbarea user
    user = db.query(models.User).filter_by(username="ajbarea").first()

    # Get first article
    article = db.query(models.Article).first()

    # Verify user and article were found
    if not user or not article:
        if not user:
            logger.warning("Warning: User 'ajbarea' not found.")
        if not article:
            logger.warning("Warning: No articles found.")
        return

    # Create blacklist entry
    blacklist_entry = models.UserArticleBlacklist(
        user_id=user.id, article_id=article.id
    )

    db.add(blacklist_entry)
    db.commit()
    logger.info(
        f"Seeded 1 user article blacklist entry: User '{user.username}' hiding article '{article.title}'"
    )


def seed_user_preferences(db: Session):
    """
    Create initial preferences for all users across all categories.
    This ensures that every user has a preference entry for each category.
    Also blacklists a specific category for testing.
    """
    # Get all users and categories
    users = db.query(models.User).all()
    categories = db.query(models.Category).all()

    # Count existing preferences
    existing_preferences = db.query(models.UserPreference).count()

    if existing_preferences > 0:
        logger.info("User preferences already exist, checking for completeness...")

    # For each user, ensure they have a preference for each category
    preferences_created = 0
    blacklisted_created = 0
    for user in users:
        # Get first category for blacklisting (for test user only)
        test_category = db.query(models.Category).first()

        for category in categories:
            # Check if preference already exists
            existing = (
                db.query(models.UserPreference)
                .filter(
                    models.UserPreference.user_id == user.id,
                    models.UserPreference.category_id == category.id,
                )
                .first()
            )

            if not existing:
                # Create preference - blacklist the test category for the first user
                should_blacklist = False
                if user.username == "ajbarea" and category.id == test_category.id:
                    should_blacklist = True
                    blacklisted_created += 1

                preference = models.UserPreference(
                    user_id=user.id,
                    category_id=category.id,
                    score=0,
                    blacklisted=should_blacklist,
                )
                db.add(preference)
                preferences_created += 1

    if preferences_created > 0:
        db.commit()
        logger.info(f"Seeded {preferences_created} user preferences")
        logger.info(
            f"Seeded {blacklisted_created} user category blacklist entry: User 'ajbarea' blocking '{test_category.name}'"
        )
    else:
        logger.info("All user preferences are already set up correctly")


def teardown():
    """
    Drop all tables in the database to start with a clean slate.
    This function is called during application startup to ensure
    we can recreate and reseed the database.
    """
    try:
        logger.info("Dropping all database tables...")
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping database tables: {e}")


def seed_all():
    """
    Seed all database tables with initial data.
    This function runs all individual seeding functions in the correct order.
    """
    logger.info("Starting database seeding...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_users(db)
        seed_categories(db)
        seed_sources(db)
        seed_articles(db)
        seed_user_preferences(db)
        seed_user_source_blacklist(db)
        seed_user_article_blacklist(db)
        logger.info("Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
