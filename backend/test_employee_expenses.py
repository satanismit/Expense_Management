#!/usr/bin/env python3
"""
Test script to verify employee can fetch expenses
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_employee_expenses():
    print("🧪 Testing Employee Expense Fetching...")
    
    try:
        # 1. Create a test company and admin user
        print("\n1. Creating test company and admin user...")
        admin_data = {
            "company_name": "Test Company",
            "email": "admin@test.com",
            "password": "testpass123"
        }
        
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json=admin_data)
        if signup_response.status_code == 201:
            print("✅ Company and admin user created successfully")
            admin_result = signup_response.json()
            admin_token = admin_result['access_token']
            admin_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        else:
            print(f"❌ Failed to create company: {signup_response.text}")
            return
        
        # 2. Create an employee user
        print("\n2. Creating employee user...")
        employee_data = {
            "name": "Test Employee",
            "email": "employee@test.com",
            "password": "testpass123",
            "role": "Employee"
        }
        
        create_employee_response = requests.post(f"{BASE_URL}/users/create", json=employee_data, headers=admin_headers)
        if create_employee_response.status_code == 201:
            print("✅ Employee user created successfully")
        else:
            print(f"❌ Failed to create employee: {create_employee_response.text}")
            return
        
        # 3. Login as employee
        print("\n3. Logging in as employee...")
        employee_login_data = {
            "email": "employee@test.com",
            "password": "testpass123"
        }
        
        employee_login_response = requests.post(f"{BASE_URL}/auth/login", json=employee_login_data)
        if employee_login_response.status_code == 200:
            print("✅ Employee logged in successfully")
            employee_result = employee_login_response.json()
            employee_token = employee_result['access_token']
            employee_headers = {"Authorization": f"Bearer {employee_token}", "Content-Type": "application/json"}
            employee_id = employee_result['user']['id']
        else:
            print(f"❌ Failed to login employee: {employee_login_response.text}")
            return
        
        # 4. Employee submits an expense
        print("\n4. Employee submitting expense...")
        expense_data = {
            "description": "Test Employee Expense",
            "category": "Office Supplies",
            "amount": 50.00,
            "currency": "USD",
            "expense_date": "2024-01-15",
            "paid_by": "Test Employee",
            "remarks": "Test expense from employee"
        }
        
        add_expense_response = requests.post(f"{BASE_URL}/expenses/add", json=expense_data, headers=employee_headers)
        if add_expense_response.status_code == 201:
            print("✅ Expense submitted successfully")
            expense_result = add_expense_response.json()
            print(f"   Status: {expense_result['status']}")
        else:
            print(f"❌ Failed to submit expense: {add_expense_response.text}")
            return
        
        # 5. Employee fetches their expenses
        print("\n5. Employee fetching expenses...")
        list_expenses_response = requests.get(f"{BASE_URL}/expenses/list", headers=employee_headers)
        if list_expenses_response.status_code == 200:
            print("✅ Expenses fetched successfully")
            expenses_result = list_expenses_response.json()
            expenses = expenses_result['expenses']
            print(f"   Found {len(expenses)} expense(s)")
            for expense in expenses:
                print(f"   - {expense['description']}: ${expense['amount']} ({expense['status']})")
        else:
            print(f"❌ Failed to fetch expenses: {list_expenses_response.text}")
            print(f"   Response status: {list_expenses_response.status_code}")
            print(f"   Response body: {list_expenses_response.text}")
            return
        
        print("\n🎉 Employee expense fetching test completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the backend server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    test_employee_expenses()
