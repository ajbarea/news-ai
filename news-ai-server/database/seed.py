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
            name="AJ Barea",
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
        models.Category(
            name="Entertainment", icon="🎭", color="warning", article_count=20
        ),
        models.Category(name="Science", icon="🔬", color="info", article_count=16),
        models.Category(name="Politics", icon="🏛️", color="secondary", article_count=22),
        models.Category(
            name="Environment", icon="🌍", color="success", article_count=14
        ),
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
            logo_url="https://cdn.brandfetch.io/idyoK6RIat/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1740740388566",
        ),
        models.Source(
            name="Apple",
            url="https://www.apple.com/newsroom/",
            subscription_required=False,
            logo_url="https://cdn.brandfetch.io/idnrCPuv87/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1729268361188",
        ),
        models.Source(
            name="Los Angeles Times",
            url="https://www.latimes.com",
            subscription_required=True,
            logo_url="https://cdn.brandfetch.io/idest2vXZX/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1741016935220",
        ),
        models.Source(
            name="NBC News",
            url="https://www.nbcnews.com",
            subscription_required=False,
            logo_url="https://cdn.brandfetch.io/idBTgaxPfa/w/600/h/600/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1740587444379",
        ),
        models.Source(
            name="NPR",
            url="https://www.npr.org",
            subscription_required=False,
            logo_url="https://cdn.brandfetch.io/idCxRi79FJ/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1740867469247bbcx",
        ),
        models.Source(
            name="BBC",
            url="https://www.bbc.com",
            subscription_required=False,
            logo_url="https://cdn.brandfetch.io/idknaKagzz/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1733867034577",
        ),
        models.Source(
            name="CNN",
            url="https://www.cnn.com",
            subscription_required=True,
            logo_url="https://cdn.brandfetch.io/idhidc5593/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1721816097837",
        ),
        models.Source(
            name="The New York Times",
            url="https://www.nytimes.com",
            subscription_required=True,
            logo_url="https://cdn.brandfetch.io/ida5pjO05F/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1667566812680",
        ),
        models.Source(
            name="Hacker News",
            url="https://news.ycombinator.com",
            subscription_required=False,
            logo_url="https://cdn.brandfetch.io/hackernews.com/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed",
        ),
        models.Source(
            name="Bloomberg",
            url="https://www.bloomberg.com",
            subscription_required=True,
            logo_url="https://cdn.brandfetch.io/idy68RSCip/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1675835450168",
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

    business_category = db.query(models.Category).filter_by(name="Business").first()
    tech_category = db.query(models.Category).filter_by(name="Technology").first()
    science_category = db.query(models.Category).filter_by(name="Science").first()
    health_category = db.query(models.Category).filter_by(name="Health").first()
    politics_category = db.query(models.Category).filter_by(name="Politics").first()

    # Verify that categories were found
    if not all(
        [
            business_category,
            tech_category,
            science_category,
            health_category,
            politics_category,
        ]
    ):
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
            image_url="https://i.abcnewsfe.com/a/3dc24bd6-fdbe-4980-b0fe-eacc6aa802e6/eggs-prices-gty-lv-250225_1740518210123_hpMain_16x9.jpg?w=992",
            summary="The cost of eggs is expected to rise by over 41% in 2025, according to a new report from the U.S. Department of Agriculture. The increase is driven by a combination of factors, including rising feed costs and increased demand.",
        ),
        models.Article(
            title="Apple will spend more than $500 billion in the U.S. over the next four years",
            category_id=tech_category.id,
            source_id=apple_source.id,
            url="https://www.apple.com/newsroom/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/",
            published_at=datetime.strptime("2025-02-24", "%Y-%m-%d"),
            image_url="https://www.apple.com/newsroom/images/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/article/Apple-US-investment-Austin-research-facility-01_big.jpg.large.jpg",
            summary="Apple has announced plans to invest more than $500 billion in the U.S. economy over the next four years. The tech giant will focus on creating jobs, supporting innovation, and building a more sustainable future.",
        ),
        models.Article(
            title="Boiling Point: Want to fight climate change? Then talk about climate change",
            category_id=science_category.id,
            source_id=la_times_source.id,
            url="https://www.latimes.com/environment/newsletter/2025-02-25/boiling-point-want-to-fight-climate-change-then-talk-about-climate-change-boiling-point",
            published_at=datetime.strptime("2025-02-10", "%Y-%m-%d"),
            image_url="https://ca-times.brightspotcdn.com/dims4/default/d68a3bb/2147483647/strip/true/crop/3600x2023+0+0/resize/1200x674!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fde%2F58%2Fc1b4f17e4de69fadc0ceb9d1d723%2F1492332-me-weather-flood-warning-16-brv.jpg",
            summary="The recent heatwave in the Pacific Northwest has sparked conversations about climate change and the urgent need for action. Experts say that discussing climate change openly and honestly is crucial to driving policy changes and reducing emissions.",
        ),
        models.Article(
            title="As Texas measles outbreak grows, parents are choosing to vaccinate kids",
            category_id=health_category.id,
            source_id=nbc_source.id,
            url="https://www.nbcnews.com/health/health-news/texas-measles-outbreak-grows-parents-vaccinate-rcna193637",
            published_at=datetime.strptime("2025-02-09", "%Y-%m-%d"),
            image_url="https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2025-02/250225-measles-testing-texas-mn-1035-fcd670.jpg",
            summary="The measles outbreak in Texas has prompted many parents to get their children vaccinated. Health officials are urging the public to take preventive measures to stop the spread of the disease.",
        ),
        models.Article(
            title="House Republicans pass budget resolution, clearing a key early test for Trump agenda",
            category_id=politics_category.id,
            source_id=npr_source.id,
            url="https://www.npr.org/2025/02/25/nx-s1-5308067/house-republicans-budget-vote-mike-johnson",
            published_at=datetime.strptime("2025-02-25", "%Y-%m-%d"),
            image_url="https://npr.brightspotcdn.com/dims3/default/strip/false/crop/6000x4000+0+0/resize/800/quality/85/format/webp/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fd3%2F97%2F8aca643b417db44c9d985a2ac65e%2Fgettyimages-2201316835.jpg",
            summary="House Republicans passed a budget proposal that would increase defense spending and cut social programs. The bill is expected to face opposition in the Senate.",
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
