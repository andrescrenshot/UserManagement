import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "user-management-secret"
)

print("=== DATABASE CONFIG ===")
print("DB_HOST:", DB_HOST)
print("DB_PORT:", DB_PORT)
print("DB_USER:", DB_USER)
print("DB_NAME:", DB_NAME)
print("=======================")