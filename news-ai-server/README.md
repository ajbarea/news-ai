# News-AI Backend Python API

## Overview

This backend powers the News-AI application, providing API endpoints for news analysis, summarization, and AI-driven content recommendations.

## Tech Stack

- **Frontend**: React
- **Backend**: FastAPI + AI models
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based auth

## Architecture

```ascii
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │      │   FastAPI   │      │ PostgreSQL  │
│  Frontend   │<────>│   Backend   │<────>│  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                           │
                     ┌─────┴─────┐
                     │ AI Models │
                     └───────────┘
```

## Development Setup

### Prerequisites

- Python 3.8+
- PostgreSQL
- Node.js (for frontend)

### Environment Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/Scripts/activate  # Windows
# OR
source .venv/bin/activate      # Unix/MacOS
```

Verify the environment is active:

```bash
which python  # Should point to your .venv Python
python --version
```

### Installation

Upgrade pip:

```bash
python -m pip install --upgrade pip
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Or install FastAPI directly:

```bash
pip install "fastapi[standard]"
```

## Running the Application

Start the development server:

```bash
fastapi dev main.py
```

The API will be available at <http://localhost:8000>

Swagger documentation: <http://localhost:8000/docs>
ReDoc documentation: <http://localhost:8000/redoc>

## Project Structure

```plaintext
news-ai-server/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Core functionality
│   ├── db/           # Database models and migrations
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   ├── ai/           # AI models and processing
│   └── main.py       # Application entry point
├── tests/            # Test suite
├── scripts/          # Utility scripts
└── .venv/            # Virtual environment (gitignored)
```

## API Documentation

Detailed API documentation is available through Swagger UI when the application is running.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pytest`
4. Submit a pull request

## Notes for Developers

- Remember to update requirements.txt when adding new dependencies
- Keep the .venv directory in .gitignore
