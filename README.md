# News-AI

[![codecov](https://codecov.io/github/ajbarea/news-ai/graph/badge.svg?token=68JmKbo4jp)](https://codecov.io/github/ajbarea/news-ai) [![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ajbarea_news-ai&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ajbarea_news-ai)

## Introduction

An AI-powered news aggregation platform that provides personalized content recommendations and article summaries.

## Features

- Article summarization using AI models
- Personalized content recommendations
- Text-to-speech capabilities
- Multi-source news aggregation
- User preference management

## Documentation

For detailed documentation, see [Design Documentation](./docs/DesignDoc.md)

## Team

Group 3 - SWEN-732 Collaborative Software Development

- Daniel Arcega
- AJ Barea
- Daniel Corcoran
- Ivan Rojas

## Development

### Database

1. Install PostgreSQL from the [official website](https://www.postgresql.org/download/)
2. During installation, use the default settings with:
   - Username: `postgres`
   - Password: `postgres`
   - Port: `5432`
3. When you launch the FastAPI server, it will automatically create the necessary tables in the PostgreSQL database under the public schema

### Client

```bash
cd news-ai-client
npm install # Install dependencies
npm test # Run unit tests
npm start # Launch React client
```

### Server

```bash
cd news-ai-server
python -m venv .venv # Create virtual environment
source .venv/Scripts/activate  # Windows
# OR
source .venv/bin/activate      # Unix/MacOS
which python  # Should point to your .venv Python
python -m pip install --upgrade pip # Upgrade pip
pip install -r requirements.txt # Install dependencies
fastapi dev main.py # Launch Python FastAPI server
```
