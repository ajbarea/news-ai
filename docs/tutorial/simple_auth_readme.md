# OAuth2 Authentication Tutorial

This module demonstrates a simple OAuth2 password flow implementation in FastAPI.

## Overview

`simple_auth.py` showcases how to implement basic authentication with:

- OAuth2 password flow
- User models with Pydantic
- Dependency injection for authentication
- Token-based user verification

## Key Components

### Models

- `User`: Base user model with username, email, full name, and disabled status
- `UserInDB`: Extended user model that includes the hashed password

### Authentication Functions

- `fake_hash_password()`: Simulates password hashing (for demo purposes only)
- `get_user()`: Retrieves a user from the database by username
- `fake_decode_token()`: Simulates token decoding (for demo purposes only)
- `get_current_user()`: Dependency that extracts and validates the current user from a token
- `get_current_active_user()`: Dependency that ensures the current user is active

### Endpoints

- `POST /token`: Login endpoint that returns an access token
- `GET /users/me`: Endpoint to get the current authenticated user's information

## Usage Example

To authenticate:

```bash
# Get token
curl -X POST "http://localhost:8000/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=johndoe&password=secret"

# Use token to access protected endpoint
curl -X GET "http://localhost:8000/users/me" -H "Authorization: Bearer johndoe"
```

## Important Notes

- This implementation is for demonstration only and is not secure for production
- The password hashing is fake and the token is simply the username
- In a real application, you should use proper password hashing and JWT tokens
