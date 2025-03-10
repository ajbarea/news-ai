"""
Database seeding module.
This file contains functions to populate the database with initial data.
It seeds users, categories, sources, and articles for the news application.
"""

from sqlalchemy.orm import Session
import bcrypt
import logging

# Apply compatibility fix for bcrypt to ensure __about__ attribute exists
if not hasattr(bcrypt, "__about__"):
    # Create a dummy __about__ class to avoid AttributeError
    class DummyAbout:
        __version__ = bcrypt.__version__

    bcrypt.__about__ = DummyAbout()
    logging.info(
        f"Applied bcrypt compatibility fix. Using bcrypt version: {bcrypt.__version__}"
    )

from passlib.context import CryptContext

from .database import engine, SessionLocal, Base
from .. import models
from .seed_data import users, categories, sources, get_articles

# Set up password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_users(db: Session):
    """
    Seed the database with initial user accounts.
    Skips seeding if users already exist.

    Args:
        db (Session): Database session
    """
    existing_users = db.query(models.User).count()
    if existing_users > 0:
        print("Users already exist, skipping seeding users.")
        return

    db.add_all(users)
    db.commit()
    print(f"Seeded {len(users)} users")


def seed_categories(db: Session):
    """
    Seed the database with article categories.
    Skips seeding if categories already exist.

    Args:
        db (Session): Database session
    """
    existing_categories = db.query(models.Category).count()
    if existing_categories > 0:
        print("Categories already exist, skipping seeding categories.")
        return

    db.add_all(categories)
    db.commit()
    print(f"Seeded {len(categories)} categories")


def seed_sources(db: Session):
    """
    Seed the database with news sources.
    Skips seeding if sources already exist.

    Args:
        db (Session): Database session
    """
    existing_sources = db.query(models.Source).count()
    if existing_sources > 0:
        print("Sources already exist, skipping seeding sources.")
        return

    db.add_all(sources)
    db.commit()
    print(f"Seeded {len(sources)} sources")


def seed_articles(db: Session):
    """
    Seed the database with sample articles.
    Skips seeding if articles already exist.

    Args:
        db (Session): Database session
    """
    existing_articles = db.query(models.Article).count()
    if existing_articles > 0:
        print("Articles already exist, skipping seeding articles.")
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
    ]

    missing_categories = [c for c in required_categories if c not in db_categories]
    missing_sources = [s for s in required_sources if s not in db_sources]

    if missing_categories or missing_sources:
        if missing_categories:
            print(
                f"Warning: Missing required categories: {', '.join(missing_categories)}"
            )
        if missing_sources:
            print(f"Warning: Missing required sources: {', '.join(missing_sources)}")
        return

    articles = get_articles(db_categories, db_sources)

    db.add_all(articles)
    db.commit()
    print(f"Seeded {len(articles)} articles")


def seed_user_source_blacklist(db: Session):
    """
    Seed the database with user source blacklist entries.
    Skips seeding if blacklist entries already exist.

    Args:
        db (Session): Database session
    """
    existing_blacklists = db.query(models.UserSourceBlacklist).count()
    if existing_blacklists > 0:
        print(
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
            print("Warning: User 'ajbarea' not found. Available users:")
            users = db.query(models.User).all()
            for u in users:
                print(f" - {u.username}")

        if not abc_source:
            print("Warning: Source 'ABC News' not found. Available sources:")
            sources = db.query(models.Source).all()
            for s in sources:
                print(f" - {s.name}")
        return

    # Create blacklist entry
    blacklist_entry = models.UserSourceBlacklist(
        user_id=user.id, source_id=abc_source.id
    )

    db.add(blacklist_entry)
    db.commit()
    print(
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
        print(
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
            print("Warning: User 'ajbarea' not found.")
        if not article:
            print("Warning: No articles found.")
        return

    # Create blacklist entry
    blacklist_entry = models.UserArticleBlacklist(
        user_id=user.id, article_id=article.id
    )

    db.add(blacklist_entry)
    db.commit()
    print(
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
        print("User preferences already exist, checking for completeness...")

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
        print(f"Seeded {preferences_created} user preferences")
        print(
            f"Seeded {blacklisted_created} user category blacklist entry: User 'ajbarea' blocking '{test_category.name}'"
        )
    else:
        print("All user preferences are already set up correctly")


def teardown():
    """
    Drop all tables in the database to start with a clean slate.
    This function is called during application startup to ensure
    we can recreate and reseed the database.
    """
    try:
        print("Dropping all database tables...")
        Base.metadata.drop_all(bind=engine)
        print("Database tables dropped successfully")
    except Exception as e:
        print(f"Error dropping database tables: {e}")


def seed_all():
    """
    Seed all database tables with initial data.
    This function runs all individual seeding functions in the correct order.
    """
    print("Starting database seeding...")
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
        print("Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
