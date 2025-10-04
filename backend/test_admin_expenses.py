#!/usr/bin/env python3
"""
Test script to verify admin can fetch and manage expenses
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_admin_expenses():
    print("🧪 Testing Admin Expense Management...")
    
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
            admin_id = admin_result['user']['id']
            company_id = admin_result['user']['company_id']
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
        
        # 3. Login as employee and submit expenses
        print("\n3. Employee submitting expenses...")
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
        else:
            print(f"❌ Failed to login employee: {employee_login_response.text}")
            return
        
        # Submit multiple expenses
        expenses_data = [
            {
                "description": "Office Supplies",
                "category": "Office Supplies",
                "amount": 50.00,
                "currency": "USD",
                "expense_date": "2024-01-15",
                "paid_by": "Test Employee",
                "remarks": "First expense"
            },
            {
                "description": "Business Lunch",
                "category": "Meals",
                "amount": 25.50,
                "currency": "USD",
                "expense_date": "2024-01-16",
                "paid_by": "Test Employee",
                "remarks": "Client meeting"
            }
        ]
        
        for i, expense_data in enumerate(expenses_data):
            add_expense_response = requests.post(f"{BASE_URL}/expenses/add", json=expense_data, headers=employee_headers)
            if add_expense_response.status_code == 201:
                print(f"✅ Expense {i+1} submitted successfully")
            else:
                print(f"❌ Failed to submit expense {i+1}: {add_expense_response.text}")
        
        # 4. Admin fetches all expenses
        print("\n4. Admin fetching all expenses...")
        admin_expenses_response = requests.get(f"{BASE_URL}/expenses/list", headers=admin_headers)
        if admin_expenses_response.status_code == 200:
            print("✅ Admin expenses fetched successfully")
            expenses_result = admin_expenses_response.json()
            expenses = expenses_result['expenses']
            print(f"   Found {len(expenses)} expense(s)")
            for expense in expenses:
                print(f"   - {expense['description']}: ${expense['amount']} ({expense['status']}) by {expense['user_name']}")
        else:
            print(f"❌ Failed to fetch expenses for admin: {admin_expenses_response.text}")
            print(f"   Response status: {admin_expenses_response.status_code}")
            print(f"   Response body: {admin_expenses_response.text}")
            return
        
        # 5. Test admin expense stats
        print("\n5. Testing admin expense stats...")
        stats_response = requests.get(f"{BASE_URL}/admin/expenses/stats", headers=admin_headers)
        if stats_response.status_code == 200:
            print("✅ Admin stats fetched successfully")
            stats = stats_response.json()
            print(f"   Total expenses: {stats['total_expenses']}")
            print(f"   Total amount: ${stats['total_amount']}")
            print(f"   Status breakdown: {stats['status_breakdown']}")
        else:
            print(f"❌ Failed to fetch admin stats: {stats_response.text}")
        
        # 6. Test admin can edit expenses
        if expenses:
            print("\n6. Testing admin can edit expenses...")
            first_expense = expenses[0]
            update_data = {
                "description": "Updated " + first_expense['description'],
                "remarks": "Updated by admin"
            }
            update_response = requests.put(f"{BASE_URL}/expenses/update/{first_expense['_id']}", 
                                        json=update_data, headers=admin_headers)
            if update_response.status_code == 200:
                print("✅ Admin can edit expenses successfully")
            else:
                print(f"❌ Failed to edit expense: {update_response.text}")
        
        print("\n🎉 Admin expense management test completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the backend server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    test_admin_expenses()
