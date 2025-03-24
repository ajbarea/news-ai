"""
Utility script to generate a secure random secret key.
Run this script to generate a new secret key for your .env file.
"""
import secrets
import base64


def generate_secret_key(length=32):
    """Generate a secure random secret key."""
    return base64.urlsafe_b64encode(secrets.token_bytes(length)).decode('utf-8')


if __name__ == "__main__":
    print("Generated Secret Key:")
    print(generate_secret_key())
    print("\nCopy this key to your .env file")
