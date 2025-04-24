"""
Sample data provider for database seeding.

Contains predefined data sets and factories for creating consistent
test and demonstration data. These samples provide a realistic
starting point for development and testing environments.
"""

from datetime import datetime
from .. import models
from .summarizer import get_summary


def get_password_hash(password):
    """
    Hash a password using bcrypt for secure storage.

    This is defined here to avoid circular imports with the seed module
    while maintaining consistent password hashing across the application.

    Args:
        password: Plain text password to hash

    Returns:
        str: Bcrypt hashed password
    """
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)


# Demo users for testing and development environments
# For production, separate credentials should be used
users = [
    models.User(
        username="ajbarea",
        email="ajb6289@rit.edu",
        name="AJ Barea",
        password_hash=get_password_hash(
            "pass"
        ),  # Demo password only, not for production
    ),
]

# Standard content categories with visual styling information
# for consistent presentation across UI components
categories = [
    models.Category(name="Business", icon="💼", color="primary", article_count=0),
    models.Category(name="Technology", icon="💻", color="purple", article_count=0),
    models.Category(name="Health", icon="🏥", color="success", article_count=0),
    models.Category(name="Sports", icon="🏈", color="danger", article_count=0),
    models.Category(name="Entertainment", icon="🎭", color="warning", article_count=0),
    models.Category(name="Science", icon="🔬", color="info", article_count=0),
    models.Category(name="Politics", icon="🏛️", color="secondary", article_count=0),
    models.Category(name="Environment", icon="🌍", color="success", article_count=0),
]

# News sources with their associated metadata
# Logo URLs point to persistent CDN locations to ensure availability
sources = [
    models.Source(
        name="ABC News",
        url="https://abcnews.go.com",
        logo_url="https://cdn.brandfetch.io/idyoK6RIat/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1740740388566",
    ),
    models.Source(
        name="Apple",
        url="https://www.apple.com/newsroom/",
        logo_url="https://cdn.brandfetch.io/idnrCPuv87/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1729268361188",
    ),
    models.Source(
        name="Los Angeles Times",
        url="https://www.latimes.com",
        logo_url="https://cdn.brandfetch.io/idest2vXZX/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1741016935220",
    ),
    models.Source(
        name="NBC News",
        url="https://www.nbcnews.com",
        logo_url="https://cdn.brandfetch.io/idBTgaxPfa/w/600/h/600/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1740587444379",
    ),
    models.Source(
        name="NPR",
        url="https://www.npr.org",
        logo_url="https://cdn.brandfetch.io/idCxRi79FJ/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1740867469247bbcx",
    ),
    models.Source(
        name="BBC",
        url="https://www.bbc.com",
        logo_url="https://cdn.brandfetch.io/idknaKagzz/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1733867034577",
    ),
    models.Source(
        name="CNN",
        url="https://www.cnn.com",
        logo_url="https://cdn.brandfetch.io/idhidc5593/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1721816097837",
    ),
    models.Source(
        name="The New York Times",
        url="https://www.nytimes.com",
        logo_url="https://cdn.brandfetch.io/ida5pjO05F/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1667566812680",
    ),
    models.Source(
        name="The Hacker News",
        url="https://thehackernews.com/",
        logo_url="https://cdn.brandfetch.io/idnyPaPCQR/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1735028490314",
    ),
    models.Source(
        name="Bloomberg",
        url="https://www.bloomberg.com",
        logo_url="https://cdn.brandfetch.io/idy68RSCip/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1675835450168",
    ),
    models.Source(
        name="Good Morning America",
        url="https://abcnews.go.com/GMA",
        logo_url="https://brandfetch.com/goodmorningamerica.com?view=library&library=default&collection=logos&asset=id3Gu8CPvT&utm_source=https%253A%252F%252Fbrandfetch.com%252Fgoodmorningamerica.com&utm_medium=copyAction&utm_campaign=brandPageReferral",
    )
]

def build_article(title, url, category_id, source_id, published_at, image_url):
    summary = get_summary(url)
    if summary is None:
        summary = "No summary available."
    return models.Article(
        title=title,
        category_id=category_id,
        source_id=source_id,
        url=url,
        published_at=published_at,
        image_url=image_url,
        summary=summary,
        subscription_required="paid content" in (summary or "").lower(),
    )

def get_articles(db_categories, db_sources):
    """
    Generate article objects with ORM relationships.

    Creates sample articles with realistic content across various categories
    and sources, with proper database relationships established. This provides
    a comprehensive test dataset that exercises all application features.

    Args:
        db_categories (dict): Dictionary mapping category names to category objects
        db_sources (dict): Dictionary mapping source names to source objects

    Returns:
        list: List of article objects ready for database insertion
    """
    return [
        build_article(  # ABC News - Business
            title="Egg prices predicted to soar more than 41% in 2025: USDA",
            category_id=db_categories["Business"].id,
            source_id=db_sources["ABC News"].id,
            url="https://abcnews.go.com/Business/egg-prices-predicted-rise-411-2025-usda/story?id=119182317",
            published_at=datetime.strptime("2025-02-25 14:30:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://i.abcnewsfe.com/a/3dc24bd6-fdbe-4980-b0fe-eacc6aa802e6/eggs-prices-gty-lv-250225_1740518210123_hpMain_16x9.jpg?w=992"
        ),
        build_article(  # ABC News - Health
            title="Unvaccinated New Mexico resident tests positive for measles after dying",
            category_id=db_categories["Health"].id,
            source_id=db_sources["ABC News"].id,
            url="https://abcnews.go.com/Health/unvaccinated-new-mexico-resident-tests-positive-measles-after/story?id=119529919",
            published_at=datetime.strptime("2025-03-06 17:09:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://i.abcnewsfe.com/a/f155e857-238e-4847-9106-20f55ca0be2f/measles-rash-gty-jt-221122_1669155112087_hpMain_7_16x9.jpg?w=992"
        ),
        build_article(  # ABC News - Politics
            title="Trump won't sign executive order to dissolve Department of Education today: Sources",
            category_id=db_categories["Politics"].id,
            source_id=db_sources["ABC News"].id,
            url="https://abcnews.go.com/US/trump-preparing-executive-order-telling-education-secretary-dissolve/story?id=119499614",
            published_at=datetime.strptime("2025-03-06 17:09:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://i.abcnewsfe.com/a/29c5e047-bbf6-480e-a7a7-86ee1325d719/linda-mcmahon-12-rt-gmh-250213_1739466245343_hpMain_16x9.jpg?w=992"
        ),
        build_article(  # Apple - Technology
            title="Apple will spend more than $500 billion in the U.S. over the next four years",
            category_id=db_categories["Technology"].id,
            source_id=db_sources["Apple"].id,
            url="https://www.apple.com/newsroom/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/",
            published_at=datetime.strptime("2025-02-24 09:15:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://www.apple.com/newsroom/images/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/article/Apple-US-investment-Austin-research-facility-01_big.jpg.large.jpg"
        ),
        build_article(  # Apple - Entertainment
            title="Apple Music kicks off Kendrick Lamar's Road to Halftime ahead of Super Bowl LIX",
            category_id=db_categories["Entertainment"].id,
            source_id=db_sources["Apple"].id,
            url="https://www.apple.com/newsroom/2025/02/apple-music-kicks-off-kendrick-lamars-road-to-halftime-ahead-of-super-bowl-lix/",
            published_at=datetime.strptime("2025-02-03 09:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://www.apple.com/newsroom/images/2025/02/apple-music-kicks-off-kendrick-lamars-road-to-halftime-ahead-of-super-bowl-lix/article/Apple-Music-Super-Bowl-LIX-Halftime-Show-Kendrick-Lamar_big.jpg.large.jpg"
        ),
        build_article(  # Apple - Entertainment
            title="Apple Arcade launches into 2025 with 10 new games, including PGA TOUR Pro Golf",
            category_id=db_categories["Entertainment"].id,
            source_id=db_sources["Apple"].id,
            url="https://www.apple.com/newsroom/2025/01/apple-arcade-launches-into-2025-with-10-new-games-including-pga-tour-pro-golf/",
            published_at=datetime.strptime("2025-01-10 09:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://www.apple.com/newsroom/images/2025/01/apple-arcade-launches-into-2025-with-10-new-games-including-pga-tour-pro-golf/article/Apple-Arcade-hero_big.jpg.large.jpg"
        ),
        build_article(  # Los Angeles Times - Environment
            title="Boiling Point: Want to fight climate change? Then talk about climate change",
            category_id=db_categories["Environment"].id,
            source_id=db_sources["Los Angeles Times"].id,
            url="https://www.latimes.com/environment/newsletter/2025-02-25/boiling-point-want-to-fight-climate-change-then-talk-about-climate-change-boiling-point",
            published_at=datetime.strptime("2025-02-25 06:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ca-times.brightspotcdn.com/dims4/default/d68a3bb/2147483647/strip/true/crop/3600x2023+0+0/resize/1200x674!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fde%2F58%2Fc1b4f17e4de69fadc0ceb9d1d723%2F1492332-me-weather-flood-warning-16-brv.jpg"
        ),
        build_article(  # Los Angeles Times - Health
            title="Homeless deaths in L.A. County are leveling off but still nearly seven per day",
            category_id=db_categories["Health"].id,
            source_id=db_sources["Los Angeles Times"].id,
            url="https://www.latimes.com/california/story/2025-03-06/homeless-deaths-in-l-a-county-are-leveling-off-but-still-nearly-seven-per-day",
            published_at=datetime.strptime("2025-02-25 06:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ca-times.brightspotcdn.com/dims4/default/9ca6354/2147483647/strip/true/crop/6881x4590+0+0/resize/1200x800!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F86%2Faf%2F90e6ece64fce86fa47b98a818709%2F1495259-me-homeless-count-jja-045.jpg"
        ),
        build_article(  # Los Angeles Times - Environment
            title="The U.S. has withdrawn from a climate agreement that helps developing nations, South Africa says",
            category_id=db_categories["Environment"].id,
            source_id=db_sources["Los Angeles Times"].id,
            url="https://www.latimes.com/world-nation/story/2025-03-06/the-us-has-withdrawn-from-a-climate-agreement-that-helps-developing-nations-south-africa-says",
            published_at=datetime.strptime("2025-03-06 07:56:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ca-times.brightspotcdn.com/dims4/default/0f63239/2147483647/strip/true/crop/4320x2889+7+0/resize/1024x685!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F5a%2F17%2F3300311f172abb078dad148bc10d%2Fc68e6178c70b4f6e92e3b2626034246f"
        ),
        build_article(  # NBC News - Health
            title="As Texas measles outbreak grows, parents are choosing to vaccinate kids",
            category_id=db_categories["Health"].id,
            source_id=db_sources["NBC News"].id,
            url="https://www.nbcnews.com/health/health-news/texas-measles-outbreak-grows-parents-vaccinate-rcna193637",
            published_at=datetime.strptime("2025-02-25 18:06:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2025-02/250225-measles-testing-texas-mn-1035-fcd670.jpg"
        ),
        build_article(  # NBC News - Science
            title="Science under siege: Trump cuts threaten to undermine decades of research",
            category_id=db_categories["Science"].id,
            source_id=db_sources["NBC News"].id,
            url="https://www.nbcnews.com/science/science-news/trumps-nih-budget-cuts-threaten-research-stirring-panic-rcna191744",
            published_at=datetime.strptime("2025-02-18 12:55:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1240w,f_auto,q_auto:best/rockcms/2025-02/250213-donald-trump-science-overhaul-cdc-nih-epa-cs-0b646a.jpg"
        ),
        build_article(  # NPR - Politics
            title="After GOP passes budget resolution, Congress to-do list only gets tougher from here",
            category_id=db_categories["Politics"].id,
            source_id=db_sources["NPR"].id,
            url="https://www.npr.org/2025/02/25/nx-s1-5308067/house-republicans-budget-vote-mike-johnson",
            published_at=datetime.strptime("2025-02-26 15:04:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://npr.brightspotcdn.com/dims3/default/strip/false/crop/6000x4000+0+0/resize/800/quality/85/format/webp/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fd3%2F97%2F8aca643b417db44c9d985a2ac65e%2Fgettyimages-2201316835.jpg"
        ),
        build_article(  # NPR - Entertainment
            title="Our 25 most-anticipated games of 2025 including Grand Theft Auto 6 (maybe)",
            category_id=db_categories["Entertainment"].id,
            source_id=db_sources["NPR"].id,
            url="https://www.npr.org/2025/01/13/g-s1-41804/grand-theft-auto-6-nintendo-switch-2-most-anticipated-2025-games",
            published_at=datetime.strptime("2025-01-13 05:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://npr.brightspotcdn.com/dims3/default/strip/false/crop/1920x1080+0+0/resize/800/quality/85/format/webp/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F07%2F30%2F2454a0b8478facd74b9f0cc2fabd%2Fquadshot2025.jpg"
        ),
        build_article(  # Bloomberg - Politics
            title="Europe's Defenses Risk Faltering Within Weeks Without US Support",
            category_id=db_categories["Politics"].id,
            source_id=db_sources["Bloomberg"].id,
            url="https://www.bloomberg.com/news/features/2025-03-06/europe-s-defenses-against-russia-invasion-would-last-weeks-without-trump-support?srnd=phx-politics",
            published_at=datetime.strptime("2025-03-07 08:03:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iysTXSayk8b8/v1/2000x1334.webp"
        ),
        build_article(  # Bloomberg - Business
            title="Half a Million US Jobs on the Line as DOGE Fallout Spreads",
            category_id=db_categories["Business"].id,
            source_id=db_sources["Bloomberg"].id,
            url="https://www.bloomberg.com/news/articles/2025-03-06/half-a-million-us-jobs-are-on-the-line-as-doge-fallout-spreads?srnd=phx-economics-v2",
            published_at=datetime.strptime("2025-03-06 09:00:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/io6XJVHxqHeM/v1/459x306.webp"
        ),
        build_article(  # The New York Times - Sports
            title="A Muslim Athlete Needed Modest Sportswear. Now She Sells It to Others.",
            category_id=db_categories["Sports"].id,
            source_id=db_sources["The New York Times"].id,
            url="https://www.nytimes.com/2025/03/06/style/kiandra-browne-duquesne-hijab-muslim.html#",
            published_at=datetime.strptime("2025-03-06 09:06:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://static01.nyt.com/images/2025/03/09/multimedia/06hijab-basketball-01-pbfj/06hijab-basketball-01-pbfj-superJumbo.jpg?quality=75&auto=webp"
        ),
        build_article(  # The New York Times - Sports
            title="Stephen A. Smith, ESPN agree to $100M contract that lets him talk more about politics: Sources",
            category_id=db_categories["Sports"].id,
            source_id=db_sources["The New York Times"].id,
            url="https://www.nytimes.com/athletic/6181819/2025/03/06/stephen-a-smith-contract-espn-first-take/",
            published_at=datetime.strptime("2025-03-06 18:44:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://static01.nyt.com/athletic/uploads/wp/2025/03/06160252/GettyImages-2202142576-1024x683.jpg?width=770&quality=70&auto=webp"
        ),
        build_article(  # The Hacker News - Technology
            title="Over 1,000 WordPress Sites Infected with JavaScript Backdoors Enabling Persistent Attacker Access",
            category_id=db_categories["Technology"].id,
            source_id=db_sources["The Hacker News"].id,
            url="https://thehackernews.com/2025/03/over-1000-wordpress-sites-infected-with.html",
            published_at=datetime.strptime("2025-03-06", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHX-B4i_w9DL-IFy27W9xmdKPQo98Q-e5hHgnWLC5Tly1hCCQ1_z1JsMr0Dg73C9TnpxhYv9FYKl1idTGEA6TDTw-hC2mb0fg9WDFV38kPLXYI53k4vkGvdrQ_KNlCH054dHy-CEcSEQgHtbFWNuIM3q3r4uDE3VvVO0P9DjCdpsU9FZOgSOw6f6caLpIF/s728-rw-e365/js-malware-code.png"
        ),
        build_article(  # The Hacker News - Sports
            title="NBC Sports Rotoworld forums and Mobile website defaced",
            category_id=db_categories["Sports"].id,
            source_id=db_sources["The Hacker News"].id,
            url="https://thehackernews.com/2012/11/nbc-websites-hacked-to-promote-nov5th.html",
            published_at=datetime.strptime("2012-11-04", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjABgh_Zp3ISQJDBLoGhD8iuWm-e2-xtlOdt-5SyMCy_DbPeR_VpjXN3WPiBZZxkLkL9nRbluCZmOPflGpjgmYCALDqJoiIcwJz746JeEdp4bD3blhpfNH8uYddsJNx79bLoz_S0XFDo0/s640/NBC+websites.png"
        ),
        build_article(  # The Hacker News - Technology
            title="Three Password Cracking Techniques and How to Defend Against Them",
            category_id=db_categories["Technology"].id,
            source_id=db_sources["The Hacker News"].id,
            url="https://thehackernews.com/2025/02/three-password-cracking-techniques-and.html",
            published_at=datetime.strptime("2025-02-26", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhwGAvNH5LRiDq-0ZWPHDI9alRFHDWjhKN4zd0lmO5HJHm55Ni5ZWO_Yg_F8J0P0yVk5gkNHzntGhzUEHcYi-qU6-12LDfGR1Q-HHkInSRAxNN22NmkjLsKBBFasd8xn2uOvxti-cB0WJ6DV6hIPghmELGzJsw1vcl5PdT2HWVDIRlKMGK99utcSipwr6I/s728-rw-e365/main.png"
        ),
        build_article(  # BBC - Environment
            title="US lost a fifth of its butterflies within two decades",
            category_id=db_categories["Environment"].id,
            source_id=db_sources["BBC"].id,
            url="https://www.bbc.com/news/articles/cwyjkn729gpo",
            published_at=datetime.strptime("2025-03-06 14:37:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ichef.bbci.co.uk/news/1024/cpsprodpb/2680/live/dee68b80-f8fd-11ef-806b-d7666ddeb600.jpg.webp"
        ),
        build_article(  # BBC - Business
            title="Carmakers win break from Trump's tariffs on Canada and Mexico",
            category_id=db_categories["Business"].id,
            source_id=db_sources["BBC"].id,
            url="https://www.bbc.com/news/articles/c62zn47d5j1o",
            published_at=datetime.strptime("2025-03-06 02:39:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://ichef.bbci.co.uk/news/1024/cpsprodpb/6d46/live/b1a72da0-f9f2-11ef-9877-67fac07f10ae.jpg.webp"
        ),
        build_article(  # CNN - Science
            title="Intuitive Machines’ Athena lander is on the moon’s surface but its status is unclear",
            category_id=db_categories["Science"].id,
            source_id=db_sources["CNN"].id,
            url="https://www.cnn.com/2025/03/06/science/intuitive-machines-im2-moon-landing/index.html",
            published_at=datetime.strptime("2025-03-06 17:34:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://media.cnn.com/api/v1/images/stellar/prod/ap25065635798647.jpg?c=original&q=w_1280,c_fill"
        ),
        build_article(  # CNN - Science
            title="Firefly shares video of Blue Ghost's nail-biting descent to the lunar surface",
            category_id=db_categories["Science"].id,
            source_id=db_sources["CNN"].id,
            url="https://www.cnn.com/2025/03/05/science/blue-ghost-moon-landing-footage/index.html?iid=cnn_buildContentRecirc_end_recirc",
            published_at=datetime.strptime("2025-03-06 14:37:00", "%Y-%m-%d %H:%M:%S"),
            image_url="https://cdn.mos.cms.futurecdn.net/AgnS3eqq2b66aaipjov5Do-970-80.jpg.webp"
        ),
        build_article(  # The Hacker News - Technology
            title="THN Weekly Recap: iOS Zero-Days, 4Chan Breach, NTLM Exploits, WhatsApp Spyware & More",
            category_id=db_categories["Technology"].id,
            source_id=db_sources["The Hacker News"].id,
            url="https://thehackernews.com/2025/04/thn-weekly-recap-ios-zero-days-4chan.html",
            published_at=datetime.strptime("2025-04-21", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh2xukBJUi8pjcSfvONOoKAOoUFu4tQNu6RK5essP9M7D238JyV-pEN-D2SHsod1qYHst-7D1ND4NkWWTC2i1FervBo13M3mnQzLykv2D2iXaMl991lEK1CMefnrdJcxKcpIfVLoNbbarH6PW6p9uSgxymvfhgCBUyA7iB1gMSTpeCZjqDT-_Y5i2yEmjsc/s728-rw-e365/recap.jpg"
        ),
        build_article(  # The Hacker News - Business
            title="U.S. Govt. Funding for MITRE's CVE Ends April 16, Cybersecurity Community on Alert",
            category_id=db_categories["Business"].id,
            source_id=db_sources["The Hacker News"].id,
            url="https://thehackernews.com/2025/04/us-govt-funding-for-mitres-cve-ends.html",
            published_at=datetime.strptime("2025-04-16", "%Y-%m-%d"),
            image_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBK-WrodfGXNvPqkkYGA_5NZ_pM__OxFG-N9N8I-Z1chfySLHQRQXvcwb1vGbG4de8ktuAKMeaSTg4Rz-WgYK9xlOaQ1-xNAamTBybbbPytbP8sml_W9rWEGmefajmi4PkXUMp0hg_imRWemkIHZmBkLvHAH-7mZqYde1wacWu1IIE7BbsbDkOBSnXXp5K/s728-rw-e365/mitre-cve.jpg"
        ),
        build_article(  # ABC News - Politics
            title="Pope Francis makes surprise appearance at St. Peter's Basilica",
            category_id=db_categories["Politics"].id,
            source_id=db_sources["ABC News"].id,
            url="https://abcnews.go.com/International/pope-francis-makes-surprise-appearance-st-peters-basilica/story?id=120978110",
            published_at=datetime.strptime("2025-04-19", "%Y-%m-%d"),
            image_url="https://i.abcnewsfe.com/a/c9b10732-cba9-4862-83d4-b590ea33c672/pope-02-ht-jt-250419_1745090609080_hpMain.jpg?w=750"
        ),
        build_article(  # ABC News - Politics
            title="Pope Francis, everyman leader of the Roman Catholic Church, dies at 88",
            category_id=db_categories["Politics"].id,
            source_id=db_sources["ABC News"].id,
            url="https://abcnews.go.com/International/pope-francis-everyman-leader-roman-catholic-church-dies/story?id=24335298",
            published_at=datetime.strptime("2025-04-21", "%Y-%m-%d"),
            image_url="https://s.abcnews.com/images/International/pope-francis-file-gty-jef-230329_1680131037961_hpMain_4x3t_240.jpg"
        ),
        build_article(  # ABC News - Technology
            title="Why 3D printing could make housing cheaper and more sustainable",
            category_id=db_categories["Technology"].id,
            source_id=db_sources["ABC News"].id,
            url="https://abcnews.go.com/US/3d-printing-make-housing-cheaper-sustainable/story?id=121047346",
            published_at=datetime.strptime("2025-04-23", "%Y-%m-%d"),
            image_url="https://s.abcnews.com/images/US/3d-1-abc-er-250422_1745352781657_hpMain_4x3t_240.jpg"
        ),
        build_article(  # ABC News - Business
            title="Pope Francis appears for Easter Sunday blessing after meeting JD Vance at Vatican",
            category_id=db_categories["Business"].id,
            source_id=db_sources["ABC News"].id,
            url="https://abcnews.go.com/International/pope-francis-exchanges-easter-jd-vance-vatican/story?id=120987032",
            published_at=datetime.strptime("2025-04-20", "%Y-%m-%d"),
            image_url="https://s.abcnews.com/images/International/jd-vance2-gty-bh-250420_1745153399045_hpMain_4x3t_240.jpg"
        ),
        build_article(  # ABC News - Entertainment
            title="xxx",
            category_id=db_categories["Entertainment"].id,
            source_id=db_sources["Good Morning America"].id,
            url="https://www.goodmorningamerica.com/family/story/teen-fans-minecraft-movie-spark-mayhem-chicken-jockey-120630292",
            published_at=datetime.strptime("2025-04-14", "%Y-%m-%d"),
            image_url="https://s.abcnews.com/images/GMA/minecraft-ht-jef-250409_1744200888451_hpMain_4x3t_240.jpg"
        ),
        build_article(  # ABC News - Entertainment
            title="McDonald's and Minecraft team up for new Happy Meal",
            category_id=db_categories["Entertainment"].id,
            source_id=db_sources["Good Morning America"].id,
            url="https://www.goodmorningamerica.com/food/story/mcdonalds-minecraft-team-new-happy-meal-120407485",
            published_at=datetime.strptime("2025-04-02", "%Y-%m-%d"),
            image_url="https://s.abcnews.com/images/GMA/minecraft-mcdonalds-main-ht-jt-250402_1743609585458_hpMain_4x3t_240.jpg"
        ),
        build_article( 
            title="The record-breaking tunnel being built from Denmark to Germany",
            category_id=db_categories["Technology"].id,
            source_id=db_sources["BBC"].id,
            url="https://www.bbc.com/news/articles/cy70y2x3xj6o",
            published_at=datetime.strptime("2025-04-22", "%Y-%m-%d"),
            image_url="https://ichef.bbci.co.uk/news/1024/cpsprodpb/a9d2/live/f6d90120-19e4-11f0-bff1-bba065990f72.jpg.webp"
        ),
        build_article( 
            title="General Motors wins F1 engine approval for 2029",
            category_id=db_categories["Technology"].id,
            source_id=db_sources["BBC"].id,
            url="https://www.bbc.com/sport/formula1/articles/c8epgyx80g4o",
            published_at=datetime.strptime("2025-04-23", "%Y-%m-%d"),
            image_url="https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/43f8/live/f22ead20-ce9c-11ef-8003-5563c395c8f2.jpg.webp"
        ),
        build_article( 
            title="Piastri wins in Saudi Arabia and takes title lead",
            category_id=db_categories["Sports"].id,
            source_id=db_sources["BBC"].id,
            url="https://www.bbc.com/sport/formula1/articles/c0l09543x3lo",
            published_at=datetime.strptime("2025-04-20", "%Y-%m-%d"),
            image_url="https://ichef.bbci.co.uk/ace/standard/800/cpsprodpb/2076/live/901a24d0-1e1e-11f0-b265-abe347419ae3.jpg.webp"
        ),
        build_article( 
            title="'I've let myself & the team down' - Norris on qualifying 'shunt'",
            category_id=db_categories["Sports"].id,
            source_id=db_sources["BBC"].id,
            url="https://www.bbc.com/sport/formula1/articles/cp8vzv29p3vo",
            published_at=datetime.strptime("2025-04-19", "%Y-%m-%d"),
            image_url="https://ichef.bbci.co.uk/ace/standard/800/cpsprodpb/41c2/live/7fb22330-1d52-11f0-8408-f7067c9fa54e.jpg.webp"
        ),
    ]
