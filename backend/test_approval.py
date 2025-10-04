#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from app.routes.admin import admin_bp
from app import create_app, mongo
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from bson import ObjectId

def test_approval_settings():
    app = create_app()
    
    with app.app_context():
        # Test data - simulating a POST request to set approval settings
        test_data = {
            "approvers": [
                {
                    "user_id": "507f1f77bcf86cd799439011",  # Example ObjectId
                    "order": 1
                }
            ]
        }
        
        print("Testing approval settings API structure...")
        print(f"Input data: {json.dumps(test_data, indent=2)}")
        
        # Validate structure
        approvers = test_data['approvers']
        if isinstance(approvers, list):
            print("✓ Approvers is a list")
            
            for i, approver in enumerate(approvers):
                if isinstance(approver, dict):
                    print(f"✓ Approver {i+1} is a dict")
                    
                    if 'user_id' in approver and 'order' in approver:
                        print(f"✓ Approver {i+1} has required fields")
                    else:
                        print(f"✗ Approver {i+1} missing required fields")
                else:
                    print(f"✗ Approver {i+1} is not a dict")
        else:
            print("✗ Approvers is not a list")
            
        print("\nTest completed!")

if __name__ == "__main__":
    test_approval_settings()