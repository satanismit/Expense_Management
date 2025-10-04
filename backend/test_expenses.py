#!/usr/bin/env python3
"""
Test script for the Expense Management API
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_expense_apis():
    print("🧪 Testing Expense Management APIs...")
    
    # Test data
    test_user = {
        "company_name": "Test Company",
        "email": "admin@test.com",
        "password": "testpass123"
    }
    
    test_expense = {
        "title": "Test Expense",
        "amount": 100.50,
        "category": "Office Supplies",
        "date": "2024-01-15",
        "description": "Test expense for API testing"
    }
    
    try:
        # 1. Create a test company and admin user
        print("\n1. Creating test company and admin user...")
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json=test_user)
        if signup_response.status_code == 201:
            print("✅ Company and admin user created successfully")
            signup_data = signup_response.json()
            token = signup_data['access_token']
            user_id = signup_data['user']['id']
            company_id = signup_data['user']['company_id']
            print(f"   User ID: {user_id}")
            print(f"   Company ID: {company_id}")
        else:
            print(f"❌ Failed to create company: {signup_response.text}")
            return
        
        # Set up headers for authenticated requests
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 2. Test adding an expense
        print("\n2. Testing add expense...")
        add_response = requests.post(f"{BASE_URL}/expenses/add", json=test_expense, headers=headers)
        if add_response.status_code == 201:
            print("✅ Expense added successfully")
            expense_data = add_response.json()
            expense_id = expense_data['expense_id']
            print(f"   Expense ID: {expense_id}")
        else:
            print(f"❌ Failed to add expense: {add_response.text}")
            return
        
        # 3. Test listing expenses
        print("\n3. Testing list expenses...")
        list_response = requests.get(f"{BASE_URL}/expenses/list", headers=headers)
        if list_response.status_code == 200:
            print("✅ Expenses listed successfully")
            expenses = list_response.json()['expenses']
            print(f"   Found {len(expenses)} expense(s)")
            for expense in expenses:
                print(f"   - {expense['title']}: ${expense['amount']} ({expense['category']})")
        else:
            print(f"❌ Failed to list expenses: {list_response.text}")
            return
        
        # 4. Test updating an expense
        print("\n4. Testing update expense...")
        update_data = {
            "title": "Updated Test Expense",
            "amount": 150.75,
            "description": "Updated description"
        }
        update_response = requests.put(f"{BASE_URL}/expenses/update/{expense_id}", json=update_data, headers=headers)
        if update_response.status_code == 200:
            print("✅ Expense updated successfully")
        else:
            print(f"❌ Failed to update expense: {update_response.text}")
        
        # 5. Test deleting an expense
        print("\n5. Testing delete expense...")
        delete_response = requests.delete(f"{BASE_URL}/expenses/delete/{expense_id}", headers=headers)
        if delete_response.status_code == 200:
            print("✅ Expense deleted successfully")
        else:
            print(f"❌ Failed to delete expense: {delete_response.text}")
        
        # 6. Verify expense is deleted
        print("\n6. Verifying expense deletion...")
        list_response = requests.get(f"{BASE_URL}/expenses/list", headers=headers)
        if list_response.status_code == 200:
            expenses = list_response.json()['expenses']
            print(f"   Found {len(expenses)} expense(s) after deletion")
            if len(expenses) == 0:
                print("✅ Expense successfully deleted")
            else:
                print("❌ Expense still exists after deletion")
        
        print("\n🎉 All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the backend server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    test_expense_apis()
