DROP TABLE IF EXISTS user_source_blacklist CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    logo_url TEXT
);

CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0, -- Increment category score with user interaction
    blacklisted BOOLEAN DEFAULT FALSE,
    UNIQUE (user_id, category_id)
);

CREATE TABLE user_source_blacklist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE, -- Reference sources table
    UNIQUE (user_id, source_id)
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE, -- Reference sources table
    url TEXT NOT NULL,
    published_at TIMESTAMP NOT NULL,
    image_url TEXT,
    summary TEXT,
    subscription_required BOOLEAN DEFAULT FALSE
);

INSERT INTO users (username, email, password_hash) VALUES
('JohnDoe', 'johndoe@example.com','$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('AJ', 'ajb6289@rit.edu', '$2b$10$3');

INSERT INTO categories (name) VALUES 
('business'), ('entertainment'), ('politics'), ('health'), ('science'), ('sports'), ('technology'), ('environment');

INSERT INTO sources (name, url, logo_url) VALUES
('ABC News', 'https://abcnews.go.com', 'https://abcnews.go.com/logo.png'),
('Apple', 'https://www.apple.com/newsroom/', 'https://www.apple.com/logo.png'),
('Los Angeles Times', 'https://www.latimes.com', 'https://www.latimes.com/logo.png'),
('NBC News', 'https://www.nbcnews.com', 'https://www.nbcnews.com/logo.png'),
('NPR', 'https://www.npr.org', 'https://www.npr.org/logo.png'),
('BBC', 'https://www.bbc.com', 'https://www.bbc.com/logo.png'),
('CNN', 'https://www.cnn.com','https://www.cnn.com/logo.png'),
('The New York Times', 'https://www.nytimes.com', 'https://www.nytimes.com/logo.png'),
('Hacker News', 'https://news.ycombinator.com', 'https://news.ycombinator.com/y18.gif'),
('Bloomberg', 'https://www.bloomberg.com', 'https://www.bloomberg.com/logo.png');

INSERT INTO articles (title, category_id, source_id, url, published_at, image_url, summary, subscription_required) VALUES
('Egg prices predicted to soar more than 41% in 2025: USDA', 1, 1, 
 'https://abcnews.go.com/Business/egg-prices-predicted-rise-411-2025-usda/story?id=119182317', 
 '2025-02-25', 
 'https://i.abcnewsfe.com/a/3dc24bd6-fdbe-4980-b0fe-eacc6aa802e6/eggs-prices.jpg', NULL, FALSE),

('Apple will spend more than $500 billion in the U.S. over the next four years', 7, 2, 
 'https://www.apple.com/newsroom/2025/02/apple-will-spend-more-than-500-billion-usd-in-the-us-over-the-next-four-years/', 
 '2025-02-24', 
 'https://www.apple.com/newsroom/images/2025/02/apple-investment.jpg', NULL, FALSE),

('Boiling Point: Want to fight climate change? Then talk about climate change', 5, 3, 
 'https://www.latimes.com/environment/newsletter/2025-02-25/boiling-point-want-to-fight-climate-change-then-talk-about-climate-change-boiling-point', 
 '2025-02-10', 
 'https://ca-times.brightspotcdn.com/climate-change.jpg', NULL, FALSE),

('As Texas measles outbreak grows, parents are choosing to vaccinate kids', 4, 4, 
 'https://www.nbcnews.com/health/health-news/texas-measles-outbreak-grows-parents-vaccinate-rcna193637', 
 '2025-02-09', 
 'https://media-cldnry.s-nbcnews.com/image/upload/measles-testing-texas.jpg', NULL, FALSE),

('House Republicans pass budget resolution, clearing a key early test for Trump agenda', 3, 5, 
 'https://www.npr.org/2025/02/25/nx-s1-5308067/house-republicans-budget-vote-mike-johnson', 
 '2025-02-25', 
 'https://npr.brightspotcdn.com/house-republicans-budget.jpg', NULL, FALSE);


-- SELECT * FROM users;
-- SELECT * FROM categories;
-- SELECT * FROM sources;
-- SELECT * FROM user_preferences;
-- SELECT * FROM user_source_blacklist;
-- SELECT * FROM articles;