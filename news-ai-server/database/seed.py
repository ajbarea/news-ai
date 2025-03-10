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
        models.Category(name="Business", icon="💼", color="primary", article_count=0),
        models.Category(name="Technology", icon="💻", color="purple", article_count=0),
        models.Category(name="Health", icon="🏥", color="success", article_count=0),
        models.Category(name="Sports", icon="🏈", color="danger", article_count=0),
        models.Category(
            name="Entertainment", icon="🎭", color="warning", article_count=0
        ),
        models.Category(name="Science", icon="🔬", color="info", article_count=0),
        models.Category(name="Politics", icon="🏛️", color="secondary", article_count=0),
        models.Category(
            name="Environment", icon="🌍", color="success", article_count=0
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
            name="The Hacker News",
            url="https://thehackernews.com/",
            subscription_required=False,
            logo_url="https://cdn.brandfetch.io/idnyPaPCQR/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1735028490314",
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
    sports_category = db.query(models.Category).filter_by(name="Sports").first()
    entertainment_category = (
        db.query(models.Category).filter_by(name="Entertainment").first()
    )
    environment_category = (
        db.query(models.Category).filter_by(name="Environment").first()
    )

    # Verify that categories were found
    if not all(
        [
            business_category,
            tech_category,
            science_category,
            health_category,
            politics_category,
            sports_category,
            entertainment_category,
            environment_category,
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
    bbc_source = db.query(models.Source).filter_by(name="BBC").first()
    cnn_source = db.query(models.Source).filter_by(name="CNN").first()
    ny_times_source = (
        db.query(models.Source).filter_by(name="The New York Times").first()
    )
    hacker_news_source = (
        db.query(models.Source).filter_by(name="The Hacker News").first()
    )
    bloomberg_source = db.query(models.Source).filter_by(name="Bloomberg").first()

    # Verify that sources were found
    if not all(
        [
            abc_source,
            apple_source,
            la_times_source,
            nbc_source,
            npr_source,
            bbc_source,
            cnn_source,
            ny_times_source,
            hacker_news_source,
            bloomberg_source,
        ]
    ):
        print("Warning: Some sources weren't found. Available sources:")
        sources = db.query(models.Source).all()
        for source in sources:
            print(f" - {source.name}")
        return

    articles = [
        models.Article(  # ABC News - Business
            title="Egg prices predicted to soar more than 41% in 2025: USDA",
            category_id=business_category.id,
            source_id=abc_source.id,
            url="https://abcnews.go.com/Business/egg-prices-predicted-rise-411-2025-usda/story?id=119182317",
            published_at=datetime.strptime("2025-02-25 14:30:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://i.abcnewsfe.com/a/3dc24bd6-fdbe-4980-b0fe-eacc6aa802e6/eggs-prices-gty-lv-250225_1740518210123_hpMain_16x9.jpg?w=992",
            summary="The cost of eggs is expected to rise by over 41% in 2025, according to a new report from the U.S. Department of Agriculture. The increase is driven by a combination of factors, including rising feed costs and increased demand.",
        ),
        models.Article(  # ABC News - Health
            title="Unvaccinated New Mexico resident tests positive for measles after dying",
            category_id=health_category.id,
            source_id=abc_source.id,
            url="https://abcnews.go.com/Health/unvaccinated-new-mexico-resident-tests-positive-measles-after/story?id=119529919",
            published_at=datetime.strptime("2025-03-06 17:09:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://i.abcnewsfe.com/a/f155e857-238e-4847-9106-20f55ca0be2f/measles-rash-gty-jt-221122_1669155112087_hpMain_7_16x9.jpg?w=992",
            summary="A New Mexico resident who was unvaccinated against measles has tested positive for the virus after dying. Health officials are urging the public to get vaccinated to prevent the spread of the disease.",
        ),
        models.Article(  # ABC News - Politics
            title="Trump won't sign executive order to dissolve Department of Education today: Sources",
            category_id=politics_category.id,
            source_id=abc_source.id,
            url="https://abcnews.go.com/US/trump-preparing-executive-order-telling-education-secretary-dissolve/story?id=119499614",
            published_at=datetime.strptime("2025-03-06 17:09:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://i.abcnewsfe.com/a/29c5e047-bbf6-480e-a7a7-86ee1325d719/linda-mcmahon-12-rt-gmh-250213_1739466245343_hpMain_16x9.jpg?w=992",
            summary="President Trump is not expected to sign an executive order today directing the Education Secretary to dissolve the Department of Education, according to sources. The move would have been a major shakeup of the federal government's education policy.",
        ),
        models.Article(  # Apple - Technology
            title="Apple will spend more than $500 billion in the U.S. over the next four years",
            category_id=tech_category.id,
            source_id=apple_source.id,
            url="https://www.apple.com/newsroom/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/",
            published_at=datetime.strptime("2025-02-24 09:15:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://www.apple.com/newsroom/images/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/article/Apple-US-investment-Austin-research-facility-01_big.jpg.large.jpg",
            summary="Apple has announced plans to invest more than $500 billion in the U.S. economy over the next four years. The tech giant will focus on creating jobs, supporting innovation, and building a more sustainable future.",
        ),
        models.Article(  # Apple - Entertainment
            title="Apple Music kicks off Kendrick Lamar’s Road to Halftime ahead of Super Bowl LIX",
            category_id=entertainment_category.id,
            source_id=apple_source.id,
            url="https://www.apple.com/newsroom/2025/02/apple-music-kicks-off-kendrick-lamars-road-to-halftime-ahead-of-super-bowl-lix/",
            published_at=datetime.strptime("2025-02-03 09:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://www.apple.com/newsroom/images/2025/02/apple-music-kicks-off-kendrick-lamars-road-to-halftime-ahead-of-super-bowl-lix/article/Apple-Music-Super-Bowl-LIX-Halftime-Show-Kendrick-Lamar_big.jpg.large.jpg",
            summary="Apple Music has launched Kendrick Lamar's Road to Halftime, a new campaign leading up to Super Bowl LIX. The initiative includes exclusive content, playlists, and more to celebrate the artist's upcoming performance.",
        ),
        models.Article(  # Apple - Entertainment
            title="Apple Arcade launches into 2025 with 10 new games, including PGA TOUR Pro Golf",
            category_id=entertainment_category.id,
            source_id=apple_source.id,
            url="https://www.apple.com/newsroom/2025/01/apple-arcade-launches-into-2025-with-10-new-games-including-pga-tour-pro-golf/",
            published_at=datetime.strptime("2025-01-10 09:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://www.apple.com/newsroom/images/2025/01/apple-arcade-launches-into-2025-with-10-new-games-including-pga-tour-pro-golf/article/Apple-Arcade-hero_big.jpg.large.jpg",
            summary="Apple Arcade has kicked off 2025 with the launch of 10 new games, including PGA TOUR Pro Golf. The subscription service offers a diverse lineup of titles across various genres, all playable across Apple devices.",
        ),
        models.Article(  # Los Angeles Times - Environment
            title="Boiling Point: Want to fight climate change? Then talk about climate change",
            category_id=environment_category.id,
            source_id=la_times_source.id,
            url="https://www.latimes.com/environment/newsletter/2025-02-25/boiling-point-want-to-fight-climate-change-then-talk-about-climate-change-boiling-point",
            published_at=datetime.strptime("2025-02-25 06:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ca-times.brightspotcdn.com/dims4/default/d68a3bb/2147483647/strip/true/crop/3600x2023+0+0/resize/1200x674!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fde%2F58%2Fc1b4f17e4de69fadc0ceb9d1d723%2F1492332-me-weather-flood-warning-16-brv.jpg",
            summary="The recent heatwave in the Pacific Northwest has sparked conversations about climate change and the urgent need for action. Experts say that discussing climate change openly and honestly is crucial to driving policy changes and reducing emissions.",
        ),
        models.Article(  # Los Angeles Times - Health
            title="Homeless deaths in L.A. County are leveling off but still nearly seven per day",
            category_id=health_category.id,
            source_id=la_times_source.id,
            url="https://www.latimes.com/california/story/2025-03-06/homeless-deaths-in-l-a-county-are-leveling-off-but-still-nearly-seven-per-day",
            published_at=datetime.strptime("2025-02-25 06:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ca-times.brightspotcdn.com/dims4/default/9ca6354/2147483647/strip/true/crop/6881x4590+0+0/resize/1200x800!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F86%2Faf%2F90e6ece64fce86fa47b98a818709%2F1495259-me-homeless-count-jja-045.jpg",
            summary="The number of homeless deaths in Los Angeles County has leveled off in recent years but remains high, with nearly seven people dying each day. Advocates are calling for more resources and support to address the crisis and prevent further loss of life.",
        ),
        models.Article(  # Los Angeles Times - Environment
            title="The U.S. has withdrawn from a climate agreement that helps developing nations, South Africa says",
            category_id=environment_category.id,
            source_id=la_times_source.id,
            url="https://www.latimes.com/world-nation/story/2025-03-06/the-us-has-withdrawn-from-a-climate-agreement-that-helps-developing-nations-south-africa-says",
            published_at=datetime.strptime("2025-03-06 07:56:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ca-times.brightspotcdn.com/dims4/default/0f63239/2147483647/strip/true/crop/4320x2889+7+0/resize/1024x685!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F5a%2F17%2F3300311f172abb078dad148bc10d%2Fc68e6178c70b4f6e92e3b2626034246f",
            summary="The U.S. has withdrawn from a climate agreement that helps developing nations access funding to address the impacts of climate change, according to South Africa. The move has raised concerns about the country's commitment to global climate action.",
        ),
        models.Article(  # NBC News - Health
            title="As Texas measles outbreak grows, parents are choosing to vaccinate kids",
            category_id=health_category.id,
            source_id=nbc_source.id,
            url="https://www.nbcnews.com/health/health-news/texas-measles-outbreak-grows-parents-vaccinate-rcna193637",
            published_at=datetime.strptime("2025-02-25 18:06:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2025-02/250225-measles-testing-texas-mn-1035-fcd670.jpg",
            summary="The measles outbreak in Texas has prompted many parents to get their children vaccinated. Health officials are urging the public to take preventive measures to stop the spread of the disease.",
        ),
        models.Article(  # NBC News - Science
            title="Science under siege: Trump cuts threaten to undermine decades of research",
            category_id=science_category.id,
            source_id=nbc_source.id,
            url="https://www.nbcnews.com/science/science-news/trumps-nih-budget-cuts-threaten-research-stirring-panic-rcna191744",
            published_at=datetime.strptime("2025-02-18 12:55:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1240w,f_auto,q_auto:best/rockcms/2025-02/250213-donald-trump-science-overhaul-cdc-nih-epa-cs-0b646a.jpg",
            summary="President Trump's proposed budget cuts to the National Institutes of Health (NIH) and other scientific agencies are threatening to undermine decades of research. Scientists warn that the cuts could have far-reaching consequences for public health and innovation.",
        ),
        models.Article(  # NPR - Politics
            title="After GOP passes budget resolution, Congress to-do list only gets tougher from here",
            category_id=politics_category.id,
            source_id=npr_source.id,
            url="https://www.npr.org/2025/02/25/nx-s1-5308067/house-republicans-budget-vote-mike-johnson",
            published_at=datetime.strptime("2025-02-26 15:04:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://npr.brightspotcdn.com/dims3/default/strip/false/crop/6000x4000+0+0/resize/800/quality/85/format/webp/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fd3%2F97%2F8aca643b417db44c9d985a2ac65e%2Fgettyimages-2201316835.jpg",
            summary="House Republicans passed a budget proposal that would increase defense spending and cut social programs. The bill is expected to face opposition in the Senate.",
        ),
        models.Article(  # NPR - Entertainment
            title="Our 25 most-anticipated games of 2025 including Grand Theft Auto 6 (maybe)",
            category_id=entertainment_category.id,
            source_id=npr_source.id,
            url="https://www.npr.org/2025/01/13/g-s1-41804/grand-theft-auto-6-nintendo-switch-2-most-anticipated-2025-games",
            published_at=datetime.strptime("2025-01-13 05:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://npr.brightspotcdn.com/dims3/default/strip/false/crop/1920x1080+0+0/resize/800/quality/85/format/webp/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F07%2F30%2F2454a0b8478facd74b9f0cc2fabd%2Fquadshot2025.jpg",
            summary="NPR has compiled a list of the 25 most-anticipated video games of 2025, including Grand Theft Auto 6 and Nintendo Switch 2. The lineup features a mix of sequels, new releases, and indie titles across various genres.",
        ),
        models.Article(  # Bloomberg - Politics
            title="Europe's Defenses Risk Faltering Within Weeks Without US Support",
            category_id=politics_category.id,
            source_id=bloomberg_source.id,
            url="https://www.bloomberg.com/news/features/2025-03-06/europe-s-defenses-against-russia-invasion-would-last-weeks-without-trump-support?srnd=phx-politics",
            published_at=datetime.strptime("2025-03-07 08:03:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iysTXSayk8b8/v1/2000x1334.webp",
            summary="Europe's defenses against a potential Russian invasion would falter within weeks without U.S. support, according to a new report. The findings underscore the importance of transatlantic cooperation in maintaining security in the region.",
        ),
        models.Article(  # Bloomberg - Business
            title="Half a Million US Jobs on the Line as DOGE Fallout Spreads",
            category_id=business_category.id,
            source_id=bloomberg_source.id,
            url="https://www.bloomberg.com/news/articles/2025-03-06/half-a-million-us-jobs-are-on-the-line-as-doge-fallout-spreads?srnd=phx-economics-v2",
            published_at=datetime.strptime("2025-03-06 09:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/io6XJVHxqHeM/v1/459x306.webp",
            summary="The fallout from the Dogecoin crash is threatening half a million jobs in the U.S., according to a new analysis. The cryptocurrency's decline has had a ripple effect on the economy, impacting sectors from tech to finance.",
        ),
        models.Article(  # The New York Times - Sports
            title="A Muslim Athlete Needed Modest Sportswear. Now She Sells It to Others.",
            category_id=sports_category.id,
            source_id=ny_times_source.id,
            url="https://www.nytimes.com/2025/03/06/style/kiandra-browne-duquesne-hijab-muslim.html#",
            published_at=datetime.strptime("2025-03-06 09:06:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://static01.nyt.com/images/2025/03/09/multimedia/06hijab-basketball-01-pbfj/06hijab-basketball-01-pbfj-superJumbo.jpg?quality=75&auto=webp",
            summary="Kiandra Browne, a basketball player at Duquesne University, struggled to find modest sportswear that met her needs. Now, she has launched her own line of athletic hijabs to help other Muslim athletes.",
        ),
        models.Article(  # The New York Times - Sports
            title="Stephen A. Smith, ESPN agree to $100M contract that lets him talk more about politics: Sources",
            category_id=sports_category.id,
            source_id=ny_times_source.id,
            url="https://www.nytimes.com/athletic/6181819/2025/03/06/stephen-a-smith-contract-espn-first-take/",
            published_at=datetime.strptime("2025-03-06 18:44:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://static01.nyt.com/athletic/uploads/wp/2025/03/06160252/GettyImages-2202142576-1024x683.jpg?width=770&quality=70&auto=webp",
            summary="Stephen A. Smith has signed a new contract with ESPN worth $100 million, according to sources. The deal allows Smith to talk more about politics and social issues on his show, First Take.",
        ),
        models.Article(  # The Hacker News - Technology
            title="Over 1,000 WordPress Sites Infected with JavaScript Backdoors Enabling Persistent Attacker Access",
            category_id=tech_category.id,
            source_id=hacker_news_source.id,
            url="https://thehackernews.com/2025/03/over-1000-wordpress-sites-infected-with.html",
            published_at=datetime.strptime("2025-03-06", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHX-B4i_w9DL-IFy27W9xmdKPQo98Q-e5hHgnWLC5Tly1hCCQ1_z1JsMr0Dg73C9TnpxhYv9FYKl1idTGEA6TDTw-hC2mb0fg9WDFV38kPLXYI53k4vkGvdrQ_KNlCH054dHy-CEcSEQgHtbFWNuIM3q3r4uDE3VvVO0P9DjCdpsU9FZOgSOw6f6caLpIF/s728-rw-e365/js-malware-code.png",
            summary="A new report has revealed that over 1,000 WordPress sites have been infected with JavaScript backdoors that enable persistent attacker access. The backdoors allow threat actors to execute arbitrary code and maintain control over the compromised sites.",
        ),
        #
        models.Article(  # The Hacker News - Sports
            title="NBC Sports Rotoworld forums and Mobile website defaced",
            category_id=sports_category.id,
            source_id=hacker_news_source.id,
            url="https://thehackernews.com/2012/11/nbc-websites-hacked-to-promote-nov5th.html",
            published_at=datetime.strptime("2012-11-04", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjABgh_Zp3ISQJDBLoGhD8iuWm-e2-xtlOdt-5SyMCy_DbPeR_VpjXN3WPiBZZxkLkL9nRbluCZmOPflGpjgmYCALDqJoiIcwJz746JeEdp4bD3blhpfNH8uYddsJNx79bLoz_S0XFDo0/s640/NBC+websites.png",
            summary='The hacker group \'pyknic\' has defaced the NBC Sports Rotoworld forums and Mobile website to promote their own website. Hacker also claim that "user info" and "passwords" had been exposed, but yet there is no note about the dumped database location.',
        ),
        models.Article(  # The Hacker News - Technology
            title="Three Password Cracking Techniques and How to Defend Against Them",
            category_id=tech_category.id,
            source_id=hacker_news_source.id,
            url="https://thehackernews.com/2025/02/three-password-cracking-techniques-and.html",
            published_at=datetime.strptime("2025-02-26", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhwGAvNH5LRiDq-0ZWPHDI9alRFHDWjhKN4zd0lmO5HJHm55Ni5ZWO_Yg_F8J0P0yVk5gkNHzntGhzUEHcYi-qU6-12LDfGR1Q-HHkInSRAxNN22NmkjLsKBBFasd8xn2uOvxti-cB0WJ6DV6hIPghmELGzJsw1vcl5PdT2HWVDIRlKMGK99utcSipwr6I/s728-rw-e365/main.png",
            summary="Password cracking is a common attack vector used by cybercriminals to gain unauthorized access to systems and accounts. This article explores three popular password cracking techniques and provides tips on how to defend against them.",
        ),
        models.Article(  # BBC - Environment
            title="US lost a fifth of its butterflies within two decades",
            category_id=environment_category.id,
            source_id=bbc_source.id,
            url="https://www.bbc.com/news/articles/cwyjkn729gpo",
            published_at=datetime.strptime("2025-03-06 14:37:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ichef.bbci.co.uk/news/1024/cpsprodpb/2680/live/dee68b80-f8fd-11ef-806b-d7666ddeb600.jpg.webp",
            summary="The U.S. has lost a fifth of its butterfly population in the last two decades, according to a new study. The decline is attributed to habitat loss, climate change, and pesticide use.",
        ),
        models.Article(  # BBC - Business
            title="Carmakers win break from Trump's tariffs on Canada and Mexico",
            category_id=business_category.id,
            source_id=bbc_source.id,
            url="https://www.bbc.com/news/articles/c62zn47d5j1o",
            published_at=datetime.strptime("2025-03-06 02:39:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ichef.bbci.co.uk/news/1024/cpsprodpb/6d46/live/b1a72da0-f9f2-11ef-9877-67fac07f10ae.jpg.webp",
            summary="The U.S. has agreed to lift tariffs on steel and aluminum imports from Canada and Mexico, providing relief to carmakers. The move is expected to boost the auto industry and reduce costs for consumers.",
        ),
        models.Article(  # CNN - Science
            title="Intuitive Machines’ Athena lander is on the moon’s surface but its status is unclear",
            category_id=science_category.id,
            source_id=cnn_source.id,
            url="https://www.cnn.com/2025/03/06/science/intuitive-machines-im2-moon-landing/index.html",
            published_at=datetime.strptime("2025-03-06 17:34:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://media.cnn.com/api/v1/images/stellar/prod/ap25065635798647.jpg?c=original&q=w_1280,c_fill",
            summary="Intuitive Machines' Athena lander has successfully touched down on the moon's surface, but its status is unclear. The spacecraft is carrying a variety of scientific instruments and technology demonstrations.",
        ),
        models.Article(  # CNN - Science
            title="Firefly shares video of Blue Ghost’s nail-biting descent to the lunar surface",
            category_id=science_category.id,
            source_id=cnn_source.id,
            url="https://www.cnn.com/2025/03/05/science/blue-ghost-moon-landing-footage/index.html?iid=cnn_buildContentRecirc_end_recirc",
            published_at=datetime.strptime("2025-03-06 14:37:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://cdn.mos.cms.futurecdn.net/AgnS3eqq2b66aaipjov5Do-970-80.jpg.webp",
            summary="Firefly Aerospace has released video footage of its Blue Ghost lander's descent to the lunar surface. The nail-biting footage shows the spacecraft navigating a hazardous landing site before touching down safely.",
        ),
    ]
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
        seed_user_source_blacklist(db)
        print("Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
