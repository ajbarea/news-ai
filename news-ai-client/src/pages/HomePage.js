import React, { useState } from 'react';
import { Container, Row, Col, Button, ButtonGroup, Card, CardText } from 'reactstrap';
import ArticleCard from '../components/ArticleCard';

function HomePage() {
    // Article Card sample data
    const sampleArticles = [
        {
            id: 1,
            source: "ABC News",
            title: "Egg prices predicted to soar more than 41% in 2025: USDA",
            summary: "The cost of eggs is expected to rise by over 41% in 2025, according to a new report from the U.S. Department of Agriculture. The increase is driven by a combination of factors, including rising feed costs and increased demand.",
            category: "Business",
            date: "2025-02-25",
            imageUrl: "https://i.abcnewsfe.com/a/3dc24bd6-fdbe-4980-b0fe-eacc6aa802e6/eggs-prices-gty-lv-250225_1740518210123_hpMain_16x9.jpg?w=992",
            url: "https://abcnews.go.com/Business/egg-prices-predicted-rise-411-2025-usda/story?id=119182317"
        },
        {
            id: 2,
            title: "Apple will spend more than $500 billion in the U.S. over the next four years",
            summary: "Apple has announced plans to invest more than $500 billion in the U.S. economy over the next four years. The tech giant will focus on creating jobs, supporting innovation, and building a more sustainable future.",
            category: "Technology",
            date: "2025-02-24",
            imageUrl: "https://www.apple.com/newsroom/images/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/article/Apple-US-investment-Austin-research-facility-01_big.jpg.large.jpg",
            url: "https://www.apple.com/newsroom/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/"
        },
        {
            id: 3,
            title: "Boiling Point: Want to fight climate change? Then talk about climate change",
            summary: "The recent heatwave in the Pacific Northwest has sparked conversations about climate change and the urgent need for action. Experts say that discussing climate change openly and honestly is crucial to driving policy changes and reducing emissions.",
            category: "Environment",
            date: "2025-02-10",
            imageUrl: "https://ca-times.brightspotcdn.com/dims4/default/d68a3bb/2147483647/strip/true/crop/3600x2023+0+0/resize/1200x674!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fde%2F58%2Fc1b4f17e4de69fadc0ceb9d1d723%2F1492332-me-weather-flood-warning-16-brv.jpg",
            url: "https://www.latimes.com/environment/newsletter/2025-02-25/boiling-point-want-to-fight-climate-change-then-talk-about-climate-change-boiling-point"
        },
        {
            id: 4,
            title: "As Texas measles outbreak grows, parents are choosing to vaccinate kids",
            summary: "The measles outbreak in Texas has prompted many parents to get their children vaccinated. Health officials are urging the public to take preventive measures to stop the spread of the disease.",
            category: "Health",
            date: "2025-02-09",
            imageUrl: "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2025-02/250225-measles-testing-texas-mn-1035-fcd670.jpg",
            url: "https://www.nbcnews.com/health/health-news/texas-measles-outbreak-grows-parents-vaccinate-rcna193637"
        },
        {
            id: 5,
            title: "House Republicans pass budget resolution, clearing a key early test for Trump agenda",
            summary: "House Republicans passed a budget proposal that would increase defense spending and cut social programs. The bill is expected to face opposition in the Senate.",
            category: "Politics",
            date: "2025-02-25",
            imageUrl: "https://npr.brightspotcdn.com/dims3/default/strip/false/crop/6000x4000+0+0/resize/800/quality/85/format/webp/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fd3%2F97%2F8aca643b417db44c9d985a2ac65e%2Fgettyimages-2201316835.jpg",
            url: "https://www.npr.org/2025/02/25/nx-s1-5308067/house-republicans-budget-vote-mike-johnson"
        }
    ];

    const [activeCategory, setActiveCategory] = useState('All');
    const categories = ['All', 'Business', 'Technology', 'Environment', 'Health', 'Politics'];

    const filteredArticles = activeCategory === 'All'
        ? sampleArticles
        : sampleArticles.filter(article => article.category === activeCategory);

    return (
        <Container className="mt-5 mb-4">
            <Row className="mb-4">
                <Col>
                    <h1>Welcome to News-AI</h1>
                    <p>
                        Stay informed with the latest news, trends, and stories from around the world.
                        Our AI-powered platform brings you personalized content tailored to your interests.
                    </p>
                </Col>
            </Row>

            {/* Category Filter */}
            <Row className="mb-4">
                <Col>
                    <ButtonGroup className="overflow-auto" style={{ flexWrap: 'wrap' }}>
                        {categories.map(category => (
                            <Button
                                key={category}
                                color={activeCategory === category ? "primary" : "secondary"}
                                outline={activeCategory !== category}
                                onClick={() => setActiveCategory(category)}
                                className="me-2 mb-2"
                            >
                                {category}
                            </Button>
                        ))}
                    </ButtonGroup>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <h2 className="mb-3">
                        {activeCategory === 'All' ? 'Featured News' : `${activeCategory} News`}
                    </h2>
                </Col>
            </Row>

            <Row>
                {filteredArticles.map(article => (
                    <Col key={article.id} md="6" lg="4" className="mb-4">
                        <ArticleCard article={article} />
                    </Col>
                ))}
            </Row>

            {filteredArticles.length === 0 && (
                <Row className="py-5">
                    <Col className="text-center">
                        <Card body>
                            <CardText className="mb-3">No articles found in this category.</CardText>
                            <Button
                                color="primary"
                                onClick={() => setActiveCategory('All')}
                            >
                                View All Articles
                            </Button>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default HomePage;