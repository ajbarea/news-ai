"""
Database seeding module.
This file contains functions to populate the database with initial data.
It seeds users, categories, sources, and articles for the news application.
"""

from datetime import datetime
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

# Set up password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    """
    Hash a password using bcrypt.

    Args:
        password (str): Plain text password

    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


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

    users = [
        models.User(
            username="ajbarea",
            email="ajb6289@rit.edu",
            password_hash=get_password_hash("pass"),
        ),
    ]
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

    categories = [
        models.Category(name="Business", icon="💼", color="primary", article_count=12),
        models.Category(name="Technology", icon="💻", color="purple", article_count=24),
        models.Category(name="Health", icon="🏥", color="success", article_count=18),
        models.Category(name="Sports", icon="🏈", color="danger", article_count=15),
        models.Category(name="Entertainment", icon="🎭", color="warning", article_count=20),
        models.Category(name="Science", icon="🔬", color="info", article_count=16),
        models.Category(name="Politics", icon="🏛️", color="secondary", article_count=22),
        models.Category(name="Environment", icon="🌍", color="success", article_count=14),
    ]
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

    sources = [
        models.Source(
            name="ABC News",
            url="https://abcnews.go.com",
            subscription_required=False,
            logo_url="https://abcnews.go.com/logo.png",
        ),
        models.Source(
            name="Apple",
            url="https://www.apple.com/newsroom/",
            subscription_required=False,
            logo_url="https://www.apple.com/logo.png",
        ),
        models.Source(
            name="Los Angeles Times",
            url="https://www.latimes.com",
            subscription_required=True,
            logo_url="https://www.latimes.com/logo.png",
        ),
        models.Source(
            name="NBC News",
            url="https://www.nbcnews.com",
            subscription_required=False,
            logo_url="https://www.nbcnews.com/logo.png",
        ),
        models.Source(
            name="NPR",
            url="https://www.npr.org",
            subscription_required=False,
            logo_url="https://www.npr.org/logo.png",
        ),
        models.Source(
            name="BBC",
            url="https://www.bbc.com",
            subscription_required=False,
            logo_url="https://www.bbc.com/logo.png",
        ),
        models.Source(
            name="CNN",
            url="https://www.cnn.com",
            subscription_required=True,
            logo_url="https://www.cnn.com/logo.png",
        ),
        models.Source(
            name="The New York Times",
            url="https://www.nytimes.com",
            subscription_required=True,
            logo_url="https://www.nytimes.com/logo.png",
        ),
        models.Source(
            name="Hacker News",
            url="https://news.ycombinator.com",
            subscription_required=False,
            logo_url="https://news.ycombinator.com/y18.gif",
        ),
        models.Source(
            name="Bloomberg",
            url="https://www.bloomberg.com",
            subscription_required=True,
            logo_url="https://www.bloomberg.com/logo.png",
        ),
    ]
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

    # Fix: Use correct case for category names (capitalized first letter)
    business_category = db.query(models.Category).filter_by(name="Business").first()
    tech_category = db.query(models.Category).filter_by(name="Technology").first()
    science_category = db.query(models.Category).filter_by(name="Science").first()
    health_category = db.query(models.Category).filter_by(name="Health").first()
    politics_category = db.query(models.Category).filter_by(name="Politics").first()

    # Verify that categories were found
    if not all([business_category, tech_category, science_category, health_category, politics_category]):
        print("Warning: Some categories weren't found. Available categories:")
        categories = db.query(models.Category).all()
        for category in categories:
            print(f" - {category.name}")
        return

    abc_source = db.query(models.Source).filter_by(name="ABC News").first()
    apple_source = db.query(models.Source).filter_by(name="Apple").first()
    la_times_source = (
        db.query(models.Source).filter_by(name="Los Angeles Times").first()
    )
    nbc_source = db.query(models.Source).filter_by(name="NBC News").first()
    npr_source = db.query(models.Source).filter_by(name="NPR").first()

    articles = [
        models.Article(
            title="Egg prices predicted to soar more than 41% in 2025: USDA",
            category_id=business_category.id,
            source_id=abc_source.id,
            url="https://abcnews.go.com/Business/egg-prices-predicted-rise-411-2025-usda/story?id=119182317",
            published_at=datetime.strptime("2025-02-25", "%Y-%m-%d"),
            image_url="https://i.abcnewsfe.com/a/3dc24bd6-fdbe-4980-b0fe-eacc6aa802e6/eggs-prices.jpg",
        ),
        models.Article(
            title="Apple will spend more than $500 billion in the U.S. over the next four years",
            category_id=tech_category.id,
            source_id=apple_source.id,
            url="https://www.apple.com/newsroom/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/",
            published_at=datetime.strptime("2025-02-24", "%Y-%m-%d"),
            image_url="https://www.apple.com/newsroom/images/2025/02/apple-investment.jpg",
        ),
        models.Article(
            title="Boiling Point: Want to fight climate change? Then talk about climate change",
            category_id=science_category.id,
            source_id=la_times_source.id,
            url="https://www.latimes.com/environment/newsletter/2025-02-25/boiling-point-want-to-fight-climate-change-then-talk-about-climate-change-boiling-point",
            published_at=datetime.strptime("2025-02-10", "%Y-%m-%d"),
            image_url="https://ca-times.brightspotcdn.com/climate-change.jpg",
        ),
        models.Article(
            title="As Texas measles outbreak grows, parents are choosing to vaccinate kids",
            category_id=health_category.id,
            source_id=nbc_source.id,
            url="https://www.nbcnews.com/health/health-news/texas-measles-outbreak-grows-parents-vaccinate-rcna193637",
            published_at=datetime.strptime("2025-02-09", "%Y-%m-%d"),
            image_url="https://media-cldnry.s-nbcnews.com/image/upload/measles-testing-texas.jpg",
        ),
        models.Article(
            title="House Republicans pass budget resolution, clearing a key early test for Trump agenda",
            category_id=politics_category.id,
            source_id=npr_source.id,
            url="https://www.npr.org/2025/02/25/nx-s1-5308067/house-republicans-budget-vote-mike-johnson",
            published_at=datetime.strptime("2025-02-25", "%Y-%m-%d"),
            image_url="https://npr.brightspotcdn.com/house-republicans-budget.jpg",
        ),
    ]
    db.add_all(articles)
    db.commit()
    print(f"Seeded {len(articles)} articles")


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
        print("Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
