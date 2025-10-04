#!/usr/bin/env python3
"""
Simple test to check backend startup and MongoDB connection
"""

import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Testing Backend Startup...")
print("=" * 50)

try:
    # Test if we can import the app
    print("1. Testing app import...")
    from app import create_app, mongo
    print("✅ App import successful")
    
    # Test app creation
    print("2. Testing app creation...")
    app = create_app()
    print("✅ App created successfully")
    
    # Test MongoDB connection within app context
    print("3. Testing MongoDB within app context...")
    with app.app_context():
        # Try to access the database
        db = mongo.db
        collections = db.list_collection_names()
        print(f"✅ MongoDB connected. Collections: {collections}")
        
        # Test a simple operation
        test_result = db.test_collection.find_one()
        print("✅ Database operations working")
    
    print("\n4. Testing signup route directly...")
    with app.test_client() as client:
        test_data = {
            "company_name": "Test Company Direct",
            "email": "direct_test@example.com",
            "password": "password123"
        }
        
        response = client.post('/auth/signup', 
                             json=test_data,
                             content_type='application/json')
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.get_data(as_text=True)}")
        
        if response.status_code == 201:
            print("✅ Direct signup test successful!")
        else:
            print("❌ Direct signup test failed!")
            
except Exception as e:
    print(f"❌ Error during testing: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)