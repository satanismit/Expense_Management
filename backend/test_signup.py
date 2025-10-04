#!/usr/bin/env python3
"""
Test script to check the signup endpoint directly
"""

import requests
import json

print("Testing Signup Endpoint...")
print("=" * 50)

# Test data
test_data = {
    "company_name": "Test Company",
    "email": "test@example.com",
    "password": "password123"
}

try:
    # Check if backend is running
    print("1. Checking if backend is running...")
    response = requests.get('http://localhost:5000/')
    print(f"✅ Backend is running: {response.json()}")
    
    print("\n2. Testing signup endpoint...")
    response = requests.post(
        'http://localhost:5000/auth/signup',
        headers={'Content-Type': 'application/json'},
        json=test_data,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("✅ Signup successful!")
        result = response.json()
        print(f"User created: {result.get('user', {}).get('email')}")
    else:
        print("❌ Signup failed!")
        try:
            error_data = response.json()
            print(f"Error: {error_data.get('error', 'Unknown error')}")
        except:
            print(f"Raw response: {response.text}")
            
except requests.ConnectionError:
    print("❌ Cannot connect to backend server.")
    print("Make sure the backend is running on http://localhost:5000")
    print("Run: python run.py")
    
except Exception as e:
    print(f"❌ Unexpected error: {e}")

print("\n" + "=" * 50)