# Basic FastAPI CRUD Tutorial

This module demonstrates a simple FastAPI implementation with basic CRUD operations.

## Overview

`item.py` showcases how to:

- Define Pydantic models for data validation
- Create API endpoints with different HTTP methods
- Handle path parameters and query parameters
- Use type annotations for better developer experience

## Key Components

### Models

- `Item`: Pydantic model representing an item with name, price, and optional is_offer flag

### Endpoints

- `GET /`: Root endpoint that returns a simple greeting
- `GET /items/{item_id}`: Endpoint to retrieve an item by ID with optional query parameter
- `PUT /items/{item_id}`: Endpoint to update an item by ID

## Usage Examples

### Get root endpoint

```bash
curl -X GET "http://localhost:8000/"
# Response: {"Hello":"World"}
```

### Get an item

```bash
curl -X GET "http://localhost:8000/items/5?q=searchquery"
# Response: {"item_id":5,"q":"searchquery"}
```

### Update an item

```bash
curl -X PUT "http://localhost:8000/items/5" -H "Content-Type: application/json" -d '{"name":"New Item","price":45.2,"is_offer":true}'
# Response: {"item_name":"New Item","item_id":5}
```

## Important Notes

- This example focuses on demonstrating FastAPI's core features
- No actual database is used; this is for API structure demonstration only
- In a real application, you would connect to a database and implement proper error handling
