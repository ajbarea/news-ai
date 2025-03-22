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

## Key Features

### Clean Architecture

The application follows clean architecture principles with clear separation of concerns:

- **API Layer**: Routes and controllers handle HTTP requests and responses
- **Service Layer**: Encapsulates business logic and orchestrates operations
- **Data Layer**: Database models and repositories abstract data access
- **AI Layer**: Isolated AI functionality for easy testing and maintenance

### Pydantic Models

- Strong type validation for request/response data
- Automatic request body parsing and validation
- Schema-based response serialization

### Dependency Injection

- FastAPI's dependency injection system for clean, testable code
- Scoped database sessions to ensure proper resource management
- Reusable dependencies across multiple endpoints
- Easy mocking for unit and integration tests

### JWT Authentication

- Secure, token-based authentication
- Configurable token expiration and refresh
- Role-based access control
- Protected routes with dependency-based security

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

The project follows a modular structure to support the clean architecture approach:

- **API Routes**: HTTP endpoints and request handlers
- **Core**: Configuration, constants, and application-wide utilities
- **Database**: Models, migrations, and database connection management
- **Schemas/Models**: Pydantic models for data validation and serialization
- **Services**: Business logic implementation
- **AI Components**: ML model integration and inference logic
- **Tests**: Unit and integration tests

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
