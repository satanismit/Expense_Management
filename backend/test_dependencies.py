#!/usr/bin/env python3
"""
Test script to check if all dependencies are installed and working
"""

print("Testing Oddu Backend Dependencies...")
print("=" * 50)

try:
    import flask
    print("✅ Flask installed:", flask.__version__)
except ImportError as e:
    print("❌ Flask not installed:", e)

try:
    import flask_pymongo
    print("✅ Flask-PyMongo installed")
except ImportError as e:
    print("❌ Flask-PyMongo not installed:", e)

try:
    import flask_jwt_extended
    print("✅ Flask-JWT-Extended installed")
except ImportError as e:
    print("❌ Flask-JWT-Extended not installed:", e)

try:
    import flask_mail
    print("✅ Flask-Mail installed")
except ImportError as e:
    print("❌ Flask-Mail not installed:", e)

try:
    import flask_cors
    print("✅ Flask-CORS installed")
except ImportError as e:
    print("❌ Flask-CORS not installed:", e)

try:
    import pymongo
    print("✅ PyMongo installed:", pymongo.version)
    
    # Test MongoDB connection
    from pymongo import MongoClient
    client = MongoClient('mongodb://localhost:27017/')
    client.admin.command('ping')
    print("✅ MongoDB connection successful")
    client.close()
except Exception as e:
    print("❌ MongoDB connection failed:", e)

try:
    import bcrypt
    print("✅ bcrypt installed")
except ImportError as e:
    print("❌ bcrypt not installed:", e)

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv installed")
except ImportError as e:
    print("❌ python-dotenv not installed:", e)

print("\n" + "=" * 50)
print("Test completed. Please check for any ❌ errors above.")